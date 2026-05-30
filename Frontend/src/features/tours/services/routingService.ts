import axios from 'axios';
import type { LatLng } from '@/store/positionStore';

// OSRM public demo server — no API key required.
// Acceptable for academic / non-commercial use.
// Docs: http://project-osrm.org/docs/v5.24.0/api/
const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

export type RouteResult = {
    lengthInKm: number;
    routeCoordinates: [number, number][];
};

export async function fetchRoute(waypoints: LatLng[]): Promise<RouteResult> {
    if (waypoints.length < 2){
        return {
            lengthInKm: 0,
            routeCoordinates: [],
        };
    }

    // OSRM expects coordinates as a semicolon-separated list of "lng,lat" pairs
    const coords = waypoints.map(({ lat, lng }) => `${lng},${lat}`).join(';');

    const { data } = await axios.get(`${OSRM_BASE}/${coords}`, {
        params: {
            overview: 'full',      // return the full geometry, not simplified
            geometries: 'geojson', // ask for GeoJSON so we get [lng, lat] arrays
        },
    });

    if (data.code !== 'Ok' || !data.routes?.length) {
        throw new Error(`OSRM returned no route: ${data.code}`);
    }

    const distanceInMeters = data.routes[0].distance;
    const lengthInKm = Math.round((distanceInMeters / 1000) * 100) / 100;

    // GeoJSON geometry coordinates are [lng, lat] — flip to [lat, lng] for Leaflet
    const coords2d = data.routes[0].geometry.coordinates as [number, number][];
    const routeCoordinates = coords2d.map(([lng, lat]) => [lat, lng] as [number, number]);

    return {
        lengthInKm,
        routeCoordinates,
    };
}