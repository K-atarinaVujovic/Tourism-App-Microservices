package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/google/uuid"
)

// ── DTOs ──────────────────────────────────────────────────────────────────────

type CheckoutRequest struct {
	TouristID string `json:"tourist_id"`
}

type CheckoutResponse struct {
	Tokens []checkoutTokenDTO `json:"tokens"`
	SagaID string             `json:"saga_id"`
}

type checkoutTokenDTO struct {
	ID        string  `json:"id"`
	TouristID string  `json:"tourist_id"`
	TourID    string  `json:"tour_id"`
	Price     float64 `json:"price"`
	IssuedAt  string  `json:"issued_at"`
}

type balanceUpdateRequest struct {
	Balance float64 `json:"balance"`
}

// ── Orchestration ─────────────────────────────────────────────────────────────

// RunCheckoutSaga executes the three-step checkout saga:
//
//	Step 1 — GetCartPrice     (gRPC, read-only — no compensation needed)
//	Step 2 — DeductBalance    (REST, bearer token — compensate: RefundBalance with internal secret)
//	Step 3 — FinalizeCheckout (gRPC, bearer token — compensate: DeleteCheckoutTokens with internal secret)
func (s *OrchestratorServer) RunCheckoutSaga(
	ctx context.Context,
	touristID string,
	authHeader string,
) (*CheckoutResponse, *sagaError) {

	payloadJSON, _ := json.Marshal(map[string]string{"tourist_id": touristID})

	saga := &SagaState{
		ID:     uuid.NewString(),
		Type:   "CHECKOUT",
		Status: SagaStatusPending,
		Steps: []*SagaStep{
			{Name: "GET_CART_PRICE", Status: StepStatusPending},
			{Name: "DEDUCT_BALANCE", Status: StepStatusPending},
			{Name: "FINALIZE_CHECKOUT", Status: StepStatusPending},
		},
		Payload:   payloadJSON,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	s.sagas.Save(saga)
	log.Printf("[SAGA %s] Started CHECKOUT for tourist_id=%s", saga.ID, touristID)

	// ── Step 1: Get cart price (read-only, no compensation needed) ────────────
	totalPrice, isEmpty, priceErr := s.callGetCartPrice(ctx, touristID, authHeader)
	if priceErr != nil {
		saga.markStepFailed("GET_CART_PRICE")
		saga.setStatus(SagaStatusFailed)
		s.sagas.Save(saga)
		log.Printf("[SAGA %s] Step 1 failed: %v", saga.ID, priceErr)
		return nil, &sagaError{
			err:        fmt.Errorf("checkout failed: could not retrieve cart"),
			statusCode: http.StatusInternalServerError,
			sagaID:     saga.ID,
		}
	}
	if isEmpty {
		saga.markStepFailed("GET_CART_PRICE")
		saga.setStatus(SagaStatusFailed)
		s.sagas.Save(saga)
		return nil, &sagaError{
			err:        fmt.Errorf("checkout failed: cart is empty"),
			statusCode: http.StatusBadRequest,
			sagaID:     saga.ID,
		}
	}

	saga.markStepSuccess("GET_CART_PRICE", map[string]any{"total_price": totalPrice})
	s.sagas.Save(saga)
	log.Printf("[SAGA %s] Step 1 succeeded — total_price=%.2f", saga.ID, totalPrice)

	// ── Step 2: Deduct balance (REST, bearer token) ───────────────────────────
	if deductErr := s.callDeductBalance(ctx, touristID, totalPrice, authHeader); deductErr != nil {
		saga.markStepFailed("DEDUCT_BALANCE")
		saga.setStatus(SagaStatusFailed)
		s.sagas.Save(saga)
		log.Printf("[SAGA %s] Step 2 failed — no compensation needed: %v", saga.ID, deductErr)

		statusCode := http.StatusInternalServerError
		if deductErr.Error() == "insufficient balance" {
			statusCode = http.StatusPaymentRequired
		}
		return nil, &sagaError{
			err:        fmt.Errorf("checkout failed: %s", deductErr.Error()),
			statusCode: statusCode,
			sagaID:     saga.ID,
		}
	}

	saga.markStepSuccess("DEDUCT_BALANCE", map[string]any{"amount": totalPrice})
	s.sagas.Save(saga)
	log.Printf("[SAGA %s] Step 2 succeeded — deducted %.2f from tourist %s", saga.ID, totalPrice, touristID)

	// ── Step 3: Finalize checkout (gRPC, bearer token) ────────────────────────
	tokens, finalizeErr := s.callFinalizeCheckout(ctx, touristID, authHeader)
	if finalizeErr != nil {
		saga.markStepFailed("FINALIZE_CHECKOUT")
		saga.setStatus(SagaStatusCompensating)
		s.sagas.Save(saga)
		log.Printf("[SAGA %s] Step 3 failed — compensating step 2 (refunding %.2f to tourist %s)",
			saga.ID, totalPrice, touristID)

		if compErr := s.compensateDeductBalance(ctx, touristID, totalPrice); compErr != nil {
			saga.setStatus(SagaStatusCompensationFailed)
			s.sagas.Save(saga)
			log.Printf("[SAGA %s] COMPENSATION FAILED for tourist_id=%s — MANUAL INTERVENTION REQUIRED: %v",
				saga.ID, touristID, compErr)
			return nil, &sagaError{
				err:        fmt.Errorf("checkout failed and automatic rollback failed — please contact support (ref: %s)", saga.ID),
				statusCode: http.StatusInternalServerError,
				sagaID:     saga.ID,
			}
		}

		saga.setStatus(SagaStatusFailed)
		s.sagas.Save(saga)
		log.Printf("[SAGA %s] Compensation succeeded — balance refunded", saga.ID)
		return nil, &sagaError{
			err:        fmt.Errorf("checkout failed: could not finalize purchase"),
			statusCode: http.StatusInternalServerError,
			sagaID:     saga.ID,
		}
	}

	tokenIDs := make([]string, len(tokens))
	for i, t := range tokens {
		tokenIDs[i] = t.ID
	}
	saga.markStepSuccess("FINALIZE_CHECKOUT", map[string]any{"token_ids": tokenIDs})
	saga.setStatus(SagaStatusCompleted)
	s.sagas.Save(saga)
	log.Printf("[SAGA %s] Completed — %d tokens issued for tourist %s", saga.ID, len(tokens), touristID)

	return &CheckoutResponse{Tokens: tokens, SagaID: saga.ID}, nil
}

// ── MQ calls (purchase service) ────────────────────────────────────────────

func (s *OrchestratorServer) callGetCartPrice(ctx context.Context, touristID, authHeader string) (float64, bool, error) {
	payload, _ := json.Marshal(map[string]string{"tourist_id": touristID})
	reply, err := s.messaging.PublishAndWait(ctx, QueuePurchaseCommands, SagaCommand{
		Command:    "GET_CART_PRICE",
		AuthHeader: authHeader,
		Payload:    payload,
	}, 10*time.Second)
	if err != nil {
		return 0, false, err
	}
	if !reply.Success {
		return 0, false, fmt.Errorf("%s", reply.Error)
	}
	var result struct {
		TotalPrice float64 `json:"total_price"`
		IsEmpty    bool    `json:"is_empty"`
	}
	json.Unmarshal(reply.Payload, &result)
	return result.TotalPrice, result.IsEmpty, nil
}

func (s *OrchestratorServer) callFinalizeCheckout(ctx context.Context, touristID, authHeader string) ([]checkoutTokenDTO, error) {
	payload, _ := json.Marshal(map[string]string{"tourist_id": touristID})
	reply, err := s.messaging.PublishAndWait(ctx, QueuePurchaseCommands, SagaCommand{
		Command:    "FINALIZE_CHECKOUT",
		AuthHeader: authHeader,
		Payload:    payload,
	}, 15*time.Second)
	if err != nil {
		return nil, err
	}
	if !reply.Success {
		return nil, fmt.Errorf("%s", reply.Error)
	}
	var result struct {
		Tokens []checkoutTokenDTO `json:"tokens"`
	}
	json.Unmarshal(reply.Payload, &result)
	return result.Tokens, nil
}

func (s *OrchestratorServer) callDeleteCheckoutTokens(ctx context.Context, tokenIDs []string) error {
	payload, _ := json.Marshal(map[string]any{"token_ids": tokenIDs})
	reply, err := s.messaging.PublishAndWait(ctx, QueuePurchaseCommands, SagaCommand{
		Command:    "DELETE_CHECKOUT_TOKENS",
		IsInternal: true,
		Payload:    payload,
	}, 10*time.Second)
	if err != nil {
		return err
	}
	if !reply.Success {
		return fmt.Errorf("%s", reply.Error)
	}
	return nil
}

// ── MQ calls (stakeholder service) ─────────────────────────────────────────

// Note: touristID is now required since MQ can't extract it from the JWT implicitly.
func (s *OrchestratorServer) callDeductBalance(ctx context.Context, touristID string, amount float64, authHeader string) error {
	payload, _ := json.Marshal(map[string]any{"tourist_id": touristID, "amount": amount})
	reply, err := s.messaging.PublishAndWait(ctx, QueueStakeholderCommands, SagaCommand{
		Command:    "DEDUCT_BALANCE",
		AuthHeader: authHeader,
		Payload:    payload,
	}, 10*time.Second)
	if err != nil {
		return err
	}
	if !reply.Success {
		return fmt.Errorf("%s", reply.Error)
	}
	return nil
}

func (s *OrchestratorServer) compensateDeductBalance(ctx context.Context, touristID string, amount float64) error {
	payload, _ := json.Marshal(map[string]any{"tourist_id": touristID, "amount": amount})
	reply, err := s.messaging.PublishAndWait(ctx, QueueStakeholderCommands, SagaCommand{
		Command:    "REFUND_BALANCE",
		IsInternal: true,
		Payload:    payload,
	}, 10*time.Second)
	if err != nil {
		return err
	}
	if !reply.Success {
		return fmt.Errorf("%s", reply.Error)
	}
	return nil
}
