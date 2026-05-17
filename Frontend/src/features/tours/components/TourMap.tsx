import { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Trash2, Edit2, MapPin } from 'lucide-react';
import { fetchRoute } from '../services/routingService';
import KeypointFormPanel from './KeypointFormPanel';
import type { Keypoint } from '@/types/tour';
import type { LatLng } from '@/store/positionStore';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface KeypointFormValues {
    name: string;
    description: string;
    latitude: number;
    longitude: number;
}

// ---------------------------------------------------------------------------
// Custom marker icons
// ---------------------------------------------------------------------------

function createKeypointIcon(order: number, active: boolean) {
    return L.divIcon({
        html: `<div style="
      background:${active ? 'var(--accent, #6366f1)' : '#3b82f6'};
      color:#fff;width:30px;height:30px;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-weight:700;font-size:13px;
      border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);
    ">${order}</div>`,
        className: '',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -32],
    });
}

const draftIcon = L.divIcon({
    html: `<div style="
    background:#f59e0b;color:#fff;width:26px;height:26px;border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);
  ">?</div>`,
    className: '',
    iconSize: [26, 26],
    iconAnchor: [13, 26],
});

// ---------------------------------------------------------------------------
// Inner click-handler component (must live inside MapContainer)
// ---------------------------------------------------------------------------

function MapClickHandler({
                             onMapClick,
                         }: {
    onMapClick: (lat: number, lng: number) => void;
}) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

// ---------------------------------------------------------------------------
// TourMap
// ---------------------------------------------------------------------------

/**
 * TODO (backend integration):
 *   1. Replace `keypoints` local state with `const { data: keypoints = [] } = useKeypoints(tourId)`.
 *   2. Replace local create/update/delete handlers with the corresponding mutation hooks.
 *   3. `tourId` will come from `useParams()` once this lives under `/tours/:id/edit`.
 */
export default function TourMap() {
    // ── Local keypoint state (swap for useKeypoints hook when backend is ready) ──
    const [keypoints, setKeypoints] = useState<Keypoint[]>([]);
    const [nextId, setNextId] = useState(1); // temporary local id counter

    // ── Map interaction state ──
    const [isPickingMode, setIsPickingMode] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingKeypoint, setEditingKeypoint] = useState<Keypoint | null>(null);
    const [draftLatLng, setDraftLatLng] = useState<LatLng | null>(null);

    // ── Route state ──
    const [route, setRoute] = useState<[number, number][]>([]);
    const [routeError, setRouteError] = useState(false);

    // ── Re-fetch route whenever keypoints change ──
    useEffect(() => {
        if (keypoints.length < 2) {
            setRoute([]);
            setRouteError(false);
            return;
        }
        const ordered = [...keypoints].sort((a, b) => a.order - b.order);
        const waypoints = ordered.map((kp) => ({ lat: kp.latitude, lng: kp.longitude }));

        fetchRoute(waypoints)
            .then((coords) => {
                setRoute(coords);
                setRouteError(false);
            })
            .catch(() => setRouteError(true));
    }, [keypoints]);

    // ── Map click handler ──
    const handleMapClick = useCallback(
        (lat: number, lng: number) => {
            if (isPickingMode) {
                // User was picking a location for the open form — update coords and return to form
                setDraftLatLng({ lat, lng });
                setIsPickingMode(false);
                return;
            }
            if (isFormOpen) return; // ignore stray clicks while form is open
            // Open create form at clicked position
            setEditingKeypoint(null);
            setDraftLatLng({ lat, lng });
            setIsFormOpen(true);
        },
        [isPickingMode, isFormOpen]
    );

    // ── Form actions ──
    const handleFormSubmit = (values: KeypointFormValues, _image: File | null) => {
        /**
         * TODO (backend integration):
         *   CREATE → call createKeypoint mutation with { ...values, tourId, order, image }
         *   UPDATE → call updateKeypoint mutation with { id, payload: { ...values, image } }
         *   On success TanStack Query will invalidate and re-fetch automatically.
         */
        if (editingKeypoint) {
            setKeypoints((prev) =>
                prev.map((kp) =>
                    kp.id === editingKeypoint.id
                        ? { ...kp, ...values }
                        : kp
                )
            );
        } else {
            const newKeypoint: Keypoint = {
                id: nextId,
                tourId: 0, // TODO: real tourId from URL params
                order: keypoints.length + 1,
                imageUrl: undefined,
                ...values,
            };
            setKeypoints((prev) => [...prev, newKeypoint]);
            setNextId((n) => n + 1);
        }
        closeForm();
    };

    const handleEdit = (kp: Keypoint) => {
        setEditingKeypoint(kp);
        setDraftLatLng({ lat: kp.latitude, lng: kp.longitude });
        setIsFormOpen(true);
    };

    const handleDelete = (id: number) => {
        // TODO (backend): call deleteKeypoint mutation
        setKeypoints((prev) => {
            const filtered = prev.filter((kp) => kp.id !== id);
            return filtered.map((kp, i) => ({ ...kp, order: i + 1 }));
        });
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingKeypoint(null);
        setDraftLatLng(null);
        setIsPickingMode(false);
    };

    const handlePickLocation = () => {
        setIsPickingMode(true);
    };

    // ── Render ──
    return (
        <div className="relative h-[calc(100vh-3.5rem)] w-full overflow-hidden">
            <MapContainer
                center={[44.0165, 21.0059]} // Serbia center; TODO: derive from tour or user location
                zoom={7}
                className="h-full w-full"
                zoomControl={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler onMapClick={handleMapClick} />

                {/* Road-following route polyline */}
                {route.length > 0 && (
                    <Polyline
                        positions={route}
                        pathOptions={{ color: '#6366f1', weight: 4, opacity: 0.8 }}
                    />
                )}

                {/* Keypoint markers */}
                {keypoints.map((kp) => (
                    <Marker
                        key={kp.id}
                        position={[kp.latitude, kp.longitude]}
                        icon={createKeypointIcon(kp.order, editingKeypoint?.id === kp.id)}
                    >
                        <Popup>
                            <div className="min-w-40">
                                <p className="font-semibold text-sm mb-1">{kp.name}</p>
                                <p className="text-xs text-gray-600 mb-3">{kp.description}</p>
                                {kp.imageUrl && (
                                    <img
                                        src={kp.imageUrl}
                                        alt={kp.name}
                                        className="w-full h-24 object-cover rounded mb-3"
                                    />
                                )}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(kp)}
                                        className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                    >
                                        <Edit2 className="h-3 w-3" /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(kp.id)}
                                        className="flex items-center gap-1 text-xs text-red-500 hover:underline"
                                    >
                                        <Trash2 className="h-3 w-3" /> Delete
                                    </button>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Draft marker shown while form is open but position not yet confirmed */}
                {isFormOpen && !isPickingMode && draftLatLng && !editingKeypoint && (
                    <Marker position={[draftLatLng.lat, draftLatLng.lng]} icon={draftIcon} />
                )}
            </MapContainer>

            {/* ── Picking-mode overlay ── */}
            {isPickingMode && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1001] pointer-events-none">
                    <div className="flex items-center gap-2 rounded-full bg-amber-50 border border-amber-300 px-4 py-2 shadow-md text-sm text-amber-800">
                        <MapPin className="h-4 w-4" />
                        Click anywhere on the map to set the location
                    </div>
                </div>
            )}

            {/* ── Add keypoint hint (only when idle) ── */}
            {!isFormOpen && !isPickingMode && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
                    <p className="rounded-full bg-black/50 text-white text-xs px-4 py-2 backdrop-blur-sm">
                        Click on the map to add a keypoint
                    </p>
                </div>
            )}

            {/* ── ORS routing error ── */}
            {routeError && (
                <div className="absolute top-4 right-84 z-[1000] pointer-events-none">
                    <p className="rounded-md bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2">
                        Route unavailable — check your ORS API key
                    </p>
                </div>
            )}

            {/* ── Keypoint form side panel ── */}
            <KeypointFormPanel
                isOpen={isFormOpen}
                keypoint={editingKeypoint}
                draftLatLng={draftLatLng}
                onPickLocation={handlePickLocation}
                onSubmit={handleFormSubmit}
                onClose={closeForm}
            />
        </div>
    );
}