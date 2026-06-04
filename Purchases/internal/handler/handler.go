package handler

import (
	"context"

	grpcauth "purchase-service/internal/grpc-auth"
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

// AddToCart expects AddToCartRequest to have a flat tour_id field (not a nested OrderItem).
// Update your proto: replace the OrderItem field with `string tour_id = 2;`
func (h *PurchaseHandler) AddToCart(ctx context.Context, req *pb.AddToCartRequest) (*pb.CartResponse, error) {
	touristID, err := grpcauth.TouristIDFromContext(ctx)
	if err != nil {
		return nil, err
	}
	cart, err := h.svc.AddToCart(ctx, touristID, req.TourId)
	if err != nil {
		return nil, toGRPCError(err)
	}
	return toCartResponse(cart), nil
}

func (h *PurchaseHandler) RemoveFromCart(ctx context.Context, req *pb.RemoveFromCartRequest) (*pb.CartResponse, error) {
	touristID, err := grpcauth.TouristIDFromContext(ctx)
	if err != nil {
		return nil, err
	}
	cart, err := h.svc.RemoveFromCart(touristID, req.TourId)
	if err != nil {
		return nil, toGRPCError(err)
	}
	return toCartResponse(cart), nil
}

func (h *PurchaseHandler) Checkout(ctx context.Context, _ *pb.CheckoutRequest) (*pb.CheckoutResponse, error) {
	touristID, err := grpcauth.TouristIDFromContext(ctx)
	if err != nil {
		return nil, err
	}
	tokens, err := h.svc.Checkout(ctx, touristID)
	if err != nil {
		return nil, toGRPCError(err)
	}

	var pbTokens []*pb.TokenResponse
	for _, t := range tokens {
		pbTokens = append(pbTokens, toTokenResponse(t))
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

func (h *PurchaseHandler) GetMyPurchases(ctx context.Context, _ *pb.GetMyPurchasesRequest) (*pb.GetMyPurchasesResponse, error) {
	tokens, err := h.svc.GetMyPurchases(ctx)
	if err != nil {
		return nil, err
	}
	var pbTokens []*pb.TokenResponse
	for _, t := range tokens {
		pbTokens = append(pbTokens, toTokenResponse(t))
	}
	return &pb.GetMyPurchasesResponse{Tokens: pbTokens}, nil
}

func (h *PurchaseHandler) GetAllPurchases(ctx context.Context, _ *pb.GetAllPurchasesRequest) (*pb.GetAllPurchasesResponse, error) {
	grouped, err := h.svc.GetAllPurchases(ctx)
	if err != nil {
		return nil, err
	}
	var purchases []*pb.PurchasesByTourist
	for touristID, tokens := range grouped {
		var pbTokens []*pb.TokenResponse
		for _, t := range tokens {
			pbTokens = append(pbTokens, toTokenResponse(t))
		}
		purchases = append(purchases, &pb.PurchasesByTourist{
			TouristId: touristID,
			Tokens:    pbTokens,
		})
	}
	return &pb.GetAllPurchasesResponse{Purchases: purchases}, nil
}

func (h *PurchaseHandler) RefundPurchase(ctx context.Context, req *pb.RefundPurchaseRequest) (*pb.RefundPurchaseResponse, error) {
	if err := h.svc.RefundPurchase(ctx, req.TokenId); err != nil {
		return nil, err
	}
	return &pb.RefundPurchaseResponse{Success: true}, nil
}

func (h *PurchaseHandler) GetMyCartItems(ctx context.Context, _ *pb.GetMyCartItemsRequest) (*pb.CartResponse, error) {
	cart, err := h.svc.GetMyCartItems(ctx)
	if err != nil {
		return nil, err
	}
	return toCartResponse(cart), nil
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

func toTokenResponse(t domain.TourPurchaseToken) *pb.TokenResponse {
	return &pb.TokenResponse{
		Id:        t.ID,
		TouristId: t.TouristID,
		TourId:    t.TourID,
		Price:     t.Price,
		IssuedAt:  t.IssuedAt.String(),
	}
}
