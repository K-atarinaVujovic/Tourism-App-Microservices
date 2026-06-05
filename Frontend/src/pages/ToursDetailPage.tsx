import { useParams, Link } from 'react-router';
import { ArrowLeft, DollarSign, MapPin, Star, Tag, Route } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTour, usePublishTour, useArchiveTour, useReactivateTour, } from '@/features/tours/hooks/useTours';
import { useKeypoints } from '@/features/tours/hooks/useKeypoints';
import { useReviews, useCreateReview } from '@/features/tours/hooks/useReviews';
import TourReviewList from '@/features/tours/components/TourReviewList';
import ReviewForm from '@/features/tours/components/ReviewForm';
import type { TourDifficulty } from '@/features/tours/services/tourService';
import type { ReviewFormValues } from '@/features/tours/components/ReviewForm';
import { useAuthStore } from '@/store/authStore';
import { useProfile } from '@/features/stakeholders/hooks/useProfile';
import { useNavigate } from 'react-router';
import { useActiveTourExecution, useStartTourExecution } from '@/features/tours/hooks/useTourExecutions';

// ── Constants ────────────────────────────────────────────────────────────────

const DIFFICULTY_STYLES: Record<TourDifficulty, string> = {
    EASY: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    MEDIUM: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    HARD: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const KEYPOINT_EMOJI: Record<string, string> = {
    MUSEUM: '🏛️',
    PARK: '🌿',
    MONUMENT: '🗿',
};

// ── Sub-components ───────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
    return (
        <h2 className="text-xs font-semibold text-(--text)/50 uppercase tracking-widest mb-3">
            {children}
        </h2>
    );
}

// ── Component ────────────────────────────────────────────────────────────────

export default function TourDetailPage() {
    const { id } = useParams<{ id: string }>();
    const tourId = Number(id);

    const { data: tour, isLoading, isError } = useTour(tourId);
    const { data: keypoints = [] } = useKeypoints(tourId);
    const { data: reviews = [] } = useReviews(tourId);
    const { mutate: submitReview, isPending, isSuccess } = useCreateReview(tourId);
    const { user } = useAuthStore();
    const { data: currentProfile } = useProfile(user?.id ?? 0);

    const publishTour = usePublishTour();
    const archiveTour = useArchiveTour();
    const reactivateTour = useReactivateTour();

    const handleReviewSubmit = (values: ReviewFormValues) => {
        submitReview({
            rating: values.rating,
            comment: values.comment,
            visitedAt: values.visitedAt,
        });
    };

    const navigate = useNavigate();
    const startExecution = useStartTourExecution();

    const handleStart = () => {
        startExecution.mutate(tourId, {
            onSuccess: () => navigate('/tours/active'),
        });
    };

    const { data: activeExecution } = useActiveTourExecution();

    // ── Loading ───────────────────────────────────────────────────────────────

    if (isLoading) {
        return (
            <div className="min-h-screen bg-(--bg) flex items-center justify-center">
                <p className="text-sm text-(--text)/50">Loading tour…</p>
            </div>
        );
    }

    if (isError || !tour) {
        return (
            <div className="min-h-screen bg-(--bg) flex items-center justify-center">
                <p className="text-sm text-red-400">Tour not found.</p>
            </div>
        );
    }

    // ── Derived data ──────────────────────────────────────────────────────────

    const avgRating = reviews.length
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : null;

    const isAuthor = currentProfile?.role?.toLowerCase() === 'author';

    const isOwner = user?.id === tour.authorId;
    const canManageTour = isAuthor && isOwner;

    const handleStatusAction = () => {
        if (tour.status === 'DRAFT') {
            publishTour.mutate(tourId);
        }

        if (tour.status === 'PUBLISHED') {
            archiveTour.mutate(tourId);
        }

        if (tour.status === 'ARCHIVED') {
            reactivateTour.mutate(tourId);
        }
    };

    const statusActionLabel =
        tour.status === 'DRAFT'
            ? 'Publish Tour'
            : tour.status === 'PUBLISHED'
                ? 'Archive Tour'
                : 'Reactivate Tour';

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-(--bg)">
            <div className="max-w-3xl mx-auto px-4 py-10">

                {/* Back link */}
                <Link
                    to="/tours"
                    className="inline-flex items-center gap-1.5 text-sm text-(--text)/55 hover:text-(--accent) transition-colors mb-8"
                >
                    <ArrowLeft className="h-4 w-4" />
                    All Tours
                </Link>

                {/* ── Tour header ─────────────────────────────────────────── */}
                <div className="rounded-xl border border-(--border) bg-(--bg) p-6 mb-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                        <h1 className="text-2xl font-bold text-(--text-h) leading-snug">
                            {tour.name}
                        </h1>
                        <span className={cn(
                            'shrink-0 rounded-full border px-3 py-1 text-xs font-semibold mt-0.5',
                            DIFFICULTY_STYLES[tour.difficulty],
                        )}>
                            {tour.difficulty}
                        </span>
                    </div>

                    <p className="text-sm text-(--text)/70 leading-relaxed mb-5">
                        {tour.description}
                    </p>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-(--text)/60 mb-5">
                        <span className="flex items-center gap-1.5">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-semibold text-(--text-h)">
                                ${tour.price.toFixed(2)}
                            </span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Route className="h-4 w-4" />
                            <span className="font-semibold text-(--text-h)">
                                {(tour.lengthInKm ?? 0).toFixed(2)} km
                            </span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" />
                            {tour.authorUsername}
                        </span>
                        {avgRating !== null && (
                            <span className="flex items-center gap-1.5">
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                <span className="font-medium text-(--text-h)">
                                    {avgRating.toFixed(1)}
                                </span>
                                <span className="text-(--text)/45">
                                    ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                                </span>
                            </span>
                        )}
                    </div>

                    {canManageTour && (
                        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-(--border) bg-(--accent-bg)/30 p-3">
                            <span className="text-sm">
                                Status:
                                <span className="ml-2 font-semibold text-(--accent)">
                                    {tour.status}
                                </span>
                            </span>

                            {tour.publishedAt && (
                                <span className="text-xs text-(--text)/55">
                                    Published at: {new Date(tour.publishedAt).toLocaleString()}
                                </span>
                            )}

                            {tour.archivedAt && (
                                <span className="text-xs text-(--text)/55">
                                    Archived at: {new Date(tour.archivedAt).toLocaleString()}
                                </span>
                            )}

                            <button
                                onClick={handleStatusAction}
                                disabled={
                                    publishTour.isPending ||
                                    archiveTour.isPending ||
                                    reactivateTour.isPending
                                }
                                className="ml-auto rounded-md bg-(--accent) px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                            >
                                {statusActionLabel}
                            </button>
                        </div>
                    )}

                    {/* Tags */}
                    {tour.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {tour.tags.map(tag => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-1 rounded-full bg-(--accent-bg) px-2.5 py-1 text-xs text-(--accent)"
                                >
                                    <Tag className="h-2.5 w-2.5" />
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Keypoints ───────────────────────────────────────────── */}
                {keypoints.length > 0 && (
                    <section className="mb-5">
                        <SectionHeading>
                            Keypoints ({keypoints.length})
                        </SectionHeading>
                        <div className="space-y-2">
                            {keypoints.map(kp => (
                                <div
                                    key={kp.id}
                                    className="flex items-start gap-3 rounded-xl border border-(--border) bg-(--bg) p-4"
                                >
                                    <span className="text-xl mt-0.5" aria-hidden>
                                        {KEYPOINT_EMOJI[kp.type] ?? '📍'}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-(--text-h) mb-0.5">
                                            {kp.name}
                                        </p>
                                        <p className="text-xs text-(--text)/60 line-clamp-2 leading-relaxed">
                                            {kp.description}
                                        </p>
                                    </div>
                                    <span className="shrink-0 text-xs text-(--text)/40 bg-(--accent-bg)/40 rounded px-1.5 py-0.5 self-start">
                                        {kp.type}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── Start tour ───────────────────────────────────────────────  */}
                <section className="mb-5">
                     <button
                        onClick={handleStart}
                        disabled={startExecution.isPending || !!activeExecution}
                        className={cn(
                            'w-full rounded-md px-4 py-2.5 text-sm font-medium',
                            'bg-(--accent) text-white hover:opacity-90 transition-opacity',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                        )}
                    >
                        {startExecution.isPending ? 'Starting…' : !!activeExecution ? 'Tour already active' : 'Start!'}
                    </button>
                </section>

                {/* ── Reviews ─────────────────────────────────────────────── */}
                <section className="mb-5">
                    <SectionHeading>
                        Reviews ({reviews.length})
                    </SectionHeading>
                    <TourReviewList reviews={reviews} />
                </section>

                {/* ── Review form ─────────────────────────────────────────── */}
                {isAuthor ? (
                    <section className="rounded-xl border border-(--border) bg-(--bg) p-6">
                        <p className="text-sm text-(--text)/60 text-center">
                            Authors cannot review their own tours.
                        </p>
                    </section>
                ) : (
                    <section className="rounded-xl border border-(--border) bg-(--bg) p-6">
                        <SectionHeading>Write a Review</SectionHeading>
                        <ReviewForm
                            onSubmit={handleReviewSubmit}
                            isSubmitting={isPending}
                            submitSuccess={isSuccess}
                        />
                    </section>
                )}

            </div>
        </div>
    );
}