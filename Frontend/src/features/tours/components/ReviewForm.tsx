import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Schema ───────────────────────────────────────────────────────────────────

const reviewSchema = z.object({
    rating: z
        .number({ error: 'Rating is required' })
        .int()
        .min(1, 'Select a rating')
        .max(5),
    comment: z
        .string()
        .min(10, 'At least 10 characters required')
        .max(1000, 'Max 1000 characters'),
    visitedAt: z
        .string()
        .min(1, 'Visit date is required'),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;

// ── Props ────────────────────────────────────────────────────────────────────

interface ReviewFormProps {
    onSubmit: (values: ReviewFormValues) => void;
    isSubmitting?: boolean;
    /** Call reset from parent after successful submission */
    submitSuccess?: boolean;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function ReviewForm({
                                       onSubmit,
                                       isSubmitting = false,
                                       submitSuccess = false,
                                   }: ReviewFormProps) {
    const [hoveredStar, setHoveredStar] = useState(0);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<ReviewFormValues>({
        resolver: zodResolver(reviewSchema),
        defaultValues: { rating: 0, comment: '', visitedAt: '' },
    });

    const rating = watch('rating');

    // Reset form when the parent signals successful submission
    useEffect(() => {
        if (submitSuccess) {
            reset();
            setHoveredStar(0);
        }
    }, [submitSuccess, reset]);

    const today = new Date().toISOString().split('T')[0];

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Star rating */}
            <div>
                <label className="text-xs font-medium text-(--text-h) mb-2 block">Rating</label>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                        <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoveredStar(star)}
                            onMouseLeave={() => setHoveredStar(0)}
                            onClick={() => setValue('rating', star, { shouldValidate: true })}
                            className="p-0.5 transition-transform hover:scale-110"
                            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
                        >
                            <Star
                                className={cn(
                                    'h-7 w-7 transition-colors',
                                    star <= (hoveredStar || rating)
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'fill-none text-(--border)',
                                )}
                            />
                        </button>
                    ))}
                </div>
                {errors.rating && (
                    <p className="mt-1 text-xs text-red-500">{errors.rating.message}</p>
                )}
            </div>

            {/* Visit date */}
            <div>
                <label className="text-xs font-medium text-(--text-h) mb-1 block">
                    When did you visit?
                </label>
                <input
                    type="date"
                    max={today}
                    {...register('visitedAt')}
                    className={cn(
                        'w-full rounded-md border px-3 py-2 text-sm bg-(--bg) text-(--text)',
                        'outline-none focus:ring-2 focus:ring-(--accent)/30 focus:border-(--accent)',
                        'transition-colors',
                        errors.visitedAt ? 'border-red-400' : 'border-(--border)',
                    )}
                />
                {errors.visitedAt && (
                    <p className="mt-1 text-xs text-red-500">{errors.visitedAt.message}</p>
                )}
            </div>

            {/* Comment */}
            <div>
                <label className="text-xs font-medium text-(--text-h) mb-1 block">Comment</label>
                <textarea
                    {...register('comment')}
                    rows={4}
                    placeholder="Share your experience…"
                    className={cn(
                        'w-full rounded-md border px-3 py-2 text-sm bg-(--bg) text-(--text)',
                        'placeholder:text-(--text)/40 outline-none resize-none',
                        'focus:ring-2 focus:ring-(--accent)/30 focus:border-(--accent)',
                        'transition-colors',
                        errors.comment ? 'border-red-400' : 'border-(--border)',
                    )}
                />
                {errors.comment && (
                    <p className="mt-1 text-xs text-red-500">{errors.comment.message}</p>
                )}
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                    'w-full rounded-md px-4 py-2.5 text-sm font-medium',
                    'bg-(--accent) text-white hover:opacity-90 transition-opacity',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                )}
            >
                {isSubmitting ? 'Submitting…' : 'Submit Review'}
            </button>
        </form>
    );
}