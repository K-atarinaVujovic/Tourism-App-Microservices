import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import TourMap from '@/features/tours/components/TourMap';
import type { Keypoint } from '@/types/tour';

// ---------------------------------------------------------------------------
// Form schema
// ---------------------------------------------------------------------------

const tourSchema = z.object({
    name: z.string().min(1, 'Tour name is required').max(100, 'Max 100 characters'),
    description: z.string().min(1, 'Description is required').max(500, 'Max 500 characters'),
});

type TourFormValues = z.infer<typeof tourSchema>;

// ---------------------------------------------------------------------------
// TourCreatePage
// ---------------------------------------------------------------------------

/**
 * TODO (backend integration — do this in order):
 *   1. Call tourService.create({ name, description }) → get back the real tourId.
 *   2. For each keypoint, call keypointService.create({ ...kp, tourId }).
 *   3. Navigate to /tours/:id on success.
 *   The keypoint list is intentionally kept in local state here until
 *   the backend is ready — TourMap renders and routes them client-side already.
 */
export default function TourCreatePage() {
    const navigate = useNavigate();
    const [keypoints, setKeypoints] = useState<Keypoint[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<TourFormValues>({
        resolver: zodResolver(tourSchema),
    });

    const onSave = async (_values: TourFormValues) => {
        setIsSaving(true);
        try {
            /**
             * TODO: replace this block with real API calls
             *
             * const tour = await tourService.create({ name: values.name, description: values.description });
             * await Promise.all(
             *   keypoints.map((kp) =>
             *     keypointService.create({ ...kp, tourId: tour.id })
             *   )
             * );
             * navigate(`/tours/${tour.id}`);
             */
            console.log('Tour saved (local only — backend not connected yet)', {
                keypoints,
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-3.5rem)]">
            {/* ── Tour details header ── */}
            <div className="shrink-0 border-b border-(--border) bg-(--bg) px-4 py-3">
                <div className="max-w-7xl mx-auto flex items-start gap-4">
                    {/* Name */}
                    <div className="flex flex-col gap-1 w-64">
                        <input
                            {...register('name')}
                            placeholder="Tour name"
                            className={cn(
                                'rounded-md border px-3 py-1.5 text-sm bg-(--bg) text-(--text-h) font-medium',
                                'placeholder:text-(--text)/40 outline-none',
                                'focus:ring-2 focus:ring-(--accent)/30 focus:border-(--accent)',
                                'transition-colors',
                                errors.name ? 'border-red-400' : 'border-(--border)'
                            )}
                        />
                        {errors.name && (
                            <p className="text-xs text-red-500">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1 flex-1">
                        <input
                            {...register('description')}
                            placeholder="Short description"
                            className={cn(
                                'rounded-md border px-3 py-1.5 text-sm bg-(--bg) text-(--text)',
                                'placeholder:text-(--text)/40 outline-none',
                                'focus:ring-2 focus:ring-(--accent)/30 focus:border-(--accent)',
                                'transition-colors',
                                errors.description ? 'border-red-400' : 'border-(--border)'
                            )}
                        />
                        {errors.description && (
                            <p className="text-xs text-red-500">{errors.description.message}</p>
                        )}
                    </div>

                    {/* Keypoint counter */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-(--accent-bg) text-xs text-(--accent) font-medium shrink-0 self-start mt-px">
                        <MapPin className="h-3.5 w-3.5" />
                        {keypoints.length} {keypoints.length === 1 ? 'keypoint' : 'keypoints'}
                    </div>

                    {/* Save button */}
                    <button
                        onClick={handleSubmit(onSave)}
                        disabled={isSaving}
                        className={cn(
                            'flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium shrink-0 self-start mt-px',
                            'bg-(--accent) text-white hover:opacity-90 transition-opacity',
                            'disabled:opacity-50 disabled:cursor-not-allowed'
                        )}
                    >
                        <Save className="h-4 w-4" />
                        {isSaving ? 'Saving…' : 'Save Tour'}
                    </button>

                    {/* Cancel */}
                    <button
                        onClick={() => navigate(-1)}
                        className="self-start mt-px rounded-md border border-(--border) px-4 py-1.5 text-sm text-(--text) hover:bg-(--accent-bg) transition-colors shrink-0"
                    >
                        Cancel
                    </button>
                </div>
            </div>

            {/* ── Map (fills remaining space) ── */}
            <div className="flex-1 relative overflow-hidden">
                <TourMap
                    keypoints={keypoints}
                    onKeypointsChange={setKeypoints}
                    className="h-full"
                />
            </div>
        </div>
    );
}