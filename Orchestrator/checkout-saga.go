package main

import (
	pb "Orchestrator/pb/purchase"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/google/uuid"
	"google.golang.org/grpc/metadata"
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
	if deductErr := s.callDeductBalance(ctx, totalPrice, authHeader); deductErr != nil {
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

// ── gRPC calls (purchase service) ────────────────────────────────────────────

func (s *OrchestratorServer) callGetCartPrice(ctx context.Context, touristID, authHeader string) (float64, bool, error) {
	outCtx := metadata.NewOutgoingContext(ctx, metadata.Pairs("authorization", authHeader))
	resp, err := s.purchaseClient.GetCartPrice(outCtx, &pb.GetCartPriceRequest{TouristId: touristID})
	if err != nil {
		return 0, false, fmt.Errorf("GetCartPrice failed: %w", err)
	}
	return resp.TotalPrice, resp.IsEmpty, nil
}

func (s *OrchestratorServer) callFinalizeCheckout(ctx context.Context, touristID, authHeader string) ([]checkoutTokenDTO, error) {
	outCtx := metadata.NewOutgoingContext(ctx, metadata.Pairs("authorization", authHeader))
	resp, err := s.purchaseClient.FinalizeCheckout(outCtx, &pb.FinalizeCheckoutRequest{TouristId: touristID})
	if err != nil {
		return nil, fmt.Errorf("FinalizeCheckout failed: %w", err)
	}
	var tokens []checkoutTokenDTO
	for _, t := range resp.Tokens {
		tokens = append(tokens, checkoutTokenDTO{
			ID:        t.Id,
			TouristID: t.TouristId,
			TourID:    t.TourId,
			Price:     t.Price,
			IssuedAt:  t.IssuedAt,
		})
	}
	return tokens, nil
}

func (s *OrchestratorServer) callDeleteCheckoutTokens(ctx context.Context, tokenIDs []string) error {
	outCtx := metadata.NewOutgoingContext(ctx, metadata.Pairs("x-internal-secret", s.config.InternalSecret))
	_, err := s.purchaseClient.DeleteCheckoutTokens(outCtx, &pb.DeleteCheckoutTokensRequest{TokenIds: tokenIDs})
	if err != nil {
		return fmt.Errorf("DeleteCheckoutTokens failed: %w", err)
	}
	return nil
}

// ── REST calls (stakeholder service) ─────────────────────────────────────────

func (s *OrchestratorServer) callDeductBalance(ctx context.Context, amount float64, authHeader string) error {
	body, _ := json.Marshal(balanceUpdateRequest{Balance: -amount})
	resp, err := s.doPut(ctx, s.config.StakeholderServiceURL+"/profiles/balance", body, authHeader, false)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusBadRequest {
		return fmt.Errorf("insufficient balance")
	}
	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("stakeholder service returned %d: %s", resp.StatusCode, string(b))
	}
	return nil
}

// compensateDeductBalance refunds the tourist's balance using the internal secret.
// stakeholders side of internal secret is not implemented as of time of writing
func (s *OrchestratorServer) compensateDeductBalance(ctx context.Context, touristID string, amount float64) error {
	body, _ := json.Marshal(balanceUpdateRequest{Balance: amount})
	url := fmt.Sprintf("%s/profiles/balance/%s", s.config.StakeholderServiceURL, touristID)
	resp, err := s.doPut(ctx, url, body, "", true)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return nil // profile gone — idempotent success
	}
	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("compensation returned %d: %s", resp.StatusCode, string(b))
	}
	return nil
}
