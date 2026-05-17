import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, X, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Keypoint } from '@/types/tour';
import type { LatLng } from '@/store/positionStore';

const keypointSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Max 100 characters'),
    description: z.string().min(1, 'Description is required').max(500, 'Max 500 characters'),
    latitude: z.number({ error: 'Pick a location on the map' }),
    longitude: z.number({ error: 'Pick a location on the map' }),
});

type KeypointFormValues = z.infer<typeof keypointSchema>;

interface KeypointFormPanelProps {
    isOpen: boolean;
    /** null = create mode, defined = edit mode */
    keypoint: Keypoint | null;
    /** The lat/lng the user last clicked on the map */
    draftLatLng: LatLng | null;
    onPickLocation: () => void;
    onSubmit: (values: KeypointFormValues, image: File | null) => void;
    onClose: () => void;
}

export default function KeypointFormPanel({
                                              isOpen,
                                              keypoint,
                                              draftLatLng,
                                              onPickLocation,
                                              onSubmit,
                                              onClose,
                                          }: KeypointFormPanelProps) {
    const isEditing = keypoint !== null;
    const imageRef = useRef<File | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<KeypointFormValues>({
        resolver: zodResolver(keypointSchema),
    });

    const lat = watch('latitude');
    const lng = watch('longitude');

    // Pre-fill form when switching between create/edit
    useEffect(() => {
        if (isEditing) {
            reset({
                name: keypoint.name,
                description: keypoint.description,
                latitude: keypoint.latitude,
                longitude: keypoint.longitude,
            });
            imageRef.current = null;
        } else {
            reset({ name: '', description: '' });
            imageRef.current = null;
        }
    }, [keypoint, isEditing, reset]);

    // Sync map clicks into the form
    useEffect(() => {
        if (draftLatLng) {
            setValue('latitude', draftLatLng.lat, { shouldValidate: true });
            setValue('longitude', draftLatLng.lng, { shouldValidate: true });
        }
    }, [draftLatLng, setValue]);

    const handleFormSubmit = (values: KeypointFormValues) => {
        onSubmit(values, imageRef.current);
    };

    return (
        <div
            className={cn(
                'absolute top-0 right-0 h-full w-80 z-[1000] transition-transform duration-300 ease-in-out',
                'bg-(--bg) border-l border-(--border) shadow-xl flex flex-col',
                isOpen ? 'translate-x-0' : 'translate-x-full'
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-(--border)">
                <h2 className="text-sm font-semibold text-(--text-h)">
                    {isEditing ? 'Edit Keypoint' : 'New Keypoint'}
                </h2>
                <button
                    onClick={onClose}
                    className="p-1 rounded-md text-(--text) hover:text-(--accent) hover:bg-(--accent-bg) transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Form */}
            <form
                onSubmit={handleSubmit(handleFormSubmit)}
                className="flex flex-col gap-4 p-4 overflow-y-auto flex-1"
            >
                {/* Location picker */}
                <div>
                    <p className="text-xs font-medium text-(--text-h) mb-1">Location</p>
                    {lat && lng ? (
                        <div className="flex items-center justify-between rounded-md border border-(--border) px-3 py-2 bg-(--accent-bg)/40">
              <span className="text-xs text-(--text) font-mono">
                {lat.toFixed(5)}, {lng.toFixed(5)}
              </span>
                            <button
                                type="button"
                                onClick={onPickLocation}
                                className="text-xs text-(--accent) hover:underline"
                            >
                                Change
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={onPickLocation}
                            className={cn(
                                'w-full flex items-center justify-center gap-2 rounded-md border border-dashed px-3 py-3',
                                'text-sm text-(--text) hover:text-(--accent) hover:border-(--accent)',
                                'transition-colors',
                                errors.latitude ? 'border-red-400' : 'border-(--border)'
                            )}
                        >
                            <MapPin className="h-4 w-4" />
                            Click to pick location on map
                        </button>
                    )}
                    {errors.latitude && (
                        <p className="mt-1 text-xs text-red-500">{errors.latitude.message}</p>
                    )}
                </div>

                {/* Name */}
                <div>
                    <label className="text-xs font-medium text-(--text-h) mb-1 block">Name</label>
                    <input
                        {...register('name')}
                        placeholder="e.g. Main Square"
                        className={cn(
                            'w-full rounded-md border px-3 py-2 text-sm bg-(--bg) text-(--text)',
                            'placeholder:text-(--text)/40 outline-none',
                            'focus:ring-2 focus:ring-(--accent)/30 focus:border-(--accent)',
                            'transition-colors',
                            errors.name ? 'border-red-400' : 'border-(--border)'
                        )}
                    />
                    {errors.name && (
                        <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                    )}
                </div>

                {/* Description */}
                <div>
                    <label className="text-xs font-medium text-(--text-h) mb-1 block">Description</label>
                    <textarea
                        {...register('description')}
                        rows={4}
                        placeholder="What's interesting about this place?"
                        className={cn(
                            'w-full rounded-md border px-3 py-2 text-sm bg-(--bg) text-(--text)',
                            'placeholder:text-(--text)/40 outline-none resize-none',
                            'focus:ring-2 focus:ring-(--accent)/30 focus:border-(--accent)',
                            'transition-colors',
                            errors.description ? 'border-red-400' : 'border-(--border)'
                        )}
                    />
                    {errors.description && (
                        <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
                    )}
                </div>

                {/* Image upload */}
                <div>
                    <label className="text-xs font-medium text-(--text-h) mb-1 block">
                        Image {isEditing && keypoint?.imageUrl && '(leave empty to keep current)'}
                    </label>
                    <label
                        className={cn(
                            'flex items-center gap-2 w-full rounded-md border border-dashed border-(--border)',
                            'px-3 py-3 cursor-pointer text-sm text-(--text)',
                            'hover:border-(--accent) hover:text-(--accent) transition-colors'
                        )}
                    >
                        <Upload className="h-4 w-4 shrink-0" />
                        <span id="image-label" className="truncate">
              {imageRef.current ? imageRef.current.name : 'Upload image'}
            </span>
                        <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => {
                                const file = e.target.files?.[0] ?? null;
                                imageRef.current = file;
                                const label = document.getElementById('image-label');
                                if (label) label.textContent = file ? file.name : 'Upload image';
                            }}
                        />
                    </label>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-auto pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className={cn(
                            'flex-1 rounded-md border border-(--border) px-4 py-2 text-sm',
                            'text-(--text) hover:bg-(--accent-bg) transition-colors'
                        )}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className={cn(
                            'flex-1 rounded-md px-4 py-2 text-sm font-medium',
                            'bg-(--accent) text-white hover:opacity-90 transition-opacity'
                        )}
                    >
                        {isEditing ? 'Save Changes' : 'Add Keypoint'}
                    </button>
                </div>
            </form>
        </div>
    );
}