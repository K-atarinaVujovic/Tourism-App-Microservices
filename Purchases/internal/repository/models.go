package repository

import "time"

type CartModel struct {
	ID         string `gorm:"primaryKey"`
	TouristID  string `gorm:"uniqueIndex"`
	TotalPrice float64
	Items      []ItemModel `gorm:"foreignKey:CartID;constraint:OnDelete:CASCADE"`
}

type ItemModel struct {
	ID       string `gorm:"primaryKey"`
	CartID   string `gorm:"index"`
	TourID   string
	TourName string
	Price    float64
}

type TokenModel struct {
	ID        string `gorm:"primaryKey"`
	TouristID string `gorm:"index"`
	TourID    string
	Price     float64
	IssuedAt  time.Time
}
