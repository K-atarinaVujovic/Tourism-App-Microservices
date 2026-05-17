import apiClient from '@/lib/api-client';
import type { Tour } from '@/types/tour';

export interface CreateTourPayload {
    name: string;
    description: string;
}

/**
 * Keypoints are created separately via keypointService after the tour is saved
 * and the backend returns a tourId. See TourCreatePage for the full flow.
 */
export const tourService = {
    create: async (payload: CreateTourPayload): Promise<Tour> => {
        const { data } = await apiClient.post<Tour>('/tours', payload);
        return data;
    },

    getById: async (id: number): Promise<Tour> => {
        const { data } = await apiClient.get<Tour>(`/tours/${id}`);
        return data;
    },

    update: async (id: number, payload: Partial<CreateTourPayload>): Promise<Tour> => {
        const { data } = await apiClient.put<Tour>(`/tours/${id}`, payload);
        return data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/tours/${id}`);
    },
};