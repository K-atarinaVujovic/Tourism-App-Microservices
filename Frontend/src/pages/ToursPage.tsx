import { useState } from 'react';
import { Search, Plus, MapPin, Tag as TagIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import TourCard from '@/features/tours/components/TourCard';
import { useMyTours } from '@/features/tours/hooks/useTours';
import type { TourDifficulty } from '@/features/tours/services/tourService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router';

type DifficultyFilter = TourDifficulty | 'ALL';
const DIFFICULTY_FILTERS: DifficultyFilter[] = ['ALL', 'EASY', 'MEDIUM', 'HARD'];

export default function ToursPage() {
    const { data: tours = [], isLoading, isError } = useMyTours();
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
        <div className="container mx-auto p-6 space-y-8">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold tracking-tight">My Tours</h1>
                <p className="text-muted-foreground text-lg">
                    Manage your draft, published and archived tours.
                </p>
                <div className="pt-2">
                    <Button asChild>
                        <Link to="/tours/create">
                            <Plus className="h-4 w-4 mr-2" />
                            Create New Tour
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search your tours..."
                        className="pl-10"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
                    {DIFFICULTY_FILTERS.map(d => (
                        <Button
                            key={d}
                            variant={difficulty === d ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setDifficulty(d)}
                            className="whitespace-nowrap"
                        >
                            {d === 'ALL' ? 'All' : d.charAt(0) + d.slice(1).toLowerCase()}
                        </Button>
                    ))}
                </div>
            </div>

            {isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-6 space-y-4">
                                <div className="h-4 w-3/4 bg-muted rounded" />
                                <div className="space-y-2">
                                    <div className="h-3 w-full bg-muted rounded" />
                                    <div className="h-3 w-5/6 bg-muted rounded" />
                                </div>
                                <div className="flex gap-2">
                                    <div className="h-5 w-16 bg-muted rounded-full" />
                                    <div className="h-5 w-12 bg-muted rounded-full" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {isError && (
                <div className="p-12 text-center border-2 border-dashed rounded-xl flex flex-col items-center gap-3">
                    <AlertCircle className="h-10 w-10 text-destructive opacity-50" />
                    <p className="text-destructive font-medium">Failed to load your tours.</p>
                    <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Retry</Button>
                </div>
            )}

            {!isLoading && !isError && filtered.length === 0 && (
                <div className="p-12 text-center border-2 border-dashed rounded-xl flex flex-col items-center gap-3">
                    <MapPin className="h-10 w-10 text-muted-foreground opacity-30" />
                    <p className="text-muted-foreground font-medium">
                        {tours.length === 0
                            ? "You haven't created any tours yet."
                            : "No tours match your search criteria."}
                    </p>
                    {tours.length === 0 && (
                        <Button asChild variant="outline" size="sm">
                            <Link to="/tours/create">Create your first tour</Link>
                        </Button>
                    )}
                </div>
            )}

            {!isLoading && !isError && filtered.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <TagIcon className="h-3 w-3" />
                        {filtered.length} tour{filtered.length !== 1 ? 's' : ''} found
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map(tour => (
                            <TourCard key={tour.id} tour={tour} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}