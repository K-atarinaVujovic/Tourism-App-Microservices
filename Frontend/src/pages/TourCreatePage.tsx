import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { tourService, type TourDifficulty } from '@/features/tours/services/tourService';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const tourSchema = z.object({
    name: z.string().min(1, 'Tour name is required').max(100, 'Max 100 characters'),
    description: z.string().min(1, 'Description is required').max(500, 'Max 500 characters'),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
    tags: z.string(),
});

type TourFormValues = z.infer<typeof tourSchema>;

const DIFFICULTIES: { value: TourDifficulty; label: string }[] = [
    { value: 'EASY', label: 'Easy' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HARD', label: 'Hard' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TourCreatePage() {
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<TourFormValues>({
        resolver: zodResolver(tourSchema),
        defaultValues: { difficulty: 'EASY', tags: '' },
    });

    const onSubmit = async (values: TourFormValues) => {
        setIsSaving(true);
        setSaveError(null);
        try {
            const tags = values.tags
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean);

            const tour = await tourService.create({
                name: values.name,
                description: values.description,
                difficulty: values.difficulty,
                tags,
            });

            navigate(`/tours/${tour.id}/keypoints`);
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : 'Failed to create tour');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-3.5rem)] flex items-start justify-center bg-(--bg) px-4 py-12">
            <div className="w-full max-w-lg">
                <h1 className="text-xl font-semibold text-(--text-h) mb-6">Create Tour</h1>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                    {/* Name */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-(--text-h)">Name</label>
                        <input
                            {...register('name')}
                            placeholder="e.g. Novi Sad City Walk"
                            className={cn(
                                'rounded-md border px-3 py-2 text-sm bg-(--bg) text-(--text)',
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
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-(--text-h)">Description</label>
                        <textarea
                            {...register('description')}
                            rows={4}
                            placeholder="What will tourists see and experience?"
                            className={cn(
                                'rounded-md border px-3 py-2 text-sm bg-(--bg) text-(--text)',
                                'placeholder:text-(--text)/40 outline-none resize-none',
                                'focus:ring-2 focus:ring-(--accent)/30 focus:border-(--accent)',
                                'transition-colors',
                                errors.description ? 'border-red-400' : 'border-(--border)'
                            )}
                        />
                        {errors.description && (
                            <p className="text-xs text-red-500">{errors.description.message}</p>
                        )}
                    </div>

                    {/* Difficulty */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-(--text-h)">Difficulty</label>
                        <select
                            {...register('difficulty')}
                            className={cn(
                                'rounded-md border px-3 py-2 text-sm bg-(--bg) text-(--text)',
                                'outline-none border-(--border)',
                                'focus:ring-2 focus:ring-(--accent)/30 focus:border-(--accent)',
                                'transition-colors'
                            )}
                        >
                            {DIFFICULTIES.map((d) => (
                                <option key={d.value} value={d.value}>
                                    {d.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-(--text-h)">
                            Tags{' '}
                            <span className="font-normal text-(--text)/50">(comma separated)</span>
                        </label>
                        <input
                            {...register('tags')}
                            placeholder="e.g. history, walking, city"
                            className={cn(
                                'rounded-md border px-3 py-2 text-sm bg-(--bg) text-(--text)',
                                'placeholder:text-(--text)/40 outline-none border-(--border)',
                                'focus:ring-2 focus:ring-(--accent)/30 focus:border-(--accent)',
                                'transition-colors'
                            )}
                        />
                    </div>

                    {/* Error */}
                    {saveError && (
                        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                            <X className="h-3.5 w-3.5 shrink-0" />
                            {saveError}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-1">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className={cn(
                                'flex items-center gap-2 rounded-md px-5 py-2 text-sm font-medium',
                                'bg-(--accent) text-white hover:opacity-90 transition-opacity',
                                'disabled:opacity-50 disabled:cursor-not-allowed'
                            )}
                        >
                            <Save className="h-4 w-4" />
                            {isSaving ? 'Creating…' : 'Create Tour'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="rounded-md border border-(--border) px-5 py-2 text-sm text-(--text) hover:bg-(--accent-bg) transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}