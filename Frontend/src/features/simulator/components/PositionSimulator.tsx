import 'leaflet/dist/leaflet.css';
import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, MapPin, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePositionStore, type LatLng } from '@/store/positionStore';

// ---------------------------------------------------------------------------
// Custom marker icons
// ---------------------------------------------------------------------------

const currentPositionIcon = L.divIcon({
    html: `<div style="
    background:#6366f1;color:#fff;width:28px;height:28px;border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    border:3px solid #fff;box-shadow:0 0 0 3px rgba(99,102,241,0.35),0 2px 6px rgba(0,0,0,0.3);
  ">
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
    </svg>
  </div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -18],
});

const pendingIcon = L.divIcon({
    html: `<div style="
    background:#f59e0b;color:#fff;width:28px;height:28px;border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);
    animation:pulse 1.5s ease-in-out infinite;
  ">
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  </div>
  <style>@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}</style>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -32],
});

// ---------------------------------------------------------------------------
// Inner click-handler
// ---------------------------------------------------------------------------

function MapClickHandler({
                             onMapClick,
                         }: {
    onMapClick: (latlng: LatLng) => void;
}) {
    useMapEvents({
        click(e) {
            onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });
    return null;
}

// ---------------------------------------------------------------------------
// PositionSimulator
// ---------------------------------------------------------------------------

export default function PositionSimulator() {
    const { currentPosition, setPosition, clearPosition } = usePositionStore();
    const [pendingPosition, setPendingPosition] = useState<LatLng | null>(null);

    const handleMapClick = (latlng: LatLng) => {
        setPendingPosition(latlng);
    };

    const confirmPosition = () => {
        if (!pendingPosition) return;
        setPosition(pendingPosition);
        setPendingPosition(null);
    };

    const cancelPending = () => setPendingPosition(null);

    const mapCenter: [number, number] = currentPosition
        ? [currentPosition.lat, currentPosition.lng]
        : [44.0165, 21.0059]; // Serbia center fallback

    return (
        <div className="relative h-[calc(100vh-3.5rem)] w-full overflow-hidden">
            <MapContainer
                center={mapCenter}
                zoom={currentPosition ? 13 : 7}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler onMapClick={handleMapClick} />

                {/* Confirmed current position */}
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

                {/* Pending (unconfirmed) position */}
                {pendingPosition && (
                    <Marker position={[pendingPosition.lat, pendingPosition.lng]} icon={pendingIcon}>
                        <Popup>
                            <p className="text-xs text-gray-500">Confirm below to set this as your position</p>
                        </Popup>
                    </Marker>
                )}
            </MapContainer>

            {/* ── Instruction hint ── */}
            {!pendingPosition && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
                    <div className="flex items-center gap-2 rounded-full bg-black/50 backdrop-blur-sm px-4 py-2 shadow text-white text-sm">
                        <MapPin className="h-4 w-4" />
                        Click anywhere on the map to set your position
                    </div>
                </div>
            )}

            {/* ── Current position badge (top-left) ── */}
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

            {/* ── Pending position confirmation panel ── */}
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
                                onClick={cancelPending}
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
    );
}