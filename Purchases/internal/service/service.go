package service

import (
	"errors"
	"purchase-service/internal/domain"
	"time"

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
}

type PurchaseService struct {
	carts  CartRepository
	tokens TokenRepository
}

func NewPurchaseService(carts CartRepository, tokens TokenRepository) *PurchaseService {
	return &PurchaseService{carts: carts, tokens: tokens}
}

func (s *PurchaseService) AddToCart(touristID string, item domain.OrderItem) (*domain.ShoppingCart, error) {
	cart, err := s.carts.FindCartByTouristID(touristID)
	if err != nil {
		// no cart yet — create one
		cart = domain.NewShoppingCart(touristID)
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

func (s *PurchaseService) Checkout(touristID string) ([]domain.TourPurchaseToken, error) {
	cart, err := s.carts.FindCartByTouristID(touristID)
	if err != nil {
		return nil, errors.New("cart not found")
	}
	if len(cart.Items) == 0 {
		return nil, errors.New("cart is empty")
	}

	var tokens []domain.TourPurchaseToken
	for _, item := range cart.Items {
		token := domain.TourPurchaseToken{
			ID:        uuid.New().String(),
			TouristID: touristID,
			TourID:    item.TourID,
			IssuedAt:  time.Now(),
		}
		if err := s.tokens.SaveToken(&token); err != nil {
			return nil, err
		}
		tokens = append(tokens, token)
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