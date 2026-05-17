import { useState } from 'react';
import { Map, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import TourMap from '@/features/tours/components/TourMap';
import PositionSimulator from '@/features/simulator/components/PositionSimulator';

type MapMode = 'author' | 'tourist';

/**
 * TODO (Stakeholders service integration):
 *   The application role (guide / tourist / author) lives in the Profile model
 *   on the Stakeholders service — it is NOT in the JWT.
 *
 *   Once that service exists:
 *   1. Fetch the profile on login and store the app role (e.g. in authStore or a profileStore).
 *   2. Read the role here and remove the mode toggle entirely:
 *        const appRole = useProfileStore((s) => s.role);
 *        if (appRole === 'AUTHOR' || appRole === 'GUIDE') return <TourMap />;
 *        return <PositionSimulator />;
 */
export default function MapPage() {
    const [mode, setMode] = useState<MapMode>('tourist');

    return (
        <div className="relative h-[calc(100vh-3.5rem)]">
            {/* Temporary mode switcher — remove once Stakeholders profile is available */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1001] flex rounded-lg border border-(--border) bg-(--bg) shadow-md p-0.5 gap-0.5">
                <ModeButton
                    active={mode === 'tourist'}
                    icon={<Navigation className="h-3.5 w-3.5" />}
                    label="Tourist view"
                    onClick={() => setMode('tourist')}
                />
                <ModeButton
                    active={mode === 'author'}
                    icon={<Map className="h-3.5 w-3.5" />}
                    label="Author view"
                    onClick={() => setMode('author')}
                />
            </div>

            {mode === 'author' ? <TourMap /> : <PositionSimulator />}
        </div>
    );
}

function ModeButton({
                        active,
                        icon,
                        label,
                        onClick,
                    }: {
    active: boolean;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                active
                    ? 'bg-(--accent) text-white'
                    : 'text-(--text) hover:bg-(--accent-bg)'
            )}
        >
            {icon}
            {label}
        </button>
    );
}