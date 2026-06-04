import apiClient from '@/lib/api-client';
import type {
  CartResponse,
  CheckoutResponse,
  HasPurchasedResponse,
  MyPurchasesResponse,
  RefundResponse,
} from '@/types/purchase';

/**
 * purchaseService works via the Gateway.
 * The Gateway expects:
 *  - /purchases/cart (for AddToCart, GetMyCartItems)
 *  - /purchases/cart/{tour_id} (for RemoveFromCart)
 *  - /purchases/checkout (for Checkout)
 *  - /purchases/purchases/my (for GetMyPurchases)
 *  - /purchases/purchases/{tourist_id}/tours/{tour_id} (for HasPurchased)
 *  - /purchases/purchases (for GetAllPurchases - Admin)
 *  - /purchases/purchases/{token_id} (for RefundPurchase - Admin)
 */

export const purchaseService = {
  getCart: async (): Promise<CartResponse> => {
    const { data } = await apiClient.get<CartResponse>('/purchases/cart');
    return data;
  },

  addToCart: async (touristId: string, tourId: string): Promise<CartResponse> => {
    // The gRPC/Gateway expects AddToCartRequest which usually matches the body
    const { data } = await apiClient.post<CartResponse>('/purchases/cart', {
      tourist_id: touristId,
      tour_id: tourId,
    });
    return data;
  },

  removeFromCart: async (tourId: string): Promise<CartResponse> => {
    const { data } = await apiClient.delete<CartResponse>(`/purchases/cart/${tourId}`);
    return data;
  },

  checkout: async (touristId: string): Promise<CheckoutResponse> => {
    const { data } = await apiClient.post<CheckoutResponse>('/purchases/checkout', {
      tourist_id: touristId,
    });
    return data;
  },

  hasPurchased: async (touristId: string, tourId: string): Promise<HasPurchasedResponse> => {
    const { data } = await apiClient.get<HasPurchasedResponse>(
      `/purchases/purchases/${touristId}/tours/${tourId}`
    );
    return data;
  },

  getMyPurchases: async (): Promise<MyPurchasesResponse> => {
    const { data } = await apiClient.get<MyPurchasesResponse>('/purchases/purchases/my');
    return data;
  },

  getAllPurchases: async (): Promise<MyPurchasesResponse> => {
    // Gateway maps GET /purchases to GetAllPurchases
    const { data } = await apiClient.get<MyPurchasesResponse>('/purchases/purchases');
    return data;
  },

  refundPurchase: async (tokenId: string): Promise<RefundResponse> => {
    // Gateway maps DELETE /purchases/{token_id} to RefundPurchase
    const { data } = await apiClient.delete<RefundResponse>(`/purchases/purchases/${tokenId}`);
    return data;
  },
};
