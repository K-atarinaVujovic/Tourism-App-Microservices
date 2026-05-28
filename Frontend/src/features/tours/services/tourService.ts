import apiClient from '@/lib/api-client';
import type {CreateTourTransportTimePayload, PublishedTourPreview, Tour, TourTransportTime} from '@/types/tour';

export type TourDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface CreateTourPayload {
    name: string;
    description: string;
    difficulty: TourDifficulty;
    tags: string[];
}

export const tourService = {
    create: async (payload: CreateTourPayload): Promise<Tour> => {
        const { data } = await apiClient.post<Tour>('/tours/tours', payload);
        return data;
    },

    getAll: async (): Promise<Tour[]> => {
        const { data } = await apiClient.get<Tour[]>('/tours/tours');
        return data;
    },

    getMyTours: async (): Promise<Tour[]> => {
        const { data } = await apiClient.get<Tour[]>('/tours/tours/my');
        return data;
    },

    getById: async (id: number): Promise<Tour> => {
        const { data } = await apiClient.get<Tour>(`/tours/tours/${id}`);
        return data;
    },

    updateLength: async (id: number, lengthInKm: number): Promise<Tour> => {
        const { data } = await apiClient.put<Tour>(`/tours/tours/${id}/length`, {
            lengthInKm,
        });
        return data;
    },

    update: async (id: number, payload: Partial<CreateTourPayload>): Promise<Tour> => {
        const { data } = await apiClient.put<Tour>(`/tours/tours/${id}`, payload);
        return data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/tours/tours/${id}`);
    },

    createTransportTime: async (
        tourId: number,
        payload: CreateTourTransportTimePayload
    ): Promise<TourTransportTime> => {
        const { data } = await apiClient.post<TourTransportTime>(
            `/tours/tours/${tourId}/transport-times`,
            payload
        );
        return data;
    },

    getTransportTimes: async (tourId: number): Promise<TourTransportTime[]> => {
        const { data } = await apiClient.get<TourTransportTime[]>(
            `/tours/tours/${tourId}/transport-times`
        );
        return data;
    },

    publish: async (id: number): Promise<Tour> => {
        const { data } = await apiClient.put<Tour>(`/tours/tours/${id}/publish`);
        return data;
    },

    archive: async (id: number): Promise<Tour> => {
        const { data } = await apiClient.put<Tour>(`/tours/tours/${id}/archive`);
        return data;
    },

    reactivate: async (id: number): Promise<Tour> => {
        const { data } = await apiClient.put<Tour>(`/tours/tours/${id}/reactivate`);
        return data;
    },

    getPublishedPreviews: async (): Promise<PublishedTourPreview[]> => {
        const { data } = await apiClient.get<PublishedTourPreview[]>('/tours/tours/published');
        return data;
    },
};