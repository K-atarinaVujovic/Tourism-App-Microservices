import type { TourDifficulty } from '@/features/tours/services/tourService';

// ── Keypoint ────────────────────────────────────────────────────────────────

export type KeypointType =
    | 'MUSEUM'
    | 'PARK'
    | 'MONUMENT';

export interface Keypoint {
    id: number;
    tourId: number;
    name: string;
    description: string;
    type: KeypointType;
    imageUrl?: string;
    latitude: number;
    longitude: number;
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
}

// ── Tour ─────────────────────────────────────────────────────────────────────

export interface Tour {
    id: number;
    authorId: number;
    authorUsername: string;
    name: string;
    description: string;
    difficulty: TourDifficulty;
    tags: string[];
    status: 'DRAFT' | 'PUBLISHED';
    price: number;
    keypoints?: Keypoint[];
}

// ── Tour Review ───────────────────────────────────────────────────────────────

export interface TourReview {
    id: number;
    tourId: number;
    touristId: number;
    touristUsername: string;
    rating: number;       // 1–5
    comment: string;
    visitedAt: string;    // ISO date string "YYYY-MM-DD" (Java LocalDate)
    commentedAt: string;  // ISO datetime string (Java LocalDateTime)
    imageUrls: string[];
}

export interface CreateReviewPayload {
    rating: number;
    comment: string;
    visitedAt: string;    // "YYYY-MM-DD"
    imageUrls?: string[];
}