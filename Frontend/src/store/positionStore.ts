import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LatLng {
    lat: number;
    lng: number;
}

interface PositionStore {
    currentPosition: LatLng | null;
    setPosition: (position: LatLng) => void;
    clearPosition: () => void;
}

export const usePositionStore = create<PositionStore>()(
    persist(
        (set) => ({
            currentPosition: null,
            setPosition: (position) => set({ currentPosition: position }),
            clearPosition: () => set({ currentPosition: null }),
        }),
        {
            name: 'tourist-position',
        }
    )
);