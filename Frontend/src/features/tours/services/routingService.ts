import axios from 'axios';
import type { LatLng } from '@/store/positionStore';

const ORS_BASE = 'https://api.openrouteservice.org/v2';
const API_KEY = import.meta.env.VITE_ORS_API_KEY as string;

/**
 * Fetches a driving route from ORS for the given ordered waypoints.
 *
 * ORS expects coordinates as [lng, lat].
 * Leaflet expects positions as [lat, lng].
 * This function handles the conversion in both directions.
 *
 * Returns an empty array when fewer than 2 waypoints are provided.
 */
export async function fetchRoute(waypoints: LatLng[]): Promise<[number, number][]> {
    if (waypoints.length < 2) return [];

    // ORS wants [longitude, latitude]
    const coordinates = waypoints.map(({ lat, lng }) => [lng, lat]);

    const { data } = await axios.post(
        `${ORS_BASE}/directions/driving-car/geojson`,
        { coordinates },
        {
            headers: {
                Authorization: API_KEY,
                'Content-Type': 'application/json',
            },
        }
    );

    // GeoJSON gives [lng, lat], Leaflet needs [lat, lng]
    const coords = data.features[0].geometry.coordinates as [number, number][];
    return coords.map(([lng, lat]) => [lat, lng]);
}