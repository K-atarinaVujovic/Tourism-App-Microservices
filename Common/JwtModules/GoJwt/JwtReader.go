package jwtreader

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"regexp"
	"strings"
	"time"
)

var (
	ErrInvalidTokenFormat = errors.New("invalid JWT format")
	ErrInvalidAlgorithm   = errors.New("unsupported algorithm; expected HS256")
	ErrInvalidSignature   = errors.New("invalid JWT signature")
	ErrTokenExpired       = errors.New("token expired")
	ErrTokenNotYetValid   = errors.New("token not valid yet")
	ErrMissingClaim       = errors.New("missing required claim")
	ErrInvalidClaimType   = errors.New("invalid claim type")
	ErrInvalidRole        = errors.New("invalid role")
	ErrInvalidUsername    = errors.New("invalid username")
)

var usernameRe = regexp.MustCompile(`^[a-zA-Z0-9_]{3,30}$`)

type Claims struct {
	UserID   int64  `json:"user_id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Role     string `json:"role"`

	Sub int64  `json:"sub"`
	Iat int64  `json:"iat"`
	Exp int64  `json:"exp"`
	Nbf int64  `json:"nbf"`
	Jti string `json:"jti,omitempty"`
}

type Header struct {
	Alg string `json:"alg"`
	Typ string `json:"typ"`
}

type Token struct {
	Header  Header
	Claims  Claims
	Raw     string
	Subject int64
}

func ExtractBearerToken(authHeader string) (string, error) {
	if !strings.HasPrefix(authHeader, "Bearer ") {
		return "", errors.New("authorization header must start with Bearer ")
	}
	token := strings.TrimSpace(strings.TrimPrefix(authHeader, "Bearer "))
	if token == "" {
		return "", errors.New("empty bearer token")
	}
	return token, nil
}

func ReadFromAuthorizationHeader(authHeader string) (*Token, error) {
	token, err := ExtractBearerToken(authHeader)
	if err != nil {
		return nil, err
	}
	return ParseAndValidate(token, os.Getenv("JWT_SECRET"), time.Now().Unix())
}

func ParseAndValidate(jwt string, secret string, nowUnix int64) (*Token, error) {
	if secret == "" {
		return nil, errors.New("JWT_SECRET is empty")
	}

	parts := strings.Split(jwt, ".")
	if len(parts) != 3 {
		return nil, ErrInvalidTokenFormat
	}

	headerJSON, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return nil, fmt.Errorf("decode header: %w", err)
	}

	payloadJSON, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return nil, fmt.Errorf("decode payload: %w", err)
	}

	var header Header
	if err := json.Unmarshal(headerJSON, &header); err != nil {
		return nil, fmt.Errorf("unmarshal header: %w", err)
	}
	if header.Alg != "HS256" {
		return nil, ErrInvalidAlgorithm
	}

	signingInput := parts[0] + "." + parts[1]
	if !verifyHS256(signingInput, parts[2], secret) {
		return nil, ErrInvalidSignature
	}

	var claims Claims
	if err := json.Unmarshal(payloadJSON, &claims); err != nil {
		return nil, fmt.Errorf("unmarshal claims: %w", err)
	}

	if err := validateClaims(claims, nowUnix); err != nil {
		return nil, err
	}

	return &Token{
		Header:  header,
		Claims:  claims,
		Raw:     jwt,
		Subject: claims.Sub,
	}, nil
}

func verifyHS256(signingInput, signatureB64 string, secret string) bool {
	mac := hmac.New(sha256.New, []byte(secret))
	_, _ = mac.Write([]byte(signingInput))
	expected := mac.Sum(nil)

	got, err := base64.RawURLEncoding.DecodeString(signatureB64)
	if err != nil {
		return false
	}
	return hmac.Equal(expected, got)
}

func validateClaims(c Claims, nowUnix int64) error {
	if c.UserID == 0 {
		return ErrMissingClaim
	}
	if c.Username == "" {

		return ErrMissingClaim
	}
	if c.Email == "" {
		return ErrMissingClaim
	}
	if c.Role == "" {
		return ErrMissingClaim
	}
	if c.Sub == 0 {
		return ErrMissingClaim
	}
	if c.Iat == 0 || c.Exp == 0 || c.Nbf == 0 {
		return ErrMissingClaim
	}

	if c.Role != "user" && c.Role != "admin" {
		return ErrInvalidRole
	}
	if !usernameRe.MatchString(c.Username) {
		return ErrInvalidUsername
	}
	if c.Exp < nowUnix {
		return ErrTokenExpired
	}
	if c.Nbf > nowUnix {
		return ErrTokenNotYetValid
	}
	if c.UserID != c.Sub {
		return errors.New("user_id must match sub")
	}

	return nil
}
