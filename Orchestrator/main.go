package main

import (
	pb "Orchestrator/pb/purchase"

	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/joho/godotenv"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

// Config holds all service URLs and secrets loaded from environment variables.
// In Docker, set these via the `environment:` block in docker-compose.yml.
type Config struct {
	AuthServiceURL         string // e.g. http://auth-service:8080
	StakeholderServiceURL  string // e.g. http://stakeholder-service:8081
	StakeholderServiceAddr string
	PurchaseServiceAddr    string // e.g. purchase-service:50051
	InternalSecret         string // Shared secret for internal compensation calls
	Port                   string
}

type OrchestratorServer struct {
	config         Config
	httpClient     *http.Client
	sagas          *SagaStore
	purchaseClient pb.PurchaseServiceClient
}

type StakeholderRole string

const (
	RoleTourist StakeholderRole = "tourist"
	RoleGuide   StakeholderRole = "guide"
)

func (r StakeholderRole) isValid() bool {
	return r == RoleTourist || r == RoleGuide
}

func main() {
	if os.Getenv("USE_CONFIG_FILE") == "true" {
		log.Println("Loading config from .env file")
		if err := godotenv.Load(); err != nil {
			log.Println("No .env file found, falling back to environment variables")
		}
	}

	cfg := Config{
		AuthServiceURL:        mustEnv("AUTH_SERVICE_URL"),
		StakeholderServiceURL: mustEnv("STAKEHOLDER_SERVICE_URL"),
		PurchaseServiceAddr:   mustEnv("PURCHASE_SERVICE_ADDR"),
		InternalSecret:        mustEnv("INTERNAL_SECRET"),
		Port:                  getEnv("PORT", "8082"),
	}

	// gRPC client
	purchaseConn, err := grpc.NewClient(cfg.PurchaseServiceAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("failed to connect to purchase service: %v", err)
	}

	defer purchaseConn.Close()

	srv := &OrchestratorServer{
		config:         cfg,
		httpClient:     &http.Client{Timeout: 10 * time.Second},
		sagas:          NewSagaStore(),
		purchaseClient: pb.NewPurchaseServiceClient(purchaseConn),
	}

	router := chi.NewRouter()
	router.Get("/health", srv.healthHandler)
	router.Post("/register", srv.registerHandler)
	router.Post("/checkout", srv.checkoutHandler)

	log.Printf("Saga orchestrator listening on :%s", cfg.Port)
	log.Fatal(http.ListenAndServe(":"+cfg.Port, router))
}

func (s *OrchestratorServer) healthHandler(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (s *OrchestratorServer) registerHandler(w http.ResponseWriter, r *http.Request) {
	var req RegistrationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}

	if req.Username == "" || req.Email == "" || req.Password == "" || req.Name == "" {
		writeError(w, http.StatusBadRequest, "username, email, password and name are required")
		return
	}

	if !req.Role.isValid() {
		writeError(w, http.StatusBadRequest,
			fmt.Sprintf("role must be one of: %q, %q", RoleTourist, RoleGuide))
		return
	}

	result, sagaErr := s.runRegistrationSaga(r.Context(), req)
	if sagaErr != nil {
		log.Printf("[SAGA] Registration failed: %v (saga_id=%s)", sagaErr.err, sagaErr.sagaID)
		writeError(w, sagaErr.statusCode, sagaErr.err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, result)
}

func (s *OrchestratorServer) checkoutHandler(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		writeError(w, http.StatusUnauthorized, "missing authorization header")
		return
	}

	var req CheckoutRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}
	if req.TouristID == "" {
		writeError(w, http.StatusBadRequest, "tourist_id is required")
		return
	}

	result, sagaErr := s.RunCheckoutSaga(r.Context(), req.TouristID, authHeader)
	if sagaErr != nil {
		log.Printf("[SAGA] Checkout failed: %v (saga_id=%s)", sagaErr.err, sagaErr.sagaID)
		writeError(w, sagaErr.statusCode, sagaErr.err.Error())
		return
	}

	writeJSON(w, http.StatusOK, result)
}

// ── Helpers ──────────────────────────────────────────────────────────────────

func mustEnv(key string) string {
	v := os.Getenv(key)
	if v == "" {
		log.Fatalf("Environment variable %s is required", key)
	}
	return v
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}
