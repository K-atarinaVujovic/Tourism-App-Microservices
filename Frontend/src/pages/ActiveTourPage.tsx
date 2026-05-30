import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, MapPin, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useActiveTourExecution, useAbandonTourExecution, useCheckLocation } from '@/features/tours/hooks/useTourExecutions';
import { usePositionStore, type LatLng } from '@/store/positionStore';
import { fetchRoute } from '@/features/tours/services/routingService';
import type { Keypoint } from '@/types/tour';
import waypointImg from '@/assets/icons/bread.png';
import positionImg from '@/assets/icons/duck.png';
import { useQueryClient } from '@tanstack/react-query';
import { executionKeys } from '@/features/tours/hooks/useTourExecutions';

// ── Icons ────────────────────────────────────────────────────────────────────

const currentPositionIcon = L.icon({ iconUrl: positionImg, iconSize: [48, 48] });
const pendingIcon = L.icon({ iconUrl: waypointImg, iconSize: [48, 48] });

function createKeypointIcon(order: number, reached: boolean) {
    return L.divIcon({
        html: `<div style="
            background:${reached ? '#22c55e' : '#3b82f6'};
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

// ── Map helpers ───────────────────────────────────────────────────────────────

function FocusOnMount({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap();
    const didFocus = useRef(false);
    useEffect(() => {
        if (!didFocus.current) {
            map.setView([lat, lng], 15);
            didFocus.current = true;
        }
    }, []);
    return null;
}

function MapClickHandler({ onMapClick }: { onMapClick: (latlng: LatLng) => void }) {
    useMapEvents({
        click(e) {
            onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });
    return null;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ActiveTourPage() {
    const { data: execution, isLoading, isError } = useActiveTourExecution();
    const abandon = useAbandonTourExecution();
    const checkLocation = useCheckLocation();
    const { currentPosition, setPosition, clearPosition } = usePositionStore();

    const [pendingPosition, setPendingPosition] = useState<LatLng | null>(null);
    const [route, setRoute] = useState<[number, number][]>([]);
    const completedAlerted = useRef(false);

    const keypoints: Keypoint[] = execution?.tour.keyPoints ?? [];

    const reachedIds = new Set(
        execution?.keyPointProgresses
            .filter(p => p.timeReached !== null)
            .map(p => p.keyPointId) ?? []
    );

    const confirmPosition = () => {
        if (!pendingPosition) return;
        setPosition(pendingPosition);
        setPendingPosition(null);
    };

    // Build route from keypoints
    useEffect(() => {
        if (keypoints.length < 2) { setRoute([]); return; }
        const waypoints = keypoints.map(kp => ({ lat: kp.latitude, lng: kp.longitude }));
        fetchRoute(waypoints)
            .then(r => setRoute(r.routeCoordinates))
            .catch(() => setRoute([]));
    }, [execution?.tour.tourId]);

    // Poll check-location every 10 seconds
    const currentPositionRef = useRef(currentPosition);
    useEffect(() => {
        currentPositionRef.current = currentPosition;
    }, [currentPosition]);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const queryClient = useQueryClient();
    useEffect(() => {
      if (!execution) return;

      console.log('[polling] starting interval');
      intervalRef.current = setInterval(() => {
          const pos = currentPositionRef.current;
          if (!pos) {
              console.log('[polling] no position yet, skipping');
              return;
          }
          console.log('[polling] firing check at', pos);
          checkLocation.mutate(
              { lat: pos.lat, lon: pos.lng },
              {
                  onSuccess: (result) => {
                      console.log('[checkLocation] result:', result);
                      if (result.reachedKeyPointIds?.length > 0) {
                          console.log('[checkLocation] 🔓 reached KPs:', result.reachedKeyPointIds);
                      }
                      if (result.tourCompleted && !completedAlerted.current) {
                        completedAlerted.current = true;
                        if (intervalRef.current) {
                            clearInterval(intervalRef.current);
                            intervalRef.current = null;
                        }
                        alert('You completed the tour! Gj!');
                        queryClient.invalidateQueries({ queryKey: executionKeys.active });
                    }
                  },
                  onError: (err) => console.error('[checkLocation] error:', err),
              }
          );
      }, 10_000);

      return () => {
          if (intervalRef.current) clearInterval(intervalRef.current);
      };
  }, [execution]);

    const firstKeypoint = keypoints[0];

    // ── No active tour ───────────────────────────────────────────────────────

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-(--bg)">
                <p className="text-sm text-(--text)/50">Loading…</p>
            </div>
        );
    }

    if (isError || !execution) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-(--bg)">
                <p className="text-sm text-(--text)/50">No active tour :(</p>
            </div>
        );
    }

    // ── Active tour ──────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col min-h-screen bg-(--bg)">

            {/* Header */}
            <div className="px-4 py-5 border-b border-(--border)">
                <h1 className="text-xl font-bold text-(--text-h)">{execution.tour.tourName}</h1>
                <p className="text-xs text-(--text)/50 mt-0.5">
                    {reachedIds.size} / {keypoints.length} keypoints reached
                </p>
            </div>

            {/* Map */}
            <div className="relative flex-1 min-h-[60vh]">
                <MapContainer
                    center={[44.0165, 21.0059]}
                    zoom={7}
                    className="h-full w-full"
                    style={{ minHeight: '60vh' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <MapClickHandler onMapClick={latlng => setPendingPosition(latlng)} />

                    {firstKeypoint && (
                        <FocusOnMount lat={firstKeypoint.latitude} lng={firstKeypoint.longitude} />
                    )}

                    {route.length > 0 && (
                        <Polyline
                            positions={route}
                            pathOptions={{ color: '#6366f1', weight: 4, opacity: 0.8 }}
                        />
                    )}

                    {keypoints.map((kp, index) => (
                        <Marker
                            key={kp.id}
                            position={[kp.latitude, kp.longitude]}
                            icon={createKeypointIcon(index + 1, reachedIds.has(kp.id))}
                        >
                            <Popup>
                                <div className="min-w-36">
                                    <p className="font-semibold text-sm mb-0.5">{kp.name}</p>
                                    <p className="text-xs text-gray-500 mb-1">{kp.type}</p>
                                    <p className="text-xs text-gray-600">{kp.description}</p>
                                    <p className={cn(
                                        'text-xs font-medium mt-2',
                                        reachedIds.has(kp.id) ? 'text-green-500' : 'text-blue-500'
                                    )}>
                                        {reachedIds.has(kp.id) ? '✓ Reached' : 'Not yet reached'}
                                    </p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {/* Confirmed position */}
                    {currentPosition && (
                        <Marker position={[currentPosition.lat, currentPosition.lng]} icon={currentPositionIcon}>
                            <Popup>
                                <p className="text-sm font-medium">Your current position</p>
                                <p className="text-xs text-gray-500 font-mono mt-1">
                                    {currentPosition.lat.toFixed(6)}, {currentPosition.lng.toFixed(6)}
                                </p>
                            </Popup>
                        </Marker>
                    )}

                    {/* Pending position */}
                    {pendingPosition && (
                        <Marker position={[pendingPosition.lat, pendingPosition.lng]} icon={pendingIcon}>
                            <Popup>
                                <p className="text-xs text-gray-500">Confirm below to set this as your position</p>
                            </Popup>
                        </Marker>
                    )}
                </MapContainer>

                {/* Instruction hint */}
                {!pendingPosition && !currentPosition && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
                        <div className="flex items-center gap-2 rounded-full bg-black/50 backdrop-blur-sm px-4 py-2 shadow text-white text-sm">
                            <MapPin className="h-4 w-4" />
                            Click anywhere on the map to set your position
                        </div>
                    </div>
                )}

                {/* Current position badge */}
                {currentPosition && !pendingPosition && (
                    <div className="absolute top-4 left-4 z-[1000]">
                        <div className="flex items-center gap-2 rounded-lg bg-(--bg) border border-(--border) shadow px-3 py-2">
                            <Navigation className="h-4 w-4 text-(--accent) shrink-0" />
                            <div>
                                <p className="text-xs font-medium text-(--text-h)">Current position</p>
                                <p className="text-xs font-mono text-(--text)">
                                    {currentPosition.lat.toFixed(5)}, {currentPosition.lng.toFixed(5)}
                                </p>
                            </div>
                            <button
                                onClick={clearPosition}
                                className="ml-1 p-0.5 rounded text-(--text) hover:text-red-500 transition-colors"
                                title="Clear position"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Pending confirmation panel */}
                {pendingPosition && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000]">
                        <div className="flex flex-col items-center gap-3 rounded-xl bg-(--bg) border border-(--border) shadow-xl px-5 py-4">
                            <div className="text-center">
                                <p className="text-sm font-semibold text-(--text-h)">Set this as your position?</p>
                                <p className="text-xs font-mono text-(--text) mt-0.5">
                                    {pendingPosition.lat.toFixed(6)}, {pendingPosition.lng.toFixed(6)}
                                </p>
                            </div>
                            <div className="flex gap-2 w-full">
                                <button
                                    onClick={() => setPendingPosition(null)}
                                    className={cn(
                                        'flex-1 rounded-md border border-(--border) px-4 py-2 text-sm',
                                        'text-(--text) hover:bg-(--accent-bg) transition-colors'
                                    )}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmPosition}
                                    className={cn(
                                        'flex-1 rounded-md px-4 py-2 text-sm font-medium',
                                        'bg-(--accent) text-white hover:opacity-90 transition-opacity'
                                    )}
                                >
                                    Set My Position
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Abandon */}
            <div className="px-4 py-5 border-t border-(--border)">
                <button
                    onClick={() => {
                        if (confirm('Are you sure you want to abandon this tour?')) {
                            abandon.mutate();
                        }
                    }}
                    disabled={abandon.isPending}
                    className={cn(
                        'w-full rounded-lg border border-red-500/40 px-4 py-2.5 text-sm font-medium',
                        'text-red-400 hover:bg-red-500/10 transition-colors',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                    )}
                >
                    {abandon.isPending ? 'Abandoning…' : 'Abandon Tour'}
                </button>
            </div>

        </div>
    );
}