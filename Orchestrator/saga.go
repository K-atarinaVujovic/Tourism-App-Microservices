package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/google/uuid"
)

// ── Saga State ────────────────────────────────────────────────────────────────

type SagaStatus string
type StepStatus string

const (
	SagaStatusPending            SagaStatus = "PENDING"
	SagaStatusCompleted          SagaStatus = "COMPLETED"
	SagaStatusCompensating       SagaStatus = "COMPENSATING"
	SagaStatusFailed             SagaStatus = "FAILED"
	SagaStatusCompensationFailed SagaStatus = "COMPENSATION_FAILED"

	StepStatusPending StepStatus = "PENDING"
	StepStatusSuccess StepStatus = "SUCCESS"
	StepStatusFailed  StepStatus = "FAILED"
)

type SagaStep struct {
	Name   string     `json:"name"`
	Status StepStatus `json:"status"`
	// Result holds whatever the step returned (e.g. user_id from auth service).
	// Stored so compensation steps have access to IDs they need to roll back.
	Result map[string]any `json:"result,omitempty"`
}

type SagaState struct {
	mu        sync.Mutex
	ID        string              `json:"id"`
	Type      string              `json:"type"`
	Status    SagaStatus          `json:"status"`
	Steps     []*SagaStep         `json:"steps"`
	Payload   RegistrationRequest `json:"payload"`
	CreatedAt time.Time           `json:"created_at"`
	UpdatedAt time.Time           `json:"updated_at"`
}

func (s *SagaState) stepByName(name string) *SagaStep {
	for _, step := range s.Steps {
		if step.Name == name {
			return step
		}
	}
	return nil
}

func (s *SagaState) markStepSuccess(name string, result map[string]any) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if step := s.stepByName(name); step != nil {
		step.Status = StepStatusSuccess
		step.Result = result
	}
	s.UpdatedAt = time.Now()
}

func (s *SagaState) markStepFailed(name string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if step := s.stepByName(name); step != nil {
		step.Status = StepStatusFailed
	}
	s.UpdatedAt = time.Now()
}

func (s *SagaState) setStatus(status SagaStatus) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.Status = status
	s.UpdatedAt = time.Now()
}

// ── Saga Store (in-memory) ────────────────────────────────────────────────────
// NOTE: For production, replace this with a persistent store (Postgres, Redis).
// If the orchestrator crashes mid-saga, in-flight sagas can't be recovered from
// memory. A DB-backed store would allow a recovery worker to resume or compensate.

type SagaStore struct {
	mu    sync.RWMutex
	store map[string]*SagaState
}

func NewSagaStore() *SagaStore {
	return &SagaStore{store: make(map[string]*SagaState)}
}

func (ss *SagaStore) Save(saga *SagaState) {
	ss.mu.Lock()
	defer ss.mu.Unlock()
	ss.store[saga.ID] = saga
}

func (ss *SagaStore) Get(id string) (*SagaState, bool) {
	ss.mu.RLock()
	defer ss.mu.RUnlock()
	s, ok := ss.store[id]
	return s, ok
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
	UserID   int64   `json:"user_id"`
	Name     string  `json:"name"`
	Lastname *string `json:"lastname,omitempty"`
	ImageURL *string `json:"imageUrl,omitempty"`
	Role     string  `json:"role"`
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

	// Initialise saga state
	saga := &SagaState{
		ID:     uuid.NewString(),
		Type:   "USER_REGISTRATION",
		Status: SagaStatusPending,
		Steps: []*SagaStep{
			{Name: "CREATE_AUTH_ACCOUNT", Status: StepStatusPending},
			{Name: "CREATE_STAKEHOLDER_PROFILE", Status: StepStatusPending},
		},
		Payload:   payload,
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

	resp, err := s.doPost(ctx, s.config.AuthServiceURL+"/auth/register", body, false)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusConflict {
		return nil, errors.New("conflict")
	}
	if resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("auth service returned %d", resp.StatusCode)
	}

	var result authRegisterResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode auth response: %w", err)
	}
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
		Role:     authResp.Role,
	})

	resp, err := s.doPost(ctx, s.config.StakeholderServiceURL+"/profiles/create", body, false)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("stakeholder service returned %d", resp.StatusCode)
	}

	var result stakeholderCreateResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode stakeholder response: %w", err)
	}
	return &result, nil
}

// compensateAuthRegister calls the compensation endpoint on the auth service
// to delete the auth account that was created in step 1.
// The endpoint is protected by a shared internal secret header.
func (s *OrchestratorServer) compensateAuthRegister(ctx context.Context, userID int64) error {
	url := fmt.Sprintf("%s/internal/users/%d", s.config.AuthServiceURL, userID)

	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, url, nil)
	if err != nil {
		return fmt.Errorf("failed to build compensation request: %w", err)
	}
	req.Header.Set("X-Internal-Secret", s.config.InternalSecret)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("compensation request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		// Already gone — idempotent success
		return nil
	}
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNoContent {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("compensation returned %d: %s", resp.StatusCode, string(body))
	}
	return nil
}

// ── HTTP helper ───────────────────────────────────────────────────────────────

func (s *OrchestratorServer) doPost(
	ctx context.Context,
	url string,
	body []byte,
	withInternalSecret bool,
) (*http.Response, error) {

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("failed to build request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	if withInternalSecret {
		req.Header.Set("X-Internal-Secret", s.config.InternalSecret)
	}

	return s.httpClient.Do(req)
}
