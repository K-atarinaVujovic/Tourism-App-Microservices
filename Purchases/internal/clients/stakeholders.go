package clients

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
)

type balanceBody struct {
	Balance float64 `json:"balance"`
}

type StakeholdersClient struct {
	baseURL    string
	httpClient *http.Client
}

func NewStakeholdersClient(baseURL string) *StakeholdersClient {
	return &StakeholdersClient{baseURL: baseURL, httpClient: &http.Client{}}
}

func (c *StakeholdersClient) GetBalance(ctx context.Context, authHeader string) (float64, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.baseURL+"/profiles/balance", nil)
	if err != nil {
		return 0, err
	}
	req.Header.Set("Authorization", authHeader)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return 0, fmt.Errorf("stakeholders service returned %d", resp.StatusCode)
	}

	var b balanceBody
	if err := json.NewDecoder(resp.Body).Decode(&b); err != nil {
		return 0, fmt.Errorf("decode balance response: %w", err)
	}
	return b.Balance, nil
}

func (c *StakeholdersClient) UpdateBalance(ctx context.Context, authHeader string, newBalance float64) error {
	body, _ := json.Marshal(balanceBody{Balance: newBalance})

	req, err := http.NewRequestWithContext(ctx, http.MethodPut, c.baseURL+"/profiles/balance", bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", authHeader)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("stakeholders service returned %d", resp.StatusCode)
	}
	return nil
}
