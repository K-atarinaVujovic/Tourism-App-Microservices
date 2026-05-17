import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { keypointService } from '../services/keypointService';
import type { CreateKeypointPayload, UpdateKeypointPayload } from '@/types/tour';

const keypointKeys = {
    all: ['keypoints'] as const,
    byTour: (tourId: number) => [...keypointKeys.all, tourId] as const,
};

export function useKeypoints(tourId: number) {
    return useQuery({
        queryKey: keypointKeys.byTour(tourId),
        queryFn: () => keypointService.getByTour(tourId),
        enabled: tourId > 0,
    });
}

export function useCreateKeypoint(tourId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateKeypointPayload) => keypointService.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: keypointKeys.byTour(tourId) });
        },
    });
}

export function useUpdateKeypoint(tourId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: UpdateKeypointPayload }) =>
            keypointService.update(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: keypointKeys.byTour(tourId) });
        },
    });
}

export function useDeleteKeypoint(tourId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => keypointService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: keypointKeys.byTour(tourId) });
        },
    });
}