import apiClient from '@/lib/api-client';
import type { Keypoint, CreateKeypointPayload, UpdateKeypointPayload } from '@/types/tour';

/**
 * All requests target the real backend endpoints.
 * Until the backend is ready these will return network errors —
 * TourMap intentionally uses local state so the map still works.
 */
export const keypointService = {
    getByTour: async (tourId: number): Promise<Keypoint[]> => {
        const { data } = await apiClient.get<Keypoint[]>(`/tours/${tourId}/keypoints`);
        return data;
    },

    create: async (payload: CreateKeypointPayload): Promise<Keypoint> => {
        const form = new FormData();
        form.append('tourId', String(payload.tourId));
        form.append('name', payload.name);
        form.append('description', payload.description);
        form.append('latitude', String(payload.latitude));
        form.append('longitude', String(payload.longitude));
        form.append('order', String(payload.order));
        if (payload.image) form.append('image', payload.image);

        const { data } = await apiClient.post<Keypoint>('/keypoints', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },

    update: async (id: number, payload: UpdateKeypointPayload): Promise<Keypoint> => {
        const form = new FormData();
        if (payload.name !== undefined) form.append('name', payload.name);
        if (payload.description !== undefined) form.append('description', payload.description);
        if (payload.latitude !== undefined) form.append('latitude', String(payload.latitude));
        if (payload.longitude !== undefined) form.append('longitude', String(payload.longitude));
        if (payload.order !== undefined) form.append('order', String(payload.order));
        if (payload.image) form.append('image', payload.image);

        const { data } = await apiClient.put<Keypoint>(`/keypoints/${id}`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/keypoints/${id}`);
    },
};