import apiClient from '@/lib/api-client';
import type {
  CartResponse,
  CheckoutResponse,
  HasPurchasedResponse,
  MyPurchasesResponse,
  RefundResponse,
} from '@/types/purchase';

export const purchaseService = {
  getCart: async (): Promise<CartResponse> => {
    const { data } = await apiClient.get<CartResponse>('/purchases/cart');
    return data;
  },

  addToCart: async (touristId: string, tourId: string): Promise<CartResponse> => {
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

  refundPurchase: async (tokenId: string): Promise<RefundResponse> => {
    const { data } = await apiClient.delete<RefundResponse>(`/purchases/purchases/${tokenId}`);
    return data;
  },
};
