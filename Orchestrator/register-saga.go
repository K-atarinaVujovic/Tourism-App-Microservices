package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/google/uuid"
)

// RegistrationRequest is what the client sends to the orchestrator.
// It combines the fields needed by both downstream services.
type RegistrationRequest struct {
	// Auth service fields
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
	// Stakeholder service fields
	Name     string          `json:"name"`
	Lastname *string         `json:"lastname,omitempty"`
	ImageURL *string         `json:"image_url,omitempty"`
	Role     StakeholderRole `json:"role"`
}

// RegistrationResponse is returned to the client on full success.
type RegistrationResponse struct {
	UserID    int64  `json:"user_id"`
	Username  string `json:"username"`
	Email     string `json:"email"`
	Role      string `json:"role"`
	Token     string `json:"token"`
	ProfileID string `json:"profile_id"`
	SagaID    string `json:"saga_id"`
}

// ── DTOs for downstream services ─────────────────────────────────────────────

// authRegisterRequest matches auth_server.go RegisterRequest
type authRegisterRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// authRegisterResponse matches auth_server.go RegisterResponse
type authRegisterResponse struct {
	UserID   int64  `json:"user_id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	Token    string `json:"token"`
}

// stakeholderCreateRequest matches profile.py ProfileCreate schema
type stakeholderCreateRequest struct {
	UserID   int64           `json:"user_id"`
	Name     string          `json:"name"`
	Lastname *string         `json:"lastname,omitempty"`
	ImageURL *string         `json:"imageUrl,omitempty"`
	Role     StakeholderRole `json:"role"`
}

// stakeholderCreateResponse matches profile.py ProfileResponse schema
type stakeholderCreateResponse struct {
	ID     string `json:"id"`
	UserID int64  `json:"user_id"`
	Name   string `json:"name"`
	Role   string `json:"role"`
}

// ── Saga Error ────────────────────────────────────────────────────────────────

type sagaError struct {
	err        error
	statusCode int
	sagaID     string
}

// ── Orchestration ─────────────────────────────────────────────────────────────

// runRegistrationSaga executes the two-step registration saga:
//
//	Step 1: Create auth account   → compensate: DELETE /internal/users/{id}
//	Step 2: Create user profile   → (no compensation needed; it's the final step)
func (s *OrchestratorServer) runRegistrationSaga(
	ctx context.Context,
	payload RegistrationRequest,
) (*RegistrationResponse, *sagaError) {

	payloadJSON, err := json.Marshal(payload)
	if err != nil {
		return nil, &sagaError{
			err:        fmt.Errorf("failed to serialize saga payload: %w", err),
			statusCode: http.StatusInternalServerError,
		}
	}
	// Initialise saga state
	saga := &SagaState{
		ID:     uuid.NewString(),
		Type:   "USER_REGISTRATION",
		Status: SagaStatusPending,
		Steps: []*SagaStep{
			{Name: "CREATE_AUTH_ACCOUNT", Status: StepStatusPending},
			{Name: "CREATE_STAKEHOLDER_PROFILE", Status: StepStatusPending},
		},
		Payload:   payloadJSON,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	s.sagas.Save(saga)
	log.Printf("[SAGA %s] Started USER_REGISTRATION for %s", saga.ID, payload.Email)

	// ── Step 1: Register at Auth Service ─────────────────────────────────────
	authResp, authErr := s.callAuthRegister(ctx, payload)
	if authErr != nil {
		saga.markStepFailed("CREATE_AUTH_ACCOUNT")
		saga.setStatus(SagaStatusFailed)
		s.sagas.Save(saga)
		log.Printf("[SAGA %s] Step 1 failed — no compensation needed: %v", saga.ID, authErr)

		statusCode := http.StatusInternalServerError
		if authErr.Error() == "conflict" {
			statusCode = http.StatusConflict
		}
		return nil, &sagaError{
			err:        fmt.Errorf("registration failed: could not create account"),
			statusCode: statusCode,
			sagaID:     saga.ID,
		}
	}

	saga.markStepSuccess("CREATE_AUTH_ACCOUNT", map[string]any{
		"user_id":  authResp.UserID,
		"username": authResp.Username,
		"role":     authResp.Role,
	})
	s.sagas.Save(saga)
	log.Printf("[SAGA %s] Step 1 succeeded — auth user_id=%d", saga.ID, authResp.UserID)

	// ── Step 2: Create Profile in Stakeholder Service ─────────────────────────
	profileResp, profileErr := s.callStakeholderCreate(ctx, authResp, payload)
	if profileErr != nil {
		saga.markStepFailed("CREATE_STAKEHOLDER_PROFILE")
		saga.setStatus(SagaStatusCompensating)
		s.sagas.Save(saga)
		log.Printf("[SAGA %s] Step 2 failed — compensating step 1 (deleting auth user %d)", saga.ID, authResp.UserID)

		// ── Compensate Step 1 ────────────────────────────────────────────────
		if compErr := s.compensateAuthRegister(ctx, authResp.UserID); compErr != nil {
			saga.setStatus(SagaStatusCompensationFailed)
			s.sagas.Save(saga)
			// The auth account exists but the profile was never created.
			// This requires manual reconciliation — alert your ops team here.
			log.Printf("[SAGA %s] COMPENSATION FAILED for user_id=%d — MANUAL INTERVENTION REQUIRED: %v",
				saga.ID, authResp.UserID, compErr)
			return nil, &sagaError{
				err:        fmt.Errorf("registration failed and automatic rollback failed — please contact support (ref: %s)", saga.ID),
				statusCode: http.StatusInternalServerError,
				sagaID:     saga.ID,
			}
		}

		saga.setStatus(SagaStatusFailed)
		s.sagas.Save(saga)
		log.Printf("[SAGA %s] Compensation succeeded — auth account rolled back", saga.ID)
		return nil, &sagaError{
			err:        fmt.Errorf("registration failed: could not create user profile"),
			statusCode: http.StatusInternalServerError,
			sagaID:     saga.ID,
		}
	}

	saga.markStepSuccess("CREATE_STAKEHOLDER_PROFILE", map[string]any{
		"profile_id": profileResp.ID,
	})
	saga.setStatus(SagaStatusCompleted)
	s.sagas.Save(saga)
	log.Printf("[SAGA %s] Completed — user_id=%d, profile_id=%s", saga.ID, authResp.UserID, profileResp.ID)

	return &RegistrationResponse{
		UserID:    authResp.UserID,
		Username:  authResp.Username,
		Email:     authResp.Email,
		Role:      authResp.Role,
		Token:     authResp.Token,
		ProfileID: profileResp.ID,
		SagaID:    saga.ID,
	}, nil
}

// ── Service Calls ─────────────────────────────────────────────────────────────

func (s *OrchestratorServer) callAuthRegister(
	ctx context.Context,
	payload RegistrationRequest,
) (*authRegisterResponse, error) {
	body, _ := json.Marshal(authRegisterRequest{
		Username: payload.Username,
		Email:    payload.Email,
		Password: payload.Password,
	})
	reply, err := s.messaging.PublishAndWait(ctx, QueueAuthCommands, SagaCommand{
		Command: "REGISTER_USER",
		Payload: body,
	}, 10*time.Second)
	if err != nil {
		return nil, err
	}
	if !reply.Success {
		return nil, errors.New(reply.Error) // "conflict" preserved as-is from auth consumer
	}
	var result authRegisterResponse
	json.Unmarshal(reply.Payload, &result)
	return &result, nil
}

func (s *OrchestratorServer) callStakeholderCreate(
	ctx context.Context,
	authResp *authRegisterResponse,
	payload RegistrationRequest,
) (*stakeholderCreateResponse, error) {
	body, _ := json.Marshal(stakeholderCreateRequest{
		UserID:   authResp.UserID,
		Name:     payload.Name,
		Lastname: payload.Lastname,
		ImageURL: payload.ImageURL,
		Role:     payload.Role,
	})
	reply, err := s.messaging.PublishAndWait(ctx, QueueStakeholderCommands, SagaCommand{
		Command: "CREATE_PROFILE",
		Payload: body,
	}, 10*time.Second)
	if err != nil {
		return nil, err
	}
	if !reply.Success {
		return nil, fmt.Errorf("%s", reply.Error)
	}
	var result stakeholderCreateResponse
	json.Unmarshal(reply.Payload, &result)
	return &result, nil
}

func (s *OrchestratorServer) compensateAuthRegister(ctx context.Context, userID int64) error {
	payload, _ := json.Marshal(map[string]int64{"user_id": userID})
	reply, err := s.messaging.PublishAndWait(ctx, QueueAuthCommands, SagaCommand{
		Command:    "DELETE_USER",
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
