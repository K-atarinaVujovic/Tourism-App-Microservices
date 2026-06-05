import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient, useQueries } from '@tanstack/react-query';
import { purchaseKeys } from '@/features/purchases/hooks/usePurchases';
import { purchaseService } from '@/features/purchases/services/purchaseService';
import type { Tour } from '@/types/tour';
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

export function usePurchasedTours(enabled = true) {
    const purchasesQuery = useQuery({
        queryKey: purchaseKeys.purchases,
        queryFn: () => purchaseService.getMyPurchases(),
        enabled,
    });

    const tourIds = useMemo(() => {
        const ids = (purchasesQuery.data?.tokens ?? [])
            .map(token => Number(token.tourId))
            .filter(id => Number.isFinite(id) && id > 0);
        return [...new Set(ids)];
    }, [purchasesQuery.data]);

    const tourQueries = useQueries({
        queries: tourIds.map(id => ({
            queryKey: tourKeys.detail(id),
            queryFn: () => tourService.getById(id),
            enabled: enabled && purchasesQuery.isSuccess,
        })),
    });

    const tours = tourQueries
        .map(query => query.data)
        .filter((tour): tour is Tour => tour != null);

    return {
        data: tours,
        isLoading:
            purchasesQuery.isLoading ||
            (tourIds.length > 0 && tourQueries.some(query => query.isLoading)),
        isError: purchasesQuery.isError || tourQueries.some(query => query.isError),
        isFetching: purchasesQuery.isFetching || tourQueries.some(query => query.isFetching),
    };
}