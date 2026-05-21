export interface Keypoint {
    id: number;
    tourId: number;
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    imageUrl?: string;
    order: number;
}

export type CreateKeypointPayload = {
    tourId: number;
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    order: number;
    image?: File;
};

export type UpdateKeypointPayload = Partial<Omit<CreateKeypointPayload, 'tourId'>>;

export interface Tour {
    id: number;
    name: string;
    description: string;
    authorId: number;
    keypoints: Keypoint[];
}