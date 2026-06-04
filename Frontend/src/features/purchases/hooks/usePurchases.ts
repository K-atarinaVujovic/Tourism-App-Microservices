import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { purchaseService } from '../services/purchaseService';

export const purchaseKeys = {
  cart: ['cart'] as const,
  purchases: ['purchases'] as const,
  purchasedStatus: (touristId: string, tourId: string) => ['purchasedStatus', touristId, tourId] as const,
};

export function useCart(enabled = true) {
  return useQuery({
    queryKey: purchaseKeys.cart,
    queryFn: () => purchaseService.getCart(),
    enabled,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ touristId, tourId }: { touristId: string; tourId: string }) =>
      purchaseService.addToCart(touristId, tourId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.cart });
      queryClient.invalidateQueries({
        queryKey: purchaseKeys.purchasedStatus(variables.touristId, variables.tourId),
      });
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tourId: string) => purchaseService.removeFromCart(tourId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.cart });
    },
  });
}

export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (touristId: string) => purchaseService.checkout(touristId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.cart });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.purchases });
      // Invalidate all purchased status queries
      queryClient.invalidateQueries({ queryKey: ['purchasedStatus'] });
    },
  });
}

export function useHasPurchased(touristId: string | undefined, tourId: string | undefined) {
  return useQuery({
    queryKey: purchaseKeys.purchasedStatus(touristId ?? '', tourId ?? ''),
    queryFn: () => purchaseService.hasPurchased(touristId!, tourId!),
    enabled: !!touristId && !!tourId,
  });
}

export function useMyPurchases(enabled = true) {
  return useQuery({
    queryKey: purchaseKeys.purchases,
    queryFn: () => purchaseService.getMyPurchases(),
    enabled,
  });
}

export function useRefundPurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tokenId: string) => purchaseService.refundPurchase(tokenId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.purchases });
      queryClient.invalidateQueries({ queryKey: ['purchasedStatus'] });
    },
  });
}
