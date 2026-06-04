import { Clock, DollarSign, MapPin, Navigation, Route, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PublishedTourPreview } from '@/types/tour';
import type { TourDifficulty } from '@/features/tours/services/tourService';
import { useAuthStore } from '@/store/authStore';
import { useProfile } from '@/features/stakeholders/hooks/useProfile';
import { useNavigate } from 'react-router';
import { useCart, useAddToCart, useHasPurchased } from '@/features/purchases/hooks/usePurchases';

const DIFFICULTY_STYLES: Record<TourDifficulty, string> = {
    EASY: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    MEDIUM: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    HARD: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const TRANSPORT_LABELS: Record<string, string> = {
    WALKING: 'Walking',
    BIKE: 'Bike',
    CAR: 'Car',
};

type Props = {
    tour: PublishedTourPreview;
};

export default function PublishedTourPreviewCard({ tour }: Props) {
    const { user, isAuthenticated } = useAuthStore();
    const { data: profile } = useProfile(user?.id ?? 0);
    const navigate = useNavigate();

    const isTourist = isAuthenticated && profile?.role?.toLowerCase() === 'tourist';

    // Fetch cart to check if it's already in there
    const { data: cart } = useCart(!!isTourist);
    const isInCart = cart?.items?.some(item => String(item.tour_id) === String(tour.id));

    // Check if purchased
    const { data: purchaseStatus } = useHasPurchased(
        isTourist ? String(user?.id) : undefined,
        String(tour.id)
    );
    const isPurchased = purchaseStatus?.purchased ?? false;

    const addToCartMutation = useAddToCart();

    const handleAddToCart = () => {
        if (!isTourist) {
            navigate('/login');
            return;
        }
        addToCartMutation.mutate({
            touristId: String(user?.id),
            tourId: String(tour.id),
        });
    };
    return (
        <article
            className={cn(
                'flex flex-col rounded-xl border border-(--border) bg-(--bg) p-5',
                'hover:border-(--accent)/50 hover:shadow-lg hover:shadow-(--accent)/5',
                'transition-all duration-200',
            )}
        >
            <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-base font-semibold text-(--text-h) line-clamp-2 leading-snug">
                    {tour.name}
                </h3>

                <span
                    className={cn(
                        'shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium',
                        DIFFICULTY_STYLES[tour.difficulty],
                    )}
                >
                    {tour.difficulty}
                </span>
            </div>

            <p className="text-sm text-(--text)/65 line-clamp-3 mb-4 leading-relaxed">
                {tour.description}
            </p>

            <div className="flex flex-wrap gap-3 text-xs text-(--text)/60 mb-4">
                <span className="flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5" />
                    <span className="font-semibold text-(--text-h)">
                        {tour.price.toFixed(2)}
                    </span>
                </span>

                <span className="flex items-center gap-1">
                    <Route className="h-3.5 w-3.5" />
                    <span className="font-semibold text-(--text-h)">
                        {(tour.lengthInKm ?? 0).toFixed(2)} km
                    </span>
                </span>
            </div>

            {tour.firstKeyPoint && (
                <div className="mb-4 rounded-lg border border-(--border) bg-(--accent-bg)/30 px-3 py-2">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-(--text-h) mb-1">
                        <Navigation className="h-3.5 w-3.5" />
                        Starting key point
                    </p>

                    <p className="text-sm font-medium text-(--text-h)">
                        {tour.firstKeyPoint.name}
                    </p>

                    <p className="text-xs text-(--text)/60 line-clamp-2 mt-0.5">
                        {tour.firstKeyPoint.description}
                    </p>

                    <p className="flex items-center gap-1 text-xs text-(--text)/45 mt-2">
                        <MapPin className="h-3 w-3" />
                        {tour.firstKeyPoint.latitude.toFixed(5)}, {tour.firstKeyPoint.longitude.toFixed(5)}
                    </p>
                </div>
            )}

            {tour.transportTimes.length > 0 && (
                <div className="mb-4">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-(--text)/50 uppercase tracking-widest mb-2">
                        <Clock className="h-3.5 w-3.5" />
                        Transport times
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                        {tour.transportTimes.map(time => (
                            <span
                                key={time.id}
                                className="rounded-full border border-(--border) px-2.5 py-1 text-xs text-(--text)/70"
                            >
                                {TRANSPORT_LABELS[time.transportType] ?? time.transportType}: {time.durationInMinutes} min
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {tour.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-auto">
                    {tour.tags.map(tag => (
                        <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-full bg-(--accent-bg) px-2 py-0.5 text-xs text-(--accent)"
                        >
                            <Tag className="h-2.5 w-2.5" />
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {!isTourist ? (
                <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="mt-5 w-full rounded-lg bg-(--accent) text-white hover:opacity-90 transition-opacity px-4 py-2 text-sm font-medium"
                >
                    Log in to Purchase
                </button>
            ) : isPurchased ? (
                <button
                    type="button"
                    onClick={() => navigate(`/tours/${tour.id}`)}
                    className="mt-5 w-full rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 px-4 py-2 text-sm font-medium hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                    ✓ Purchased (View Details)
                </button>
            ) : isInCart ? (
                <button
                    type="button"
                    disabled
                    className="mt-5 w-full rounded-lg border border-(--border) px-4 py-2 text-sm font-medium text-(--text)/45 cursor-not-allowed"
                >
                    Already in Cart
                </button>
            ) : (
                <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={addToCartMutation.isPending}
                    className="mt-5 w-full rounded-lg bg-(--accent) text-white hover:opacity-90 disabled:opacity-50 transition-all px-4 py-2 text-sm font-medium"
                >
                    {addToCartMutation.isPending ? 'Adding to Cart...' : 'Add to Cart'}
                </button>
            )}
        </article>
    );
}