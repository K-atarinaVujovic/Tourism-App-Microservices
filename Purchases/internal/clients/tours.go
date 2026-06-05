package clients

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
)

// TourResponse mirrors the fields we need from the Tours service TourResponse DTO.
type TourResponse struct {
	ID     int64   `json:"id"`
	Name   string  `json:"name"`
	Price  float64 `json:"price"`
	Status string  `json:"status"` // matches TourStatus enum name, e.g. "PUBLISHED"
}

type ToursClient struct {
	baseURL    string
	httpClient *http.Client
}

func NewToursClient(baseURL string) *ToursClient {
	return &ToursClient{baseURL: baseURL, httpClient: &http.Client{}}
}

func (c *ToursClient) GetTour(ctx context.Context, tourID string, authHeader string) (*TourResponse, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("%s/tours/%s", c.baseURL, tourID), nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", authHeader)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return nil, fmt.Errorf("tour %s not found", tourID)
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("tours service returned %d", resp.StatusCode)
	}

	var tour TourResponse
	if err := json.NewDecoder(resp.Body).Decode(&tour); err != nil {
		return nil, fmt.Errorf("decode tour response: %w", err)
	}
	return &tour, nil
}
