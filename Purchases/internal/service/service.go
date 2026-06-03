package service

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"time"

	"purchase-service/internal/clients"
	"purchase-service/internal/domain"
	grpcauth "purchase-service/internal/grpc-auth"

	"github.com/google/uuid"
)

// Repository interfaces — decouples service from storage implementation

type CartRepository interface {
	FindCartByTouristID(touristID string) (*domain.ShoppingCart, error)
	SaveCart(cart *domain.ShoppingCart) error
}

type TokenRepository interface {
	SaveToken(token *domain.TourPurchaseToken) error
	FindTokensByTouristID(touristID string) ([]domain.TourPurchaseToken, error)
	FindAllTokens() ([]domain.TourPurchaseToken, error)
	FindTokenByID(tokenID string) (*domain.TourPurchaseToken, error)
	DeleteToken(tokenID string) error
}

type PurchaseService struct {
	carts        CartRepository
	tokens       TokenRepository
	tours        *clients.ToursClient
	stakeholders *clients.StakeholdersClient
}

func NewPurchaseService(
	carts CartRepository,
	tokens TokenRepository,
	tours *clients.ToursClient,
	stakeholders *clients.StakeholdersClient,
) *PurchaseService {
	return &PurchaseService{
		carts:        carts,
		tokens:       tokens,
		tours:        tours,
		stakeholders: stakeholders,
	}
}

func (s *PurchaseService) AddToCart(ctx context.Context, touristID string, tourID string) (*domain.ShoppingCart, error) {
	authHeader := grpcauth.AuthFromContext(ctx)

	tour, err := s.tours.GetTour(ctx, tourID, authHeader)
	if err != nil {
		return nil, err
	}
	if tour.Status != "PUBLISHED" {
		return nil, errors.New("tour is not published")
	}

	cart, err := s.carts.FindCartByTouristID(touristID)
	if err != nil {
		// no cart yet — create one
		cart = domain.NewShoppingCart(touristID)
	}

	item := domain.OrderItem{
		TourID:   tourID,
		TourName: tour.Name,
		Price:    tour.Price,
	}
	if err := cart.AddItem(item); err != nil {
		return nil, err
	}

	if err := s.carts.SaveCart(cart); err != nil {
		return nil, err
	}
	return cart, nil
}

func (s *PurchaseService) RemoveFromCart(touristID, tourID string) (*domain.ShoppingCart, error) {
	cart, err := s.carts.FindCartByTouristID(touristID)
	if err != nil {
		return nil, errors.New("cart not found")
	}

	if err := cart.RemoveItem(tourID); err != nil {
		return nil, err
	}

	if err := s.carts.SaveCart(cart); err != nil {
		return nil, err
	}
	return cart, nil
}

func (s *PurchaseService) Checkout(ctx context.Context, touristID string) ([]domain.TourPurchaseToken, error) {
	authHeader := grpcauth.AuthFromContext(ctx)

	cart, err := s.carts.FindCartByTouristID(touristID)
	if err != nil {
		return nil, errors.New("cart not found")
	}
	if len(cart.Items) == 0 {
		return nil, errors.New("cart is empty")
	}

	balance, err := s.stakeholders.GetBalance(ctx, authHeader)
	if err != nil {
		return nil, err
	}
	if balance < cart.TotalPrice {
		return nil, errors.New("insufficient balance")
	}

	var tokens []domain.TourPurchaseToken
	for _, item := range cart.Items {
		token := domain.TourPurchaseToken{
			ID:        uuid.New().String(),
			TouristID: touristID,
			TourID:    item.TourID,
			Price:     item.Price,
			IssuedAt:  time.Now(),
		}
		if err := s.tokens.SaveToken(&token); err != nil {
			return nil, err
		}
		tokens = append(tokens, token)
	}

	if err := s.stakeholders.UpdateBalance(ctx, authHeader, -cart.TotalPrice); err != nil {
		return nil, err
	}

	// clear cart after checkout
	cart.Items = []domain.OrderItem{}
	cart.TotalPrice = 0
	s.carts.SaveCart(cart)

	return tokens, nil
}

func (s *PurchaseService) HasPurchased(touristID, tourID string) (bool, error) {
	tokens, err := s.tokens.FindTokensByTouristID(touristID)
	if err != nil {
		return false, err
	}
	for _, t := range tokens {
		if t.TourID == tourID {
			return true, nil
		}
	}
	return false, nil
}

func (s *PurchaseService) GetMyPurchases(ctx context.Context) ([]domain.TourPurchaseToken, error) {
	touristID, err := grpcauth.TouristIDFromContext(ctx)
	if err != nil {
		return nil, errors.New("unauthorized")
	}
	return s.tokens.FindTokensByTouristID(touristID)
}

func (s *PurchaseService) GetAllPurchases(ctx context.Context) (map[string][]domain.TourPurchaseToken, error) {
	isAdmin, err := grpcauth.IsAdminFromContext(ctx)
	if err != nil || !isAdmin {
		return nil, errors.New("unauthorized: admin only")
	}

	tokens, err := s.tokens.FindAllTokens()
	if err != nil {
		return nil, err
	}

	grouped := make(map[string][]domain.TourPurchaseToken)
	for _, t := range tokens {
		grouped[t.TouristID] = append(grouped[t.TouristID], t)
	}
	return grouped, nil
}

func (s *PurchaseService) RefundPurchase(ctx context.Context, tokenID string) error {
	isAdmin, err := grpcauth.IsAdminFromContext(ctx)
	if err != nil || !isAdmin {
		return errors.New("unauthorized: admin only")
	}

	token, err := s.tokens.FindTokenByID(tokenID)
	if err != nil {
		return errors.New("token not found")
	}

	authHeader := grpcauth.AuthFromContext(ctx)
	id, err := strconv.ParseInt(token.TouristID, 10, 64)
	if err != nil {
		return fmt.Errorf("invalid TouristID %q: %w", token.TouristID, err)
	}
	if err := s.stakeholders.UpdateBalanceForUser(ctx, authHeader, id, token.Price); err != nil {
		return err
	}

	return s.tokens.DeleteToken(tokenID)
}
