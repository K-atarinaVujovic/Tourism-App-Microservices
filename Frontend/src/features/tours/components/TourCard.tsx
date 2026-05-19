import { Link } from 'react-router';
import { MapPin, Tag, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Tour } from '@/types/tour';
import type { TourDifficulty } from '@/features/tours/services/tourService';

// ── Constants ────────────────────────────────────────────────────────────────

const DIFFICULTY_STYLES: Record<TourDifficulty, string> = {
    EASY: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    MEDIUM: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    HARD: 'bg-red-500/15 text-red-400 border-red-500/30',
};

// ── Props ────────────────────────────────────────────────────────────────────

interface TourCardProps {
    tour: Tour;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function TourCard({ tour }: TourCardProps) {
    return (
        <Link
            to={`/tours/${tour.id}`}
            className={cn(
                'group flex flex-col rounded-xl border border-(--border) bg-(--bg) p-5',
                'hover:border-(--accent)/50 hover:shadow-lg hover:shadow-(--accent)/5',
                'transition-all duration-200',
            )}
        >
            {/* Title + difficulty */}
            <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-base font-semibold text-(--text-h) group-hover:text-(--accent) transition-colors line-clamp-2 leading-snug">
                    {tour.name}
                </h3>
                <span className={cn(
                    'shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium',
                    DIFFICULTY_STYLES[tour.difficulty],
                )}>
                    {tour.difficulty}
                </span>
            </div>

            {/* Description */}
            <p className="text-sm text-(--text)/65 line-clamp-2 mb-4 leading-relaxed flex-1">
                {tour.description}
            </p>

            {/* Tags */}
            {tour.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {tour.tags.slice(0, 3).map(tag => (
                        <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-full bg-(--accent-bg) px-2 py-0.5 text-xs text-(--accent)"
                        >
                            <Tag className="h-2.5 w-2.5" />
                            {tag}
                        </span>
                    ))}
                    {tour.tags.length > 3 && (
                        <span className="text-xs text-(--text)/40 self-center">
                            +{tour.tags.length - 3}
                        </span>
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-(--text)/55">
                <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {tour.authorUsername}
                </span>
                <span className="flex items-center gap-1 font-semibold text-(--text-h)">
                    <DollarSign className="h-3 w-3" />
                    {tour.price.toFixed(2)}
                </span>
            </div>
        </Link>
    );
}