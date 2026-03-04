'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, Type, FileText, Zap, X, ImageIcon } from 'lucide-react';
import { Input, Textarea } from '@/components/ui';
import {
    UploadDropzone,
    BrickPreviewCard,
    GeoLocationFields,
    AddressSearchField,
} from '@/components/upload';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useDebounce } from '@/hooks/useDebounce';
import { useLocationReverse } from '@/hooks/apis/location.api';
import { useUploadArtBrick } from '@/hooks/apis/brick.api';
import { useSwal } from '@/hooks/useSwal';
import { useUIStore } from '@/stores/ui-store';
import { getAvatarUrl } from '@/utils/cloudinary';
import { uploadArtBrickSchema, type UploadArtBrickFormInput } from '@/validations/brick';
import type { LocationSuggestion } from '@/types/location.types';

export function ArtUploadForm() {
    const router = useRouter();
    const swal = useSwal();
    const showLoading = useUIStore((state) => state.showLoading);
    const hideLoading = useUIStore((state) => state.hideLoading);
    const { data: session } = useSession();
    const user = session?.user;
    const uploadArtBrick = useUploadArtBrick();

    // File state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Location state
    const { location: geoLocation, requestLocation } = useGeolocation();
    const [geoInitialized, setGeoInitialized] = useState(false);
    const [reverseEnabled, setReverseEnabled] = useState(false);
    const [reverseCoords, setReverseCoords] = useState({ lat: 0, lon: 0 });

    // Address search state
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
    } = useForm<UploadArtBrickFormInput>({
        resolver: zodResolver(uploadArtBrickSchema),
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

    // Debounced lat/lon for reverse geocoding on manual edit
    const debouncedLat = useDebounce(watchedLat, 800);
    const debouncedLon = useDebounce(watchedLon, 800);

    // Reverse geocode query
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

    // Trigger reverse geocoding when lat/lon change manually
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

    // File preview URL management
    useEffect(() => {
        if (selectedFile) {
            const url = URL.createObjectURL(selectedFile);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPreviewUrl(null);
        }
    }, [selectedFile]);

    // Handlers
    const handleFileSelect = useCallback((files: FileList) => {
        if (files.length > 0) {
            setSelectedFile(files[0]);
        }
    }, []);

    const handleRemoveFile = useCallback(() => {
        setSelectedFile(null);
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

    const onSubmit = async (data: UploadArtBrickFormInput) => {
        if (!selectedFile) {
            swal.error('Error', 'Please select an image file to upload');
            return;
        }

        try {
            showLoading('Uploading art brick...');
            const result = await uploadArtBrick.mutateAsync({
                file: selectedFile,
                ...data,
            });
            swal.success('Success', 'Art brick uploaded successfully!');
            // Reset form
            reset();
            setSelectedFile(null);
            setAddressQuery('');
            router.push(`/dashboard/brick/${result.id}`);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            swal.error(
                'Upload Failed',
                error?.response?.data?.message || 'Failed to upload art brick',
            );
        } finally {
            hideLoading();
        }
    };

    const avatarUrl = user ? getAvatarUrl(user.avatar, user.gender) : undefined;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column — Form */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    {/* File Upload / Preview */}
                    {selectedFile && previewUrl ? (
                        <div className="relative group">
                            <div className="glitch-border neon-grid relative overflow-hidden aspect-video bg-muted/40">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-full h-full object-contain"
                                />
                                {/* Overlay info */}
                                <div className="absolute top-4 left-4 text-[10px] text-primary/50 font-mono">
                                    {selectedFile.name}
                                </div>
                                <div className="absolute top-4 right-4 text-[10px] text-primary/50 font-mono">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </div>
                            </div>
                            {/* Remove file button */}
                            <button
                                type="button"
                                onClick={handleRemoveFile}
                                className="absolute bottom-4 right-4 z-10 bg-red-500/80 hover:bg-red-500 text-white px-4 py-2 text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 transition-all backdrop-blur-sm"
                            >
                                <X className="size-3" />
                                Remove
                            </button>
                        </div>
                    ) : (
                        <UploadDropzone onFileSelect={handleFileSelect} />
                    )}

                    {/* Form Fields */}
                    <div className="bg-muted/40 border border-border p-6 space-y-6">
                        {/* Section header */}
                        <div className="flex items-center gap-3 pb-4 border-b border-border">
                            <FileText className="size-4 text-primary" />
                            <h3 className="text-sm font-bold tracking-[0.2em] uppercase">
                                Brick Metadata
                            </h3>
                            <div className="flex-1" />
                            <span className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-widest">
                                required fields marked *
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-5">
                            {/* Title */}
                            <Input
                                label="Title"
                                {...register('title')}
                                leftIcon={<Type className="size-4" />}
                                variant="compact"
                                placeholder="Give your brick a title..."
                                error={errors.title?.message}
                                required
                                disabled={uploadArtBrick.isPending}
                            />

                            {/* Description */}
                            <Textarea
                                label="Description"
                                {...register('description')}
                                rows={3}
                                variant="compact"
                                placeholder="Describe your artwork (optional)..."
                                error={errors.description?.message}
                                disabled={uploadArtBrick.isPending}
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
                            disabled={uploadArtBrick.isPending}
                        />

                        {/* Address Search */}
                        <AddressSearchField
                            value={addressQuery}
                            onChange={handleAddressChange}
                            onSelect={handleAddressSelect}
                            onClear={handleAddressClear}
                            error={errors.address?.message}
                            disabled={uploadArtBrick.isPending}
                            isTyping={isAddressTyping}
                            setIsTyping={setIsAddressTyping}
                        />
                    </div>

                    {/* Upload Button */}
                    <div className="flex flex-wrap items-center justify-between p-6 bg-muted border border-border">
                        <div className="flex items-center gap-3">
                            {selectedFile ? (
                                <>
                                    <ImageIcon className="size-4 text-primary" />
                                    <span className="text-[10px] font-bold tracking-widest text-primary uppercase">
                                        {selectedFile.name}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Upload className="size-4 text-muted-foreground/50" />
                                    <span className="text-[10px] font-bold tracking-widest text-muted-foreground/50 uppercase">
                                        No file selected
                                    </span>
                                </>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={uploadArtBrick.isPending || !selectedFile}
                            className="glow-button bg-linear-to-r from-primary to-secondary px-12 py-4 text-primary-foreground text-sm font-black tracking-[0.25em] uppercase flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span>
                                {uploadArtBrick.isPending ? 'Uploading...' : 'Verify & Upload'}
                            </span>
                            <Zap className="size-4" />
                        </button>
                    </div>
                </div>

                {/* Right Column — Preview */}
                <div className="lg:col-span-4">
                    <BrickPreviewCard
                        imageUrl={previewUrl}
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
