package grpcauth

import (
	"context"
	"os"

	jwtreader "gojwt"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

type contextKey string

const (
	authHeaderKey contextKey = "authorization"
	isInternalKey contextKey = "is_internal"
)

// AuthFromContext retrieves the raw "Authorization: Bearer ..." header
// stored by UnaryAuthInterceptor.
func AuthFromContext(ctx context.Context) string {
	v, _ := ctx.Value(authHeaderKey).(string)
	return v
}

// TouristIDFromContext extracts the user's ID from the JWT in context.
// Returns Claims.Sub, which is the string representation of the int64 UserID.
func TouristIDFromContext(ctx context.Context) (string, error) {
	token, err := jwtreader.ReadFromAuthorizationHeader(AuthFromContext(ctx))
	if err != nil {
		return "", err
	}
	return token.Claims.Sub, nil
}

// IsAdminFromContext returns true if the JWT role claim equals "admin".
func IsAdminFromContext(ctx context.Context) (bool, error) {
	token, err := jwtreader.ReadFromAuthorizationHeader(AuthFromContext(ctx))
	if err != nil {
		return false, err
	}
	return token.Claims.Role == "admin", nil
}

// IsInternalFromContext returns true when the call was authenticated
// with the internal secret rather than a user JWT.
func IsInternalFromContext(ctx context.Context) bool {
	v, _ := ctx.Value(isInternalKey).(bool)
	return v
}

// NewAuthContext builds a context carrying the given Authorization header.
// Used by non-gRPC callers (e.g. MQ consumer) to set up a service-layer context.
func NewAuthContext(ctx context.Context, authHeader string) context.Context {
	return context.WithValue(ctx, authHeaderKey, authHeader)
}

// NewInternalContext marks a context as an internal (compensation) call,
// bypassing JWT auth the same way the gRPC interceptor does for internal secrets.
func NewInternalContext(ctx context.Context) context.Context {
	return context.WithValue(ctx, isInternalKey, true)
}

// UnaryAuthInterceptor validates the JWT carried in the gRPC "authorization"
// metadata key and forwards the raw header value via context so downstream
// callers can attach it to outbound HTTP requests.
func UnaryAuthInterceptor(
	ctx context.Context,
	req interface{},
	_ *grpc.UnaryServerInfo,
	handler grpc.UnaryHandler,
) (interface{}, error) {
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return nil, status.Error(codes.Unauthenticated, "missing metadata")
	}

	// --- internal authorization via internal secret ---
	if secrets := md.Get("x-internal-secret"); len(secrets) > 0 {
		if secrets[0] == os.Getenv("INTERNAL_SECRET") {
			ctx = context.WithValue(ctx, isInternalKey, true)
			return handler(ctx, req)
		}
		return nil, status.Error(codes.PermissionDenied, "invalid internal secret")
	}

	// --- jwt authorization ---
	values := md.Get("authorization")
	if len(values) == 0 {
		return nil, status.Error(codes.Unauthenticated, "missing authorization header")
	}

	authHeader := values[0]
	if _, err := jwtreader.ReadFromAuthorizationHeader(authHeader); err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "invalid token: %v", err)
	}

	ctx = context.WithValue(ctx, authHeaderKey, authHeader)
	return handler(ctx, req)
}
