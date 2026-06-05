import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tourExecutionService } from '../services/tourExecutionService';

export const executionKeys = {
    active: ['tour-execution', 'active'] as const,
};

export function useActiveTourExecution() {
    return useQuery({
        queryKey: executionKeys.active,
        queryFn: () => tourExecutionService.getActive(),
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });
}
export function useStartTourExecution() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (tourId: number) => tourExecutionService.start(tourId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: executionKeys.active });
        },
    });
}

export function useAbandonTourExecution() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => tourExecutionService.abandon(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: executionKeys.active });
        },
    });
}

export function useCheckLocation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ lat, lon }: { lat: number; lon: number }) =>
            tourExecutionService.checkLocation(lat, lon),
        onSuccess: (result) => {
            if (result.reachedKeyPointIds?.length > 0 && !result.tourCompleted) {
                queryClient.invalidateQueries({ queryKey: executionKeys.active });
            }
        },
    });
}