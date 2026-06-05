import type { CheckLocationResult, TourExecution } from '@/types/tour';
import apiClient from '@/lib/api-client';


export const tourExecutionService = {
    start: async (tourId: number): Promise<string> => {
        const { data } = await apiClient.post<string>(`/tours/tour-executions/start/${tourId}`);
        return data;
    },

    abandon: async (): Promise<string> => {
        const { data } = await apiClient.post<string>('/tours/tour-executions/abandon');
        return data;
    },

    checkLocation: async (lat: number, lon: number): Promise<CheckLocationResult> => {
        const { data } = await apiClient.post<CheckLocationResult>('/tours/tour-executions/check-location', { lat, lon });
        return data;
    },

    getActive: async (): Promise<TourExecution> => {
        const { data } = await apiClient.get<TourExecution>('/tours/tour-executions/active');
        return data;
    },
};