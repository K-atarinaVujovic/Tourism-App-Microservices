package domain

import (
	"errors"
	"time"
)

type OrderItem struct {
	TourID   string
	TourName string
	Price    float64
}

type ShoppingCart struct {
	ID         string
	TouristID  string
	Items      []OrderItem
	TotalPrice float64
}

type TourPurchaseToken struct {
	ID        string
	TouristID string
	TourID    string
	IssuedAt  time.Time
}

func NewShoppingCart(touristID string) *ShoppingCart {
	return &ShoppingCart{
		TouristID: touristID,
		Items:     []OrderItem{},
	}
}

func (c *ShoppingCart) AddItem(item OrderItem) error {
	for _, i := range c.Items {
		if i.TourID == item.TourID {
			return errors.New("tour already in cart")
		}
	}
	c.Items = append(c.Items, item)
	c.recalculate()
	return nil
}

func (c *ShoppingCart) RemoveItem(tourID string) error {
	for i, item := range c.Items {
		if item.TourID == tourID {
			c.Items = append(c.Items[:i], c.Items[i+1:]...)
			c.recalculate()
			return nil
		}
	}
	return errors.New("item not found in cart")
}

func (c *ShoppingCart) recalculate() {
	total := 0.0
	for _, item := range c.Items {
		total += item.Price
	}
	c.TotalPrice = total
}