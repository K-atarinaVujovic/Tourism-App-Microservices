import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import { tourService } from '../services/tourService';

export const tourKeys = {
    all: ['tours'] as const,
    published: ['tours', 'published'] as const,
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

export function usePublishTour() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => tourService.publish(id),
        onSuccess: (updatedTour) => {
            queryClient.setQueryData(tourKeys.detail(updatedTour.id), updatedTour);
            queryClient.invalidateQueries({ queryKey: tourKeys.all });
            queryClient.invalidateQueries({ queryKey: tourKeys.myList() });
        },
        onError: (error: any) => {
            alert(error?.response?.data?.message ?? error?.message ?? 'Publish failed');
        },
    });
}

export function useArchiveTour() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => tourService.archive(id),
        onSuccess: (updatedTour) => {
            queryClient.setQueryData(tourKeys.detail(updatedTour.id), updatedTour);
            queryClient.invalidateQueries({ queryKey: tourKeys.all });
            queryClient.invalidateQueries({ queryKey: tourKeys.myList() });
        },
        onError: (error: any) => {
            alert(error?.response?.data?.message ?? error?.message ?? 'Archive failed');
        },
    });
}

export function useReactivateTour() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => tourService.reactivate(id),
        onSuccess: (updatedTour) => {
            queryClient.setQueryData(tourKeys.detail(updatedTour.id), updatedTour);
            queryClient.invalidateQueries({ queryKey: tourKeys.all });
            queryClient.invalidateQueries({ queryKey: tourKeys.myList() });
        },
        onError: (error: any) => {
            alert(error?.response?.data?.message ?? error?.message ?? 'Reactivation failed');
        },
    });
}

export function usePublishedTourPreviews() {
    return useQuery({
        queryKey: tourKeys.published,
        queryFn: tourService.getPublishedPreviews,
    });
}