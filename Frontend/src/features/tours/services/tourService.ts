import apiClient from '@/lib/api-client';
import type { Tour } from '@/types/tour';

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

    getMyTours: async (): Promise<Tour[]> => {
        const { data } = await apiClient.get<Tour[]>('/tours/tours/my');
        return data;
    },

    getById: async (id: number): Promise<Tour> => {
        const { data } = await apiClient.get<Tour>(`/tours/tours/${id}`);
        return data;
    },

    update: async (id: number, payload: Partial<CreateTourPayload>): Promise<Tour> => {
        const { data } = await apiClient.put<Tour>(`/tours/tours/${id}`, payload);
        return data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/tours/tours/${id}`);
    },
};