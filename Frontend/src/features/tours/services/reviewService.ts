import apiClient from '@/lib/api-client';
import type { TourReview, CreateReviewPayload } from '@/types/tour';

export const reviewService = {
    getByTour: async (tourId: number): Promise<TourReview[]> => {
        const { data } = await apiClient.get<TourReview[]>(`/tours/tours/${tourId}/reviews`);
        return data;
    },

    create: async (tourId: number, payload: CreateReviewPayload): Promise<TourReview> => {
        const { data } = await apiClient.post<TourReview>(
            `/tours/tours/${tourId}/reviews`,
            payload,
        );
        return data;
    },
};