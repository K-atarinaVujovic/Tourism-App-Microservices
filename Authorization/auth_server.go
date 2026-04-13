package main

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

type Server struct {
	db        *pgx.Conn
	jwtSecret []byte
	tokenTTL  time.Duration
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token string `json:"token"`
}

type RegisterResponse struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	Token  string `json:"token"`
}

type BlockUserRequest struct {
	UserID string `json:"user_id"`
}

type UnblockUserRequest struct {
	UserID string `json:"user_id"`
}

type BlockUserResponse struct {
	Message string `json:"message"`
	UserID  string `json:"user_id"`
}

type Claims struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL is required")
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("JWT_SECRET is required")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Attempting to connect to database...")
	conn, err := pgx.Connect(context.Background(), databaseURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v", err)
	}
	defer conn.Close(context.Background())

	log.Printf("Connected to database, running ping...")
	if err := conn.Ping(context.Background()); err != nil {
		log.Fatalf("Database ping failed: %v", err)
	}
	log.Printf("Database ping successful!")

	srv := &Server{
		db:        conn,
		jwtSecret: []byte(jwtSecret),
		tokenTTL:  24 * time.Hour,
	}

	router := chi.NewRouter()

	// Public routes
	router.Get("/health", srv.healthHandler)
	router.Post("/auth/register", srv.registerHandler)
	router.Post("/auth/login", srv.loginHandler)

	// Admin-only routes (require authentication + admin role)
	router.Post("/admin/users/block", srv.requireAuth(srv.requireAdmin(srv.blockUserHandler)))
	router.Post("/admin/users/unblock", srv.requireAuth(srv.requireAdmin(srv.unblockUserHandler)))

	log.Printf("Auth server listening on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}

func (s *Server) healthHandler(w http.ResponseWriter, r *http.Request) {
	// Test database connection
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()

	if err := s.db.Ping(ctx); err != nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{
			"status": "unhealthy",
			"error":  "database connection failed",
		})
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"status":   "ok",
		"database": "connected",
	})
}

func (s *Server) registerHandler(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}

	// Validate input
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	if req.Email == "" || req.Password == "" {
		writeError(w, http.StatusBadRequest, "email and password are required")
		return
	}

	// Basic email validation
	if !strings.Contains(req.Email, "@") {
		writeError(w, http.StatusBadRequest, "invalid email format")
		return
	}

	// Password strength validation
	if len(req.Password) < 8 {
		writeError(w, http.StatusBadRequest, "password must be at least 8 characters")
		return
	}

	// Hash password
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Failed to hash password: %v", err)
		writeError(w, http.StatusInternalServerError, "failed to process password")
		return
	}

	// Create user with default 'user' role
	var userID string
	var role string
	err = s.db.QueryRow(r.Context(),
		`INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'user') RETURNING id::text, role`,
		req.Email,
		string(passwordHash),
	).Scan(&userID, &role)

	if err != nil {
		if strings.Contains(err.Error(), "duplicate key") || strings.Contains(err.Error(), "unique constraint") {
			writeError(w, http.StatusConflict, "email already registered")
			return
		}
		log.Printf("Failed to create user: %v", err)
		writeError(w, http.StatusInternalServerError, "failed to create user")
		return
	}

	// Generate JWT token for the new user
	token, err := s.createJWT(userID, req.Email, role)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "user created but could not generate token")
		return
	}

	writeJSON(w, http.StatusCreated, RegisterResponse{
		UserID: userID,
		Email:  req.Email,
		Role:   role,
		Token:  token,
	})
}

func (s *Server) loginHandler(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}

	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	if req.Email == "" || req.Password == "" {
		writeError(w, http.StatusBadRequest, "email and password are required")
		return
	}

	userID, passwordHash, role, isBlocked, err := s.findUserByEmail(r.Context(), req.Email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeError(w, http.StatusUnauthorized, "invalid credentials")
			return
		}
		writeError(w, http.StatusInternalServerError, "database error")
		return
	}

	// Check if account is blocked
	if isBlocked {
		writeError(w, http.StatusForbidden, "account is blocked")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(req.Password)); err != nil {
		writeError(w, http.StatusUnauthorized, "invalid credentials")
		return
	}

	token, err := s.createJWT(userID, req.Email, role)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not create token")
		return
	}

	writeJSON(w, http.StatusOK, LoginResponse{Token: token})
}

func (s *Server) findUserByEmail(ctx context.Context, email string) (string, string, string, bool, error) {
	var userID string
	var passwordHash string
	var role string
	var isBlocked bool

	err := s.db.QueryRow(ctx,
		`SELECT id::text, password_hash, role, is_blocked FROM users WHERE email = $1`,
		email,
	).Scan(&userID, &passwordHash, &role, &isBlocked)

	return userID, passwordHash, role, isBlocked, err
}

func (s *Server) createJWT(userID, email, role string) (string, error) {
	now := time.Now()

	claims := Claims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userID,
			ExpiresAt: jwt.NewNumericDate(now.Add(s.tokenTTL)),
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
			ID:        randomID(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.jwtSecret)
}

func randomID() string {
	b := make([]byte, 16)
	_, err := rand.Read(b)
	if err != nil {
		return ""
	}
	return hex.EncodeToString(b)
}

// Middleware to require authentication
func (s *Server) requireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			writeError(w, http.StatusUnauthorized, "missing authorization header")
			return
		}

		// Expect "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			writeError(w, http.StatusUnauthorized, "invalid authorization format")
			return
		}

		tokenString := parts[1]
		claims := &Claims{}

		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return s.jwtSecret, nil
		})

		if err != nil || !token.Valid {
			writeError(w, http.StatusUnauthorized, "invalid token")
			return
		}

		// Add claims to request context
		ctx := context.WithValue(r.Context(), "claims", claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}

// Middleware to require admin role
func (s *Server) requireAdmin(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims, ok := r.Context().Value("claims").(*Claims)
		if !ok {
			writeError(w, http.StatusInternalServerError, "failed to get user claims")
			return
		}

		if claims.Role != "admin" {
			writeError(w, http.StatusForbidden, "admin access required")
			return
		}

		next.ServeHTTP(w, r)
	}
}

func (s *Server) blockUserHandler(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value("claims").(*Claims)

	var req BlockUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}

	if req.UserID == "" {
		writeError(w, http.StatusBadRequest, "user_id is required")
		return
	}

	// Prevent admin from blocking themselves
	if req.UserID == claims.UserID {
		writeError(w, http.StatusBadRequest, "cannot block your own account")
		return
	}

	// Check if user exists and get their role
	var targetRole string
	var isAlreadyBlocked bool
	err := s.db.QueryRow(r.Context(),
		`SELECT role, is_blocked FROM users WHERE id = $1`,
		req.UserID,
	).Scan(&targetRole, &isAlreadyBlocked)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeError(w, http.StatusNotFound, "user not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "database error")
		return
	}

	if isAlreadyBlocked {
		writeError(w, http.StatusBadRequest, "user is already blocked")
		return
	}

	// Block the user
	_, err = s.db.Exec(r.Context(),
		`UPDATE users SET is_blocked = true, blocked_at = now(), blocked_by = $1 WHERE id = $2`,
		claims.UserID,
		req.UserID,
	)

	if err != nil {
		log.Printf("Failed to block user: %v", err)
		writeError(w, http.StatusInternalServerError, "failed to block user")
		return
	}

	writeJSON(w, http.StatusOK, BlockUserResponse{
		Message: "user blocked successfully",
		UserID:  req.UserID,
	})
}

func (s *Server) unblockUserHandler(w http.ResponseWriter, r *http.Request) {
	var req UnblockUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}

	if req.UserID == "" {
		writeError(w, http.StatusBadRequest, "user_id is required")
		return
	}

	// Check if user exists and is blocked
	var isBlocked bool
	err := s.db.QueryRow(r.Context(),
		`SELECT is_blocked FROM users WHERE id = $1`,
		req.UserID,
	).Scan(&isBlocked)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeError(w, http.StatusNotFound, "user not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "database error")
		return
	}

	if !isBlocked {
		writeError(w, http.StatusBadRequest, "user is not blocked")
		return
	}

	// Unblock the user
	_, err = s.db.Exec(r.Context(),
		`UPDATE users SET is_blocked = false, blocked_at = NULL, blocked_by = NULL WHERE id = $1`,
		req.UserID,
	)

	if err != nil {
		log.Printf("Failed to unblock user: %v", err)
		writeError(w, http.StatusInternalServerError, "failed to unblock user")
		return
	}

	writeJSON(w, http.StatusOK, BlockUserResponse{
		Message: "user unblocked successfully",
		UserID:  req.UserID,
	})
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{
		"error": message,
	})
}
