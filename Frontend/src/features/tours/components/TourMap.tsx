import 'leaflet/dist/leaflet.css';
import { useState, useCallback, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Trash2, Edit2, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
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

interface TourMapProps {
    keypoints: Keypoint[];
    onKeypointsChange: (keypoints: Keypoint[]) => void;
    /**
     * Tailwind class controlling the map container height.
     * Defaults to full viewport minus navbar height.
     */
    className?: string;
}

// ---------------------------------------------------------------------------
// Marker icons
// ---------------------------------------------------------------------------

function createKeypointIcon(order: number, active: boolean) {
    return L.divIcon({
        html: `<div style="
      background:${active ? '#6366f1' : '#3b82f6'};
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
 *   - Replace local keypoint state in TourCreatePage with useKeypoints(tourId).
 *   - Replace the local create/update/delete handlers in TourCreatePage with
 *     the corresponding mutation hooks from useKeypoints.ts.
 *   - tourId will come from useParams() once this lives under /tours/:id/edit.
 */
export default function TourMap({
                                    keypoints,
                                    onKeypointsChange,
                                    className,
                                }: TourMapProps) {
    // Temporary local ID counter — only needed until the backend assigns real IDs
    const nextId = useRef(1);

    // ── Map interaction state ──
    const [isPickingMode, setIsPickingMode] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingKeypoint, setEditingKeypoint] = useState<Keypoint | null>(null);
    const [draftLatLng, setDraftLatLng] = useState<LatLng | null>(null);

    // ── Route state ──
    const [route, setRoute] = useState<[number, number][]>([]);
    const [routeError, setRouteError] = useState<string | null>(null);

    // ── Re-fetch ORS route whenever keypoints change ──
    useEffect(() => {
        if (keypoints.length < 2) {
            setRoute([]);
            setRouteError(null);
            return;
        }
        const ordered = [...keypoints].sort((a, b) => a.order - b.order);
        const waypoints = ordered.map((kp) => ({ lat: kp.latitude, lng: kp.longitude }));

        fetchRoute(waypoints)
            .then((coords) => {
                setRoute(coords);
                setRouteError(null);
            })
            .catch((err: unknown) => {
                const msg =
                    err instanceof Error ? err.message : String(err);
                console.error('[TourMap] ORS routing failed:', err);
                setRouteError(msg);
            });
    }, [keypoints]);

    // ── Map click handler ──
    const handleMapClick = useCallback(
        (lat: number, lng: number) => {
            if (isPickingMode) {
                setDraftLatLng({ lat, lng });
                setIsPickingMode(false);
                return;
            }
            if (isFormOpen) return;
            setEditingKeypoint(null);
            setDraftLatLng({ lat, lng });
            setIsFormOpen(true);
        },
        [isPickingMode, isFormOpen]
    );

    // ── CRUD handlers ──
    const handleFormSubmit = (values: KeypointFormValues, _image: File | null) => {
        /**
         * TODO (backend integration):
         *   CREATE → keypointService.create({ ...values, tourId, order, image })
         *   UPDATE → keypointService.update(id, { ...values, image })
         *   On success, invalidate the keypoints query — local state goes away.
         */
        if (editingKeypoint) {
            onKeypointsChange(
                keypoints.map((kp) =>
                    kp.id === editingKeypoint.id ? { ...kp, ...values } : kp
                )
            );
        } else {
            const newKeypoint: Keypoint = {
                id: nextId.current++,
                tourId: 0, // TODO: real tourId from URL params / creation response
                order: keypoints.length + 1,
                imageUrl: undefined,
                ...values,
            };
            onKeypointsChange([...keypoints, newKeypoint]);
        }
        closeForm();
    };

    const handleEdit = (kp: Keypoint) => {
        setEditingKeypoint(kp);
        setDraftLatLng({ lat: kp.latitude, lng: kp.longitude });
        setIsFormOpen(true);
    };

    const handleDelete = (id: number) => {
        // TODO (backend): keypointService.delete(id)
        const filtered = keypoints.filter((kp) => kp.id !== id);
        onKeypointsChange(filtered.map((kp, i) => ({ ...kp, order: i + 1 })));
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingKeypoint(null);
        setDraftLatLng(null);
        setIsPickingMode(false);
    };

    // ── Render ──
    return (
        <div
            className={cn(
                'relative w-full overflow-hidden',
                className ?? 'h-[calc(100vh-3.5rem)]'
            )}
        >
            <MapContainer
                center={[44.0165, 21.0059]}
                zoom={7}
                className="h-full w-full"
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

                {/* Draft marker while form is open for a new keypoint */}
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

            {/* ── Idle hint ── */}
            {!isFormOpen && !isPickingMode && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
                    <p className="rounded-full bg-black/50 text-white text-xs px-4 py-2 backdrop-blur-sm">
                        Click on the map to add a keypoint
                    </p>
                </div>
            )}

            {/* ── ORS routing error ── */}
            {routeError && (
                <div className="absolute top-4 right-[22rem] z-[1000] pointer-events-none max-w-xs">
                    <p className="rounded-md bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2">
                        Route unavailable: {routeError}
                    </p>
                </div>
            )}

            {/* ── Keypoint form side panel ── */}
            <KeypointFormPanel
                isOpen={isFormOpen}
                keypoint={editingKeypoint}
                draftLatLng={draftLatLng}
                onPickLocation={() => setIsPickingMode(true)}
                onSubmit={handleFormSubmit}
                onClose={closeForm}
            />
        </div>
    );
}