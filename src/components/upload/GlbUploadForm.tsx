'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Type, FileText, Zap, ImagePlus, Box, Upload } from 'lucide-react';
import { Input, Textarea } from '@/components/ui';
import {
    GlbDropzone,
    GlbPreviewCard,
    ThumbnailCarousel,
    GeoLocationFields,
    AddressSearchField,
} from '@/components/upload';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useDebounce } from '@/hooks/useDebounce';
import { useLocationReverse } from '@/hooks/apis/location.api';
import { useUploadGlbBrick } from '@/hooks/apis/brick.api';
import { useSwal } from '@/hooks/useSwal';
import { useUIStore } from '@/stores/ui-store';
import { getAvatarUrl } from '@/utils/cloudinary';
import { uploadGlbBrickSchema, type UploadGlbBrickFormInput } from '@/validations/brick';
import { cn } from '@/utils/classnames';
import type { LocationSuggestion } from '@/types/location.types';

const MAX_THUMBNAILS = 5;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function GlbUploadForm() {
    const swal = useSwal();
    const showLoading = useUIStore((state) => state.showLoading);
    const hideLoading = useUIStore((state) => state.hideLoading);
    const { data: session } = useSession();
    const user = session?.user;
    const uploadGlbBrick = useUploadGlbBrick();

    // File state
    const [glbFile, setGlbFile] = useState<File | null>(null);
    const [glbUrl, setGlbUrl] = useState<string | null>(null);
    const [thumbnails, setThumbnails] = useState<{ file: File; url: string }[]>([]);
    const [modelLoaded, setModelLoaded] = useState(false);

    // Location state
    const { location: geoLocation, requestLocation } = useGeolocation();
    const [geoInitialized, setGeoInitialized] = useState(false);
    const [reverseEnabled, setReverseEnabled] = useState(false);
    const [reverseCoords, setReverseCoords] = useState({ lat: 0, lon: 0 });

    // Address state
    const [addressQuery, setAddressQuery] = useState('');
    const [isAddressTyping, setIsAddressTyping] = useState(false);

    // Form
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<UploadGlbBrickFormInput>({
        resolver: zodResolver(uploadGlbBrickSchema),
        defaultValues: {
            title: '',
            description: '',
            address: '',
            latitude: null,
            longitude: null,
        },
    });

    const watchedTitle = watch('title');
    const watchedDescription = watch('description');
    const watchedAddress = watch('address');
    const watchedLat = watch('latitude');
    const watchedLon = watch('longitude');

    const debouncedLat = useDebounce(watchedLat, 800);
    const debouncedLon = useDebounce(watchedLon, 800);

    // Reverse geocode
    const { data: reverseData } = useLocationReverse(
        {
            lat: reverseCoords.lat,
            lon: reverseCoords.lon,
            addressdetails: 1,
            lang: 'en',
            normalizeaddress: 1,
        },
        reverseEnabled,
    );

    // --- Effects ---

    // Request geolocation on mount
    useEffect(() => {
        requestLocation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Populate form from geolocation
    useEffect(() => {
        if (!geoInitialized && geoLocation.latitude != null && geoLocation.longitude != null) {
            setGeoInitialized(true);
            setValue('latitude', geoLocation.latitude);
            setValue('longitude', geoLocation.longitude);
            setReverseCoords({ lat: geoLocation.latitude, lon: geoLocation.longitude });
            setReverseEnabled(true);
        }
    }, [geoLocation, geoInitialized, setValue]);

    // Populate address from reverse geocode
    useEffect(() => {
        if (reverseData?.display_name) {
            setValue('address', reverseData.display_name);
            setAddressQuery(reverseData.display_name);
            setReverseEnabled(false);
        }
    }, [reverseData, setValue]);

    // Trigger reverse geocoding on lat/lon change
    useEffect(() => {
        if (
            geoInitialized &&
            debouncedLat != null &&
            debouncedLon != null &&
            debouncedLat !== 0 &&
            debouncedLon !== 0
        ) {
            const coordsChanged =
                debouncedLat !== reverseCoords.lat || debouncedLon !== reverseCoords.lon;
            if (coordsChanged) {
                setReverseCoords({ lat: debouncedLat, lon: debouncedLon });
                setReverseEnabled(true);
            }
        }
    }, [debouncedLat, debouncedLon, geoInitialized, reverseCoords]);

    // GLB file URL management
    useEffect(() => {
        if (glbFile) {
            const url = URL.createObjectURL(glbFile);
            setGlbUrl(url);
            setModelLoaded(false);
            return () => URL.revokeObjectURL(url);
        } else {
            setGlbUrl(null);
            setModelLoaded(false);
        }
    }, [glbFile]);

    // --- Handlers ---

    const handleGlbSelect = useCallback((file: File) => setGlbFile(file), []);
    const handleGlbRemove = useCallback(() => setGlbFile(null), []);

    const handleThumbnailAdd = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = Array.from(e.target.files || []);
            const validFiles = files.filter((f) => ACCEPTED_IMAGE_TYPES.includes(f.type));
            const remaining = MAX_THUMBNAILS - thumbnails.length;

            if (remaining <= 0) {
                swal.warning('Limit Reached', `Maximum ${MAX_THUMBNAILS} thumbnails allowed`);
                e.target.value = '';
                return;
            }

            const toAdd = validFiles.slice(0, remaining);
            const newThumbnails = toAdd.map((file) => ({
                file,
                url: URL.createObjectURL(file),
            }));

            setThumbnails((prev) => [...prev, ...newThumbnails]);
            e.target.value = '';
        },
        [thumbnails.length, swal],
    );

    const handleThumbnailRemove = useCallback((index: number) => {
        setThumbnails((prev) => {
            const removed = prev[index];
            if (removed) URL.revokeObjectURL(removed.url);
            return prev.filter((_, i) => i !== index);
        });
    }, []);

    const handleAddressChange = useCallback(
        (value: string) => {
            setAddressQuery(value);
            setValue('address', value);
        },
        [setValue],
    );

    const handleAddressSelect = useCallback(
        (location: LocationSuggestion) => {
            const lat = parseFloat(location.lat);
            const lng = parseFloat(location.lon);
            if (!isNaN(lat) && !isNaN(lng)) {
                setValue('latitude', lat, { shouldValidate: true });
                setValue('longitude', lng, { shouldValidate: true });
                setReverseCoords({ lat, lon: lng });
            }
            setValue('address', location.display_name, { shouldValidate: true });
            setAddressQuery(location.display_name);
            setIsAddressTyping(false);
        },
        [setValue],
    );

    const handleAddressClear = useCallback(() => {
        setAddressQuery('');
        setValue('address', '');
        setIsAddressTyping(false);
    }, [setValue]);

    const onSubmit = async (data: UploadGlbBrickFormInput) => {
        if (!glbFile) {
            swal.error('Error', 'Please select a GLB model file');
            return;
        }
        if (thumbnails.length === 0) {
            swal.error('Error', 'Please add at least 1 thumbnail image');
            return;
        }

        try {
            showLoading('Uploading 3D model...');
            await uploadGlbBrick.mutateAsync({
                glb: glbFile,
                thumbnails: thumbnails.map((t) => t.file),
                ...data,
            });
            swal.success('Success', '3D model brick uploaded successfully!');
            reset();
            setGlbFile(null);
            setThumbnails([]);
            setAddressQuery('');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            swal.error(
                'Upload Failed',
                error?.response?.data?.message || 'Failed to upload 3D model',
            );
        } finally {
            hideLoading();
        }
    };

    const avatarUrl = useMemo(
        () => (user ? getAvatarUrl(user.avatar, user.gender) : undefined),
        [user],
    );

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column - Form */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    {/* GLB File Upload */}
                    <GlbDropzone
                        file={glbFile}
                        onFileSelect={handleGlbSelect}
                        onRemove={handleGlbRemove}
                        disabled={uploadGlbBrick.isPending}
                    />

                    {/* Thumbnails Upload */}
                    <ThumbnailsSection
                        thumbnails={thumbnails}
                        onAdd={handleThumbnailAdd}
                        onRemove={handleThumbnailRemove}
                        disabled={uploadGlbBrick.isPending}
                    />

                    {/* Form Fields */}
                    <div className="bg-muted/40 border border-border p-6 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-border">
                            <FileText className="size-4 text-primary" />
                            <h3 className="text-sm font-bold tracking-[0.2em] uppercase">
                                Model Metadata
                            </h3>
                            <div className="flex-1" />
                            <span className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-widest">
                                required fields marked *
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-5">
                            <Input
                                label="Title"
                                {...register('title')}
                                leftIcon={<Type className="size-4" />}
                                variant="compact"
                                placeholder="Name your 3D model..."
                                error={errors.title?.message}
                                required
                                disabled={uploadGlbBrick.isPending}
                            />
                            <Textarea
                                label="Description"
                                {...register('description')}
                                rows={3}
                                variant="compact"
                                placeholder="Describe your 3D model (optional)..."
                                error={errors.description?.message}
                                disabled={uploadGlbBrick.isPending}
                            />
                        </div>

                        {/* Geo Coordinates */}
                        <GeoLocationFields
                            latitude={watchedLat}
                            longitude={watchedLon}
                            onLatitudeChange={(val) =>
                                setValue('latitude', val, { shouldValidate: true })
                            }
                            onLongitudeChange={(val) =>
                                setValue('longitude', val, { shouldValidate: true })
                            }
                            latitudeError={errors.latitude?.message}
                            longitudeError={errors.longitude?.message}
                            gpsLocked={geoLocation.latitude != null}
                            disabled={uploadGlbBrick.isPending}
                        />

                        {/* Address Search */}
                        <AddressSearchField
                            value={addressQuery}
                            onChange={handleAddressChange}
                            onSelect={handleAddressSelect}
                            onClear={handleAddressClear}
                            error={errors.address?.message}
                            disabled={uploadGlbBrick.isPending}
                            isTyping={isAddressTyping}
                            setIsTyping={setIsAddressTyping}
                        />
                    </div>

                    {/* Upload Button */}
                    <div className="flex flex-wrap items-center justify-between p-6 bg-muted border border-border">
                        <div className="flex items-center gap-3">
                            {glbFile ? (
                                <>
                                    <Box className="size-4 text-secondary" />
                                    <span className="text-[10px] font-bold tracking-widest text-secondary uppercase truncate max-w-50">
                                        {glbFile.name}
                                    </span>
                                    <span className="text-[9px] font-mono text-muted-foreground">
                                        + {thumbnails.length} thumbnail
                                        {thumbnails.length !== 1 ? 's' : ''}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Upload className="size-4 text-muted-foreground/50" />
                                    <span className="text-[10px] font-bold tracking-widest text-muted-foreground/50 uppercase">
                                        No files selected
                                    </span>
                                </>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={
                                uploadGlbBrick.isPending || !glbFile || thumbnails.length === 0
                            }
                            className="glow-button bg-linear-to-r from-secondary to-primary px-12 py-4 text-primary-foreground text-sm font-black tracking-[0.25em] uppercase flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span>
                                {uploadGlbBrick.isPending ? 'Uploading...' : 'Verify & Upload'}
                            </span>
                            <Zap className="size-4" />
                        </button>
                    </div>
                </div>

                {/* Right Column - Preview */}
                <div className="lg:col-span-4">
                    <GlbPreviewCard
                        glbUrl={glbUrl}
                        modelLoaded={modelLoaded}
                        onModelLoaded={() => setModelLoaded(true)}
                        thumbnails={thumbnails}
                        title={watchedTitle}
                        description={watchedDescription}
                        address={watchedAddress}
                        latitude={watchedLat}
                        longitude={watchedLon}
                        username={user?.username}
                        avatarUrl={avatarUrl}
                    />
                </div>
            </div>
        </form>
    );
}

/* ---- Thumbnails Section ---- */

const MAX_THUMB = 5;

interface ThumbnailsSectionProps {
    thumbnails: { file: File; url: string }[];
    onAdd: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: (index: number) => void;
    disabled?: boolean;
}

function ThumbnailsSection({ thumbnails, onAdd, onRemove, disabled }: ThumbnailsSectionProps) {
    return (
        <div className="bg-muted/40 border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex items-center gap-3">
                <ImagePlus className="size-4 text-primary" />
                <h3 className="text-sm font-bold tracking-[0.2em] uppercase">Thumbnails</h3>
                <div className="flex-1" />
                <span className="text-[9px] font-mono text-primary/50 uppercase tracking-widest">
                    {thumbnails.length} / {MAX_THUMB}
                </span>
            </div>

            <div className="p-4 space-y-4">
                {thumbnails.length > 0 && (
                    <ThumbnailCarousel images={thumbnails} onRemove={onRemove} />
                )}

                {thumbnails.length < MAX_THUMB && (
                    <label
                        className={cn(
                            'flex items-center justify-center gap-3 p-4 border border-dashed rounded-sm transition-all cursor-pointer',
                            thumbnails.length === 0
                                ? 'border-primary/30 hover:border-primary/60 bg-primary/5 min-h-30'
                                : 'border-border hover:border-primary/40',
                            disabled && 'opacity-50 cursor-not-allowed',
                        )}
                    >
                        <ImagePlus className="size-5 text-primary/50" />
                        <span className="text-xs font-bold tracking-widest uppercase text-primary/60">
                            {thumbnails.length === 0
                                ? 'Add Thumbnail Images (1-5)'
                                : `Add More (${MAX_THUMB - thumbnails.length} remaining)`}
                        </span>
                        <input
                            type="file"
                            className="hidden"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            onChange={onAdd}
                            disabled={disabled}
                        />
                    </label>
                )}
            </div>
        </div>
    );
}
