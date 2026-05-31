package handler

import (
	"context"
	"purchase-service/internal/domain"
	"purchase-service/internal/service"
	pb "purchase-service/pb"
)

type PurchaseHandler struct {
	pb.UnimplementedPurchaseServiceServer
	svc *service.PurchaseService
}

func NewPurchaseHandler(svc *service.PurchaseService) *PurchaseHandler {
	return &PurchaseHandler{svc: svc}
}

func (h *PurchaseHandler) AddToCart(ctx context.Context, req *pb.AddToCartRequest) (*pb.CartResponse, error) {
	item := domain.OrderItem{
		TourID:   req.Item.TourId,
		TourName: req.Item.TourName,
		Price:    req.Item.Price,
	}
	cart, err := h.svc.AddToCart(req.TouristId, item)
	if err != nil {
		return nil, err
	}
	return toCartResponse(cart), nil
}

func (h *PurchaseHandler) RemoveFromCart(ctx context.Context, req *pb.RemoveFromCartRequest) (*pb.CartResponse, error) {
	cart, err := h.svc.RemoveFromCart(req.TouristId, req.TourId)
	if err != nil {
		return nil, err
	}
	return toCartResponse(cart), nil
}

func (h *PurchaseHandler) Checkout(ctx context.Context, req *pb.CheckoutRequest) (*pb.CheckoutResponse, error) {
	tokens, err := h.svc.Checkout(req.TouristId)
	if err != nil {
		return nil, err
	}

	var pbTokens []*pb.TokenResponse
	for _, t := range tokens {
		pbTokens = append(pbTokens, &pb.TokenResponse{
			Id:        t.ID,
			TouristId: t.TouristID,
			TourId:    t.TourID,
			IssuedAt:  t.IssuedAt.String(),
		})
	}
	return &pb.CheckoutResponse{Tokens: pbTokens}, nil
}

func (h *PurchaseHandler) HasPurchased(ctx context.Context, req *pb.HasPurchasedRequest) (*pb.HasPurchasedResponse, error) {
	purchased, err := h.svc.HasPurchased(req.TouristId, req.TourId)
	if err != nil {
		return nil, err
	}
	return &pb.HasPurchasedResponse{Purchased: purchased}, nil
}

// --- mappers ---

func toCartResponse(cart *domain.ShoppingCart) *pb.CartResponse {
	var items []*pb.OrderItemResponse
	for _, i := range cart.Items {
		items = append(items, &pb.OrderItemResponse{
			TourId:   i.TourID,
			TourName: i.TourName,
			Price:    i.Price,
		})
	}
	return &pb.CartResponse{
		TouristId:  cart.TouristID,
		Items:      items,
		TotalPrice: cart.TotalPrice,
	}
}