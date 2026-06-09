package consumer

import (
	"context"
	"encoding/json"
	"log"

	grpcauth "purchase-service/internal/grpc-auth"
	"purchase-service/internal/service"

	amqp "github.com/rabbitmq/amqp091-go"
)

const QueuePurchaseCommands = "saga.purchase.commands"

type SagaCommand struct {
	Command    string          `json:"command"`
	AuthHeader string          `json:"auth_header,omitempty"`
	IsInternal bool            `json:"is_internal"`
	Payload    json.RawMessage `json:"payload"`
}

type SagaReply struct {
	Success bool            `json:"success"`
	Error   string          `json:"error,omitempty"`
	Payload json.RawMessage `json:"payload,omitempty"`
}

type PurchaseConsumer struct {
	conn *amqp.Connection
	ch   *amqp.Channel
	svc  *service.PurchaseService
}

func New(amqpURL string, svc *service.PurchaseService) (*PurchaseConsumer, error) {
	conn, err := amqp.Dial(amqpURL)
	if err != nil {
		return nil, err
	}
	ch, err := conn.Channel()
	if err != nil {
		return nil, err
	}
	if _, err := ch.QueueDeclare(QueuePurchaseCommands, true, false, false, false, nil); err != nil {
		return nil, err
	}
	// Process one message at a time per goroutine
	ch.Qos(1, 0, false)
	return &PurchaseConsumer{conn: conn, ch: ch, svc: svc}, nil
}

func (c *PurchaseConsumer) Start() {
	msgs, _ := c.ch.Consume(QueuePurchaseCommands, "", false, false, false, false, nil)
	log.Println("[MQ] Purchase consumer started")
	for d := range msgs {
		go c.handle(d)
	}
}

func (c *PurchaseConsumer) Close() {
	c.ch.Close()
	c.conn.Close()
}

func (c *PurchaseConsumer) handle(d amqp.Delivery) {
	var cmd SagaCommand
	if err := json.Unmarshal(d.Body, &cmd); err != nil {
		c.reply(d, SagaReply{Success: false, Error: "invalid command payload"})
		d.Nack(false, false)
		return
	}

	var reply SagaReply
	switch cmd.Command {
	case "GET_CART_PRICE":
		reply = c.handleGetCartPrice(cmd)
	case "FINALIZE_CHECKOUT":
		reply = c.handleFinalizeCheckout(cmd)
	case "DELETE_CHECKOUT_TOKENS":
		reply = c.handleDeleteCheckoutTokens(cmd)
	default:
		reply = SagaReply{Success: false, Error: "unknown command: " + cmd.Command}
	}

	c.reply(d, reply)
	d.Ack(false)
}

func (c *PurchaseConsumer) handleGetCartPrice(cmd SagaCommand) SagaReply {
	var req struct {
		TouristID string `json:"tourist_id"`
	}
	if err := json.Unmarshal(cmd.Payload, &req); err != nil {
		return SagaReply{Success: false, Error: "invalid payload"}
	}
	ctx := grpcauth.NewAuthContext(context.Background(), cmd.AuthHeader)
	total, isEmpty, err := c.svc.GetCartPrice(ctx, req.TouristID)
	if err != nil {
		return SagaReply{Success: false, Error: err.Error()}
	}
	payload, _ := json.Marshal(map[string]any{"total_price": total, "is_empty": isEmpty})
	return SagaReply{Success: true, Payload: payload}
}

func (c *PurchaseConsumer) handleFinalizeCheckout(cmd SagaCommand) SagaReply {
	var req struct {
		TouristID string `json:"tourist_id"`
	}
	if err := json.Unmarshal(cmd.Payload, &req); err != nil {
		return SagaReply{Success: false, Error: "invalid payload"}
	}
	ctx := grpcauth.NewAuthContext(context.Background(), cmd.AuthHeader)
	tokens, err := c.svc.FinalizeCheckout(ctx, req.TouristID)
	if err != nil {
		return SagaReply{Success: false, Error: err.Error()}
	}
	payload, _ := json.Marshal(map[string]any{"tokens": tokens})
	return SagaReply{Success: true, Payload: payload}
}

func (c *PurchaseConsumer) handleDeleteCheckoutTokens(cmd SagaCommand) SagaReply {
	if !cmd.IsInternal {
		return SagaReply{Success: false, Error: "unauthorized: internal only"}
	}
	var req struct {
		TokenIDs []string `json:"token_ids"`
	}
	if err := json.Unmarshal(cmd.Payload, &req); err != nil {
		return SagaReply{Success: false, Error: "invalid payload"}
	}
	ctx := grpcauth.NewInternalContext(context.Background())
	if err := c.svc.DeleteCheckoutTokens(ctx, req.TokenIDs); err != nil {
		return SagaReply{Success: false, Error: err.Error()}
	}
	return SagaReply{Success: true}
}

func (c *PurchaseConsumer) reply(d amqp.Delivery, reply SagaReply) {
	body, _ := json.Marshal(reply)
	c.ch.Publish("", d.ReplyTo, false, false, amqp.Publishing{
		ContentType:   "application/json",
		CorrelationId: d.CorrelationId,
		Body:          body,
	})
}
