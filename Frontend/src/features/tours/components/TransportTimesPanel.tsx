import { useState } from 'react';
import { Clock } from 'lucide-react';
import { useCreateTransportTime, useTransportTimes } from '../hooks/useTours';
import type { TransportType } from '@/types/tour';

type Props = {
    tourId: number;
};

export default function TransportTimesPanel({ tourId }: Props) {
    const { data: times = [] } = useTransportTimes(tourId);
    const createTime = useCreateTransportTime(tourId);

    const [transportType, setTransportType] = useState<TransportType>('WALKING');
    const [durationInMinutes, setDurationInMinutes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        createTime.mutate({
            transportType,
            durationInMinutes: Number(durationInMinutes),
        });

        setDurationInMinutes('');
    };

    return (
        <section className="border-b border-(--border) bg-(--bg) px-6 py-3">
            <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-sm font-semibold text-(--text-h) mr-2">
                    Transport times
                </h2>

                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <select
                        value={transportType}
                        onChange={(e) => setTransportType(e.target.value as TransportType)}
                        className="h-9 w-32 rounded-md border border-(--border) bg-(--bg) px-2 text-sm"
                    >
                        <option value="WALKING">Walking</option>
                        <option value="BIKE">Bike</option>
                        <option value="CAR">Car</option>
                    </select>

                    <input
                        type="number"
                        min="1"
                        value={durationInMinutes}
                        onChange={(e) => setDurationInMinutes(e.target.value)}
                        placeholder="Minutes"
                        className="h-9 w-28 rounded-md border border-(--border) bg-(--bg) px-2 text-sm"
                    />

                    <button
                        type="submit"
                        disabled={!durationInMinutes || createTime.isPending}
                        className="h-9 rounded-md bg-(--accent) px-3 text-sm font-medium text-white disabled:opacity-50"
                    >
                        Add
                    </button>
                </form>

                <div className="flex flex-wrap items-center gap-2">
                    {times.map((time) => (
                        <span
                            key={time.id}
                            className="inline-flex items-center gap-1.5 rounded-md border border-(--border) px-2.5 py-1 text-xs text-(--text)/70"
                        >
              <Clock className="h-3.5 w-3.5" />
              <span className="font-medium">{time.transportType}</span>
              <span>{time.durationInMinutes} min</span>
            </span>
                    ))}

                    {times.length === 0 && (
                        <span className="text-xs text-(--text)/45">
              No transport times yet.
            </span>
                    )}
                </div>
            </div>
        </section>
    );
}