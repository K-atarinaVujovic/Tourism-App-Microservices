package handler

import (
	"strings"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func toGRPCError(err error) error {
	if err == nil {
		return nil
	}
	if _, ok := status.FromError(err); ok {
		return err
	}

	msg := err.Error()
	switch {
	case msg == "cart not found":
		return status.Error(codes.NotFound, msg)
	case msg == "cart is empty":
		return status.Error(codes.FailedPrecondition, msg)
	case msg == "insufficient balance":
		return status.Error(codes.FailedPrecondition, msg)
	case msg == "unauthorized":
		return status.Error(codes.Unauthenticated, msg)
	case strings.HasPrefix(msg, "unauthorized:"):
		return status.Error(codes.PermissionDenied, msg)
	case strings.Contains(msg, "item not found"):
		return status.Error(codes.NotFound, msg)
	case strings.Contains(msg, "tour is not published"):
		return status.Error(codes.FailedPrecondition, msg)
	case strings.Contains(msg, "stakeholders service returned"):
		return status.Error(codes.Unavailable, msg)
	default:
		return status.Error(codes.Internal, msg)
	}
}
