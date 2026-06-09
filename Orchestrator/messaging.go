package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/google/uuid"
	amqp "github.com/rabbitmq/amqp091-go"
)

const (
	QueuePurchaseCommands    = "saga.purchase.commands"
	QueueStakeholderCommands = "saga.stakeholder.commands"
)

// SagaCommand is published by the orchestrator onto a service's command queue.
type SagaCommand struct {
	Command    string          `json:"command"`
	AuthHeader string          `json:"auth_header,omitempty"` // forwarded for forward steps
	IsInternal bool            `json:"is_internal"`           // true for compensation steps
	Payload    json.RawMessage `json:"payload"`
}

// SagaReply is published by the service back to the orchestrator's reply queue.
type SagaReply struct {
	Success bool            `json:"success"`
	Error   string          `json:"error,omitempty"`
	Payload json.RawMessage `json:"payload,omitempty"`
}

type MessagingClient struct {
	ch         *amqp.Channel
	conn       *amqp.Connection
	replyQueue string
	pending    sync.Map // correlationID (string) → chan SagaReply
}

func NewMessagingClient(amqpURL string) (*MessagingClient, error) {
	conn, err := amqp.Dial(amqpURL)
	if err != nil {
		return nil, fmt.Errorf("rabbitmq dial failed: %w", err)
	}

	ch, err := conn.Channel()
	if err != nil {
		return nil, fmt.Errorf("failed to open channel: %w", err)
	}

	// Declare command queues (durable, idempotent)
	for _, q := range []string{QueuePurchaseCommands, QueueStakeholderCommands} {
		if _, err := ch.QueueDeclare(q, true, false, false, false, nil); err != nil {
			return nil, fmt.Errorf("failed to declare queue %s: %w", q, err)
		}
	}

	// Exclusive, auto-delete reply queue for this orchestrator instance
	replyQ, err := ch.QueueDeclare("", false, true, true, false, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to declare reply queue: %w", err)
	}

	mc := &MessagingClient{conn: conn, ch: ch, replyQueue: replyQ.Name}

	replies, err := ch.Consume(replyQ.Name, "", true, true, false, false, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to start reply consumer: %w", err)
	}
	go mc.dispatchReplies(replies)

	log.Printf("[MQ] Orchestrator reply queue: %s", replyQ.Name)
	return mc, nil
}

// dispatchReplies fans incoming reply messages out to whichever PublishAndWait is waiting.
func (mc *MessagingClient) dispatchReplies(deliveries <-chan amqp.Delivery) {
	for d := range deliveries {
		if v, ok := mc.pending.Load(d.CorrelationId); ok {
			var reply SagaReply
			if err := json.Unmarshal(d.Body, &reply); err != nil {
				log.Printf("[MQ] Failed to unmarshal reply (correlation=%s): %v", d.CorrelationId, err)
				continue
			}
			v.(chan SagaReply) <- reply
		}
	}
}

// PublishAndWait publishes a command and blocks until a matching reply arrives or timeout.
func (mc *MessagingClient) PublishAndWait(
	ctx context.Context,
	queue string,
	cmd SagaCommand,
	timeout time.Duration,
) (*SagaReply, error) {
	correlationID := uuid.NewString()
	replyCh := make(chan SagaReply, 1)
	mc.pending.Store(correlationID, replyCh)
	defer mc.pending.Delete(correlationID)

	body, err := json.Marshal(cmd)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal command: %w", err)
	}

	if err := mc.ch.PublishWithContext(ctx, "", queue, false, false, amqp.Publishing{
		ContentType:   "application/json",
		CorrelationId: correlationID,
		ReplyTo:       mc.replyQueue,
		Body:          body,
	}); err != nil {
		return nil, fmt.Errorf("publish failed: %w", err)
	}

	select {
	case reply := <-replyCh:
		return &reply, nil
	case <-time.After(timeout):
		return nil, fmt.Errorf("timeout waiting for reply from %s (command=%s)", queue, cmd.Command)
	case <-ctx.Done():
		return nil, ctx.Err()
	}
}

func (mc *MessagingClient) Close() {
	mc.ch.Close()
	mc.conn.Close()
}
