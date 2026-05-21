import axios from 'axios';
import type { LatLng } from '@/store/positionStore';

// OSRM public demo server — no API key required.
// Acceptable for academic / non-commercial use.
// Docs: http://project-osrm.org/docs/v5.24.0/api/
const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

export async function fetchRoute(waypoints: LatLng[]): Promise<[number, number][]> {
    if (waypoints.length < 2) return [];

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

    // GeoJSON geometry coordinates are [lng, lat] — flip to [lat, lng] for Leaflet
    const coords2d = data.routes[0].geometry.coordinates as [number, number][];
    return coords2d.map(([lng, lat]) => [lat, lng]);
}