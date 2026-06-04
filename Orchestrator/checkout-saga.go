package main

import (
	"Orchestrator/domain"
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
)

type CheckoutResponse struct {
	Balance float64                    `json:"balance"`
	Tokens  []domain.TourPurchaseToken `json:"tokens"`
}

// ── Saga status / step enums ──────────────────────────────────────────────────

// ── Orchestration ─────────────────────────────────────────────────────────────

// RunCheckoutSaga replaces the old monolithic Checkout method.
// It executes the three-step checkout saga with full compensation:
//
//	Step 1 — GetCheckoutPrice  (read-only, no compensation needed)
//	Step 2 — DeductBalance     (compensate: RefundBalance)
//	Step 3 — FinalizeCheckout  (compensate: DeleteTokens — only if partially written)
//
// The auth header is forwarded from the gRPC context to all outbound HTTP calls
// exactly as the existing service methods do.
func (s *OrchestratorServer) RunCheckoutSaga(ctx context.Context, touristID string) ([]domain.TourPurchaseToken, error) {

	saga := &SagaState{
		ID:     uuid.NewString(),
		Type:   "CHECKOUT",
		Status: SagaStatusPending,
		Steps: []*SagaStep{
			{Name: "CREATE_AUTH_ACCOUNT", Status: StepStatusPending},
			{Name: "CREATE_STAKEHOLDER_PROFILE", Status: StepStatusPending},
		},
		Payload:   payloadJSON,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

}

// ErrInsufficientBalance is a sentinel that lets the gRPC handler return a
// cleaner status code (codes.FailedPrecondition) instead of a generic error.
var ErrInsufficientBalance = errors.New("insufficient balance")
