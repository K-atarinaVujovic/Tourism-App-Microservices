import { Star, Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TourReview } from '@/types/tour';

// ── Sub-components ───────────────────────────────────────────────────────────

function StarDisplay({ rating }: { rating: number }) {
    return (
        <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map(star => (
                <Star
                    key={star}
                    className={cn(
                        'h-3.5 w-3.5',
                        star <= rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-none text-(--border)',
                    )}
                />
            ))}
        </div>
    );
}

// ── Props ────────────────────────────────────────────────────────────────────

interface TourReviewListProps {
    reviews: TourReview[];
}

// ── Component ────────────────────────────────────────────────────────────────

export default function TourReviewList({ reviews }: TourReviewListProps) {
    if (reviews.length === 0) {
        return (
            <p className="text-sm text-(--text)/50 text-center py-10 border border-dashed border-(--border) rounded-xl">
                No reviews yet. Be the first to share your experience!
            </p>
        );
    }

    return (
        <div className="space-y-3">
            {reviews.map(review => (
                <div
                    key={review.id}
                    className="rounded-xl border border-(--border) bg-(--bg) p-4"
                >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-(--accent-bg) flex items-center justify-center shrink-0">
                                <User className="h-4 w-4 text-(--accent)" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-(--text-h) leading-none mb-1">
                                    {review.touristUsername}
                                </p>
                                <StarDisplay rating={review.rating} />
                            </div>
                        </div>
                        <span className="flex items-center gap-1 text-xs text-(--text)/45 shrink-0 mt-0.5">
                            <Calendar className="h-3 w-3" />
                            {new Date(review.visitedAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            })}
                        </span>
                    </div>

                    {/* Comment */}
                    <p className="text-sm text-(--text)/75 leading-relaxed">
                        {review.comment}
                    </p>

                    {/* Images */}
                    {review.imageUrls?.length > 0 && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                            {review.imageUrls.map((url, i) => (
                                <img
                                    key={i}
                                    src={url}
                                    alt={`Review photo ${i + 1}`}
                                    className="h-20 w-20 rounded-lg object-cover border border-(--border)"
                                    onError={e => {
                                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}