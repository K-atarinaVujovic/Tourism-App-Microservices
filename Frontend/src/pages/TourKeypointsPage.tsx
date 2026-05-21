import { useParams, useNavigate } from 'react-router';
import { MapPin, Globe, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import TourMap from '@/features/tours/components/TourMap';
import { useKeypoints } from '@/features/tours/hooks/useKeypoints';

export default function TourKeypointsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const tourId = Number(id);

    const { data: keypoints = [] } = useKeypoints(tourId);

    const handlePublish = () => {
        // TODO: call tourService.publish(tourId) when endpoint is ready
        console.log('Publish tour', tourId);
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

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Publish button */}
                    <button
                        onClick={handlePublish}
                        className={cn(
                            'flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium',
                            'bg-(--accent) text-white hover:opacity-90 transition-opacity'
                        )}
                    >
                        <Globe className="h-4 w-4" />
                        Publish Tour
                    </button>
                </div>
            </div>

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