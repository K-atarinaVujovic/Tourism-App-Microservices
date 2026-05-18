import { useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import TourCard from '@/features/tours/components/TourCard';
import { useAllTours } from '@/features/tours/hooks/useTours';
import type { TourDifficulty } from '@/features/tours/services/tourService';

// ── Constants ────────────────────────────────────────────────────────────────

type DifficultyFilter = TourDifficulty | 'ALL';

const DIFFICULTY_FILTERS: DifficultyFilter[] = ['ALL', 'EASY', 'MEDIUM', 'HARD'];

// ── Skeleton ─────────────────────────────────────────────────────────────────

function TourCardSkeleton() {
    return (
        <div className="rounded-xl border border-(--border) bg-(--accent-bg)/20 p-5 animate-pulse">
            <div className="flex items-start justify-between gap-3 mb-2">
                <div className="h-4 w-3/4 rounded bg-(--border)" />
                <div className="h-5 w-14 rounded-full bg-(--border)" />
            </div>
            <div className="space-y-1.5 mb-4">
                <div className="h-3 w-full rounded bg-(--border)" />
                <div className="h-3 w-5/6 rounded bg-(--border)" />
            </div>
            <div className="flex gap-1.5 mb-4">
                <div className="h-5 w-16 rounded-full bg-(--border)" />
                <div className="h-5 w-12 rounded-full bg-(--border)" />
            </div>
            <div className="flex justify-between">
                <div className="h-3 w-24 rounded bg-(--border)" />
                <div className="h-3 w-12 rounded bg-(--border)" />
            </div>
        </div>
    );
}

// ── Component ────────────────────────────────────────────────────────────────

export default function ToursPage() {
    const { data: tours, isLoading, isError } = useAllTours();
    const [search, setSearch] = useState('');
    const [difficulty, setDifficulty] = useState<DifficultyFilter>('ALL');

    const filtered = (tours ?? []).filter(tour => {
        const query = search.toLowerCase();
        const matchesSearch =
            tour.name.toLowerCase().includes(query) ||
            tour.description.toLowerCase().includes(query) ||
            tour.tags.some(tag => tag.toLowerCase().includes(query));
        const matchesDifficulty = difficulty === 'ALL' || tour.difficulty === difficulty;
        return matchesSearch && matchesDifficulty;
    });

    return (
        <div className="min-h-screen bg-(--bg)">
            <div className="max-w-6xl mx-auto px-4 py-10">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-(--text-h) mb-1">Explore Tours</h1>
                    <p className="text-sm text-(--text)/55">
                        Discover and review experiences around you
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--text)/40 pointer-events-none" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name, description, or tag…"
                            className={cn(
                                'w-full rounded-lg border border-(--border) bg-(--bg)',
                                'pl-9 pr-4 py-2.5 text-sm text-(--text)',
                                'placeholder:text-(--text)/40 outline-none',
                                'focus:ring-2 focus:ring-(--accent)/30 focus:border-(--accent)',
                                'transition-colors',
                            )}
                        />
                    </div>

                    {/* Difficulty toggles */}
                    <div className="flex gap-2 shrink-0">
                        {DIFFICULTY_FILTERS.map(d => (
                            <button
                                key={d}
                                onClick={() => setDifficulty(d)}
                                className={cn(
                                    'rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
                                    difficulty === d
                                        ? 'bg-(--accent) text-white border-(--accent)'
                                        : 'border-(--border) text-(--text) hover:border-(--accent)/40',
                                )}
                            >
                                {d === 'ALL' ? 'All' : d.charAt(0) + d.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <TourCardSkeleton key={i} />
                        ))}
                    </div>
                )}

                {/* Error */}
                {isError && (
                    <div className="text-center py-20">
                        <p className="text-sm text-red-400">Failed to load tours. Please try again.</p>
                    </div>
                )}

                {/* Empty state */}
                {!isLoading && !isError && filtered.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-sm text-(--text)/50">
                            {tours?.length === 0
                                ? 'No tours available yet.'
                                : 'No tours match your search.'}
                        </p>
                    </div>
                )}

                {/* Grid */}
                {!isLoading && !isError && filtered.length > 0 && (
                    <>
                        <p className="text-xs text-(--text)/40 mb-4">
                            {filtered.length} tour{filtered.length !== 1 ? 's' : ''} found
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filtered.map(tour => (
                                <TourCard key={tour.id} tour={tour} />
                            ))}
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}