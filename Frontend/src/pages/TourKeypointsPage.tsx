import { useParams, useNavigate } from 'react-router';
import { MapPin, Globe, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import TourMap from '@/features/tours/components/TourMap';
import { useKeypoints } from '@/features/tours/hooks/useKeypoints';
import { useTour } from '@/features/tours/hooks/useTours';
import { useTransportTimes } from '@/features/tours/hooks/useTours';
import TransportTimesPanel from '@/features/tours/components/TransportTimesPanel';

export default function TourKeypointsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const tourId = Number(id);

    const { data: keypoints = [] } = useKeypoints(tourId);
    const { data: tour } = useTour(tourId);
    const { data: transportTimes = [] } = useTransportTimes(tourId);

    const canFinishCreating = keypoints.length >= 2 && transportTimes.length >= 1;

    const handleFinishCreating = () => {
        if (!canFinishCreating) {
            return;
        }

        navigate(`/tours/${tourId}`);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-3.5rem)]">
            {/* ── Header ── */}
            <div className="shrink-0 border-b border-(--border) bg-(--bg) px-4 py-3">
                <div className="max-w-7xl mx-auto flex items-center gap-3">
                    {/* Back */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 text-sm text-(--text) hover:text-(--accent) transition-colors shrink-0"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </button>

                    <div className="h-4 w-px bg-(--border)" />

                    <p className="text-sm text-(--text-h) font-medium">Add Keypoints</p>

                    {/* Keypoint counter */}
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-(--accent-bg) text-xs text-(--accent) font-medium">
                        <MapPin className="h-3.5 w-3.5" />
                        {keypoints.length} {keypoints.length === 1 ? 'keypoint' : 'keypoints'}
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-(--accent-bg) text-xs text-(--accent) font-medium">
                        Distance: {tour?.lengthInKm ?? 0} km
                    </div>

                    {tour && (
                        <span className="rounded-md bg-(--accent-bg) px-3 py-1 text-xs font-medium text-(--accent)">
                        {tour.status}
                      </span>
                    )}

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Finish Creating Tour button */}
                    <button
                        onClick={handleFinishCreating}
                        disabled={!canFinishCreating}
                        className="rounded-md bg-(--accent) px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                        Finish Creating Tour
                    </button>
                </div>
            </div>

            {!canFinishCreating && (
                <p className="px-6 py-2 text-xs text-(--text)/50 border-b border-(--border)">
                    To finish creating the tour, add at least 2 keypoints and 1 transport time.
                </p>
            )}

            <TransportTimesPanel tourId={tourId} />
            {/* ── Map ── */}
            <div className="flex-1 relative overflow-hidden">
                <TourMap
                    tourId={tourId}
                    keypoints={keypoints}
                    className="h-full"
                />
            </div>
        </div>
    );
}