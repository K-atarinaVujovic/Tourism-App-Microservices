package grpcauth

import (
	"context"

	jwtreader "gojwt"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

type contextKey string

const authHeaderKey contextKey = "authorization"

// AuthFromContext retrieves the raw "Authorization: Bearer ..." header
// stored by UnaryAuthInterceptor.
func AuthFromContext(ctx context.Context) string {
	v, _ := ctx.Value(authHeaderKey).(string)
	return v
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
