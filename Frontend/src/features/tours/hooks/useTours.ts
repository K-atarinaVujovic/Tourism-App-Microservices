import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import { tourService } from '../services/tourService';

export const tourKeys = {
    all: ['tours'] as const,
    lists: () => [...tourKeys.all, 'list'] as const,
    myList: () => [...tourKeys.all, 'my'] as const,
    detail: (id: number) => [...tourKeys.all, id] as const,
};

export function useAllTours() {
    return useQuery({
        queryKey: tourKeys.lists(),
        queryFn: () => tourService.getAll(),
    });
}

export function useMyTours() {
    return useQuery({
        queryKey: tourKeys.myList(),
        queryFn: () => tourService.getMyTours(),
    });
}

export function useTour(id: number) {
    return useQuery({
        queryKey: tourKeys.detail(id),
        queryFn: () => tourService.getById(id),
        enabled: id > 0,
    });
}

export function useUpdateTourLength() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, lengthInKm }: { id: number; lengthInKm: number }) =>
            tourService.updateLength(id, lengthInKm),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tourKeys.all });
        },
    });
}

export function useTransportTimes(tourId: number) {
    return useQuery({
        queryKey: ['tours', tourId, 'transport-times'],
        queryFn: () => tourService.getTransportTimes(tourId),
        enabled: !!tourId,
    });
}

export function useCreateTransportTime(tourId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: tourService.createTransportTime.bind(null, tourId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tours', tourId, 'transport-times'] });
            queryClient.invalidateQueries({ queryKey: ['tours'] });
        },
    });
}