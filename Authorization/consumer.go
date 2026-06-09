package main

import (
	"context"
	"encoding/json"
	"log"

	amqp "github.com/rabbitmq/amqp091-go"
)

const QueueAuthCommands = "saga.auth.commands"

type SagaCommand struct {
	Command    string          `json:"command"`
	IsInternal bool            `json:"is_internal"`
	Payload    json.RawMessage `json:"payload"`
}

type SagaReply struct {
	Success bool            `json:"success"`
	Error   string          `json:"error,omitempty"`
	Payload json.RawMessage `json:"payload,omitempty"`
}

type AuthConsumer struct {
	conn *amqp.Connection
	ch   *amqp.Channel
	srv  *Server
}

func NewAuthConsumer(amqpURL string, srv *Server) (*AuthConsumer, error) {
	conn, err := amqp.Dial(amqpURL)
	if err != nil {
		return nil, err
	}
	ch, err := conn.Channel()
	if err != nil {
		return nil, err
	}
	if _, err := ch.QueueDeclare(QueueAuthCommands, true, false, false, false, nil); err != nil {
		return nil, err
	}
	ch.Qos(1, 0, false)
	return &AuthConsumer{conn: conn, ch: ch, srv: srv}, nil
}

func (c *AuthConsumer) Start() {
	msgs, _ := c.ch.Consume(QueueAuthCommands, "", false, false, false, false, nil)
	log.Println("[MQ] Auth consumer started")
	for d := range msgs {
		go c.handle(d)
	}
}

func (c *AuthConsumer) Close() {
	c.ch.Close()
	c.conn.Close()
}

func (c *AuthConsumer) handle(d amqp.Delivery) {
	var cmd SagaCommand
	if err := json.Unmarshal(d.Body, &cmd); err != nil {
		c.reply(d, SagaReply{Success: false, Error: "invalid command payload"})
		d.Nack(false, false)
		return
	}

	var reply SagaReply
	switch cmd.Command {
	case "REGISTER_USER":
		reply = c.handleRegister(cmd)
	case "DELETE_USER":
		reply = c.handleDelete(cmd)
	default:
		reply = SagaReply{Success: false, Error: "unknown command: " + cmd.Command}
	}

	c.reply(d, reply)
	d.Ack(false)
}

func (c *AuthConsumer) handleRegister(cmd SagaCommand) SagaReply {
	var req RegisterRequest
	if err := json.Unmarshal(cmd.Payload, &req); err != nil {
		return SagaReply{Success: false, Error: "invalid payload"}
	}
	result, err := c.srv.registerUser(context.Background(), req)
	if err != nil {
		return SagaReply{Success: false, Error: err.Error()}
	}
	payload, _ := json.Marshal(result)
	return SagaReply{Success: true, Payload: payload}
}

func (c *AuthConsumer) handleDelete(cmd SagaCommand) SagaReply {
	if !cmd.IsInternal {
		return SagaReply{Success: false, Error: "unauthorized: internal only"}
	}
	var req struct {
		UserID int64 `json:"user_id"`
	}
	if err := json.Unmarshal(cmd.Payload, &req); err != nil {
		return SagaReply{Success: false, Error: "invalid payload"}
	}
	if err := c.srv.deleteUser(context.Background(), req.UserID); err != nil {
		return SagaReply{Success: false, Error: err.Error()}
	}
	return SagaReply{Success: true}
}

func (c *AuthConsumer) reply(d amqp.Delivery, reply SagaReply) {
	body, _ := json.Marshal(reply)
	c.ch.Publish("", d.ReplyTo, false, false, amqp.Publishing{
		ContentType:   "application/json",
		CorrelationId: d.CorrelationId,
		Body:          body,
	})
}
