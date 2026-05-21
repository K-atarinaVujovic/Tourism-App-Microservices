import { useQuery } from '@tanstack/react-query';
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