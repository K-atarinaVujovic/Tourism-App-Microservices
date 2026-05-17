import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '../services/reviewService';
import type { CreateReviewPayload } from '@/types/tour';

export const reviewKeys = {
    all: ['reviews'] as const,
    byTour: (tourId: number) => [...reviewKeys.all, tourId] as const,
};

export function useReviews(tourId: number) {
    return useQuery({
        queryKey: reviewKeys.byTour(tourId),
        queryFn: () => reviewService.getByTour(tourId),
        enabled: tourId > 0,
    });
}

export function useCreateReview(tourId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateReviewPayload) =>
            reviewService.create(tourId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: reviewKeys.byTour(tourId) });
        },
    });
}