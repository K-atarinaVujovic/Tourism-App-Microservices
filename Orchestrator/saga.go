package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"
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
	ID        string          `json:"id"`
	Type      string          `json:"type"`
	Status    SagaStatus      `json:"status"`
	Steps     []*SagaStep     `json:"steps"`
	Payload   json.RawMessage `json:"payload"`
	CreatedAt time.Time       `json:"created_at"`
	UpdatedAt time.Time       `json:"updated_at"`
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
