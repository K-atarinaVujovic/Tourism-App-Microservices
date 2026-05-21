import apiClient from '@/lib/api-client';
import type { Keypoint, CreateKeypointPayload, UpdateKeypointPayload } from '@/types/tour';

export const keypointService = {
    getByTour: async (tourId: number): Promise<Keypoint[]> => {
        const { data } = await apiClient.get<Keypoint[]>(`/tours/tours/${tourId}/key-points`);
        return data;
    },

    create: async (tourId: number, payload: CreateKeypointPayload): Promise<Keypoint> => {
        const { data } = await apiClient.post<Keypoint>(
            `/tours/tours/${tourId}/key-points`,
            payload,
        );
        return data;
    },

    update: async (tourId: number, id: number, payload: UpdateKeypointPayload): Promise<Keypoint> => {
        const { data } = await apiClient.put<Keypoint>(
            `/tours/tours/${tourId}/key-points/${id}`,
            payload,
        );
        return data;
    },

    delete: async (tourId: number, id: number): Promise<void> => {
        await apiClient.delete(`/tours/tours/${tourId}/key-points/${id}`);
    },
};