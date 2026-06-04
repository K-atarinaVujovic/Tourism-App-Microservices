import { useState } from 'react';
import { Link } from 'react-router';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import TourCard from '@/features/tours/components/TourCard';
import { usePurchasedTours } from '@/features/tours/hooks/useTours';
import type { TourDifficulty } from '@/features/tours/services/tourService';

type DifficultyFilter = TourDifficulty | 'ALL';
const DIFFICULTY_FILTERS: DifficultyFilter[] = ['ALL', 'EASY', 'MEDIUM', 'HARD'];

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

export default function PurchasedToursPage() {
    const { data: tours = [], isLoading, isError } = usePurchasedTours(); 
    const [search, setSearch] = useState('');
    const [difficulty, setDifficulty] = useState<DifficultyFilter>('ALL');

    const filtered = tours.filter(tour => {
        const query = search.toLowerCase();

        const matchesSearch =
            tour.name.toLowerCase().includes(query) ||
            tour.description.toLowerCase().includes(query) ||
            tour.tags.some(tag => tag.toLowerCase().includes(query));

        const matchesDifficulty =
            difficulty === 'ALL' || tour.difficulty === difficulty;

        return matchesSearch && matchesDifficulty;
    });

    return (
        <div className="min-h-screen bg-(--bg)">
            <div className="max-w-6xl mx-auto px-4 py-10">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-(--text-h) mb-1">Purchased tours</h1>
                    <p className="text-sm text-(--text)/55">
                        Tours you have purchased and can explore.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--text)/40 pointer-events-none" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search your tours…"
                            className={cn(
                                'w-full rounded-lg border border-(--border) bg-(--bg)',
                                'pl-9 pr-4 py-2.5 text-sm text-(--text)',
                                'placeholder:text-(--text)/40 outline-none',
                                'focus:ring-2 focus:ring-(--accent)/30 focus:border-(--accent)',
                                'transition-colors',
                            )}
                        />
                    </div>

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

                {isLoading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <TourCardSkeleton key={i} />
                        ))}
                    </div>
                )}

                {isError && (
                    <div className="text-center py-20">
                        <p className="text-sm text-red-400">Failed to load your purchased tours.</p>
                    </div>
                )}

                {!isLoading && !isError && filtered.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-sm text-(--text)/50 mb-4">
                            {tours.length === 0
                                ? 'You have not purchased any tours yet.'
                                : 'No tours match your search.'}
                        </p>
                        {tours.length === 0 && (
                            <Link
                                to="/tourist/tours"
                                className="inline-flex rounded-lg bg-(--accent) text-white px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-all"
                            >
                                Browse tours
                            </Link>
                        )}
                    </div>
                )}

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