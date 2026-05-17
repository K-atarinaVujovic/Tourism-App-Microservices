import type { TourDifficulty } from '@/features/tours/services/tourService';

// ── Keypoint ────────────────────────────────────────────────────────────────

export type KeypointType =
    | 'MUSEUM'
    | 'PARK'
    | 'MONUMENT'
    | 'RESTAURANT'
    | 'VIEWPOINT'
    | 'OTHER';

export interface Keypoint {
    id: number;
    tourId: number;
    name: string;
    description: string;
    type: KeypointType;
    imageUrl?: string;
    latitude: number;
    longitude: number;
    order: number;
}

export interface CreateKeypointPayload {
    name: string;
    description: string;
    type: KeypointType;
    imageUrl?: string;
    latitude: number;
    longitude: number;
}

export interface UpdateKeypointPayload {
    name?: string;
    description?: string;
    type?: KeypointType;
    imageUrl?: string;
    latitude?: number;
    longitude?: number;
    order?: number;
}

// ── Tour ─────────────────────────────────────────────────────────────────────

export interface Tour {
    id: number;
    name: string;
    description: string;
    difficulty: TourDifficulty;
    tags: string[];
    status: 'DRAFT' | 'PUBLISHED';
    price: number;
    authorId: number;
    keypoints?: Keypoint[];
}