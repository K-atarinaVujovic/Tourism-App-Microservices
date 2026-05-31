package repository

import (
	"purchase-service/internal/domain"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PurchaseRepository struct {
	db *gorm.DB
}

func NewPurchaseRepository(db *gorm.DB) *PurchaseRepository {
	return &PurchaseRepository{db: db}
}

func (r *PurchaseRepository) FindCartByTouristID(touristID string) (*domain.ShoppingCart, error) {
	var model CartModel
	err := r.db.Preload("Items").Where("tourist_id = ?", touristID).First(&model).Error
	if err != nil {
		return nil, err
	}
	return cartToDomain(model), nil
}

func (r *PurchaseRepository) SaveCart(cart *domain.ShoppingCart) error {
	if cart.ID == "" {
		cart.ID = uuid.New().String()
	}

	// 1. upsert the cart row first (no items) so the parent exists
	cartOnly := CartModel{
		ID:         cart.ID,
		TouristID:  cart.TouristID,
		TotalPrice: cart.TotalPrice,
	}
	if err := r.db.Save(&cartOnly).Error; err != nil {
		return err
	}

	// 2. delete old items
	if err := r.db.Where("cart_id = ?", cart.ID).Delete(&ItemModel{}).Error; err != nil {
		return err
	}

	// 3. insert new items
	for _, i := range cart.Items {
		item := ItemModel{
			ID:       uuid.New().String(),
			CartID:   cart.ID,
			TourID:   i.TourID,
			TourName: i.TourName,
			Price:    i.Price,
		}
		if err := r.db.Create(&item).Error; err != nil {
			return err
		}
	}
	return nil
}

func (r *PurchaseRepository) SaveToken(token *domain.TourPurchaseToken) error {
	model := TokenModel{
		ID:        token.ID,
		TouristID: token.TouristID,
		TourID:    token.TourID,
		IssuedAt:  token.IssuedAt,
	}
	return r.db.Save(&model).Error
}

func (r *PurchaseRepository) FindTokensByTouristID(touristID string) ([]domain.TourPurchaseToken, error) {
	var models []TokenModel
	if err := r.db.Where("tourist_id = ?", touristID).Find(&models).Error; err != nil {
		return nil, err
	}
	var tokens []domain.TourPurchaseToken
	for _, m := range models {
		tokens = append(tokens, domain.TourPurchaseToken{
			ID:        m.ID,
			TouristID: m.TouristID,
			TourID:    m.TourID,
			IssuedAt:  m.IssuedAt,
		})
	}
	return tokens, nil
}

// --- mappers ---

func cartToDomain(m CartModel) *domain.ShoppingCart {
	cart := &domain.ShoppingCart{
		ID:         m.ID,
		TouristID:  m.TouristID,
		TotalPrice: m.TotalPrice,
	}
	for _, i := range m.Items {
		cart.Items = append(cart.Items, domain.OrderItem{
			TourID:   i.TourID,
			TourName: i.TourName,
			Price:    i.Price,
		})
	}
	return cart
}