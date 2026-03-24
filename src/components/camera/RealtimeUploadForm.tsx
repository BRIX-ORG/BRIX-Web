'use client';

import { useState, useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Zap, Globe, Lock, Type, FileText, Navigation, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Input, Textarea } from '@/components/ui';
import { AddressSearchField } from '@/components/upload';
import { RealtimeBrickPreviewCard, AddressMapPicker } from '@/components/camera';
import { EmojiPickerButton } from '@/components/shared';
import { useLocationReverse } from '@/hooks/apis/location.api';
import { useSwal } from '@/hooks/useSwal';
import { getAvatarUrl } from '@/utils/cloudinary';
import { uploadRealtimeBrickSchema, type UploadRealtimeBrickFormInput } from '@/validations/brick';
import type { LocationSuggestion } from '@/types/location.types';

/** Maximum allowed distance (in km) between the capture GPS and a selected address. */
const MAX_ADDRESS_DISTANCE_KM = 5;

/**
 * Haversine distance between two lat/lon pairs, returned in km.
 */
function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface RealtimeUploadFormProps {
    onSubmit: (data: UploadRealtimeBrickFormInput) => void;
    isSubmitting: boolean;
    defaultLatitude?: number | null;
    defaultLongitude?: number | null;
    capturedPreviewUrl?: string | null;
    sessionId?: string | null;
}

export function RealtimeUploadForm({
    onSubmit,
    isSubmitting,
    defaultLatitude,
    defaultLongitude,
    capturedPreviewUrl,
    sessionId,
}: RealtimeUploadFormProps) {
    const t = useTranslations('camera.RealtimeUploadForm');
    const swal = useSwal();
    const { data: session } = useSession();
    const user = session?.user;
    const avatarUrl = user ? getAvatarUrl(user.avatar, user.gender) : undefined;

    // Reverse geocode state (initial GPS coords — computed from props, no effect needed)
    const hasValidCoords =
        defaultLatitude != null &&
        defaultLongitude != null &&
        defaultLatitude !== 0 &&
        defaultLongitude !== 0;
    const [reverseEnabled, setReverseEnabled] = useState(hasValidCoords);
    const [reverseCoords] = useState({ lat: defaultLatitude ?? 0, lon: defaultLongitude ?? 0 });

    // Reverse geocode state (map picked coords)
    const [pickReverseEnabled, setPickReverseEnabled] = useState(false);
    const [pickReverseCoords, setPickReverseCoords] = useState({ lat: 0, lon: 0 });

    // Map pick state
    const [pickedLat, setPickedLat] = useState<number | null>(null);
    const [pickedLon, setPickedLon] = useState<number | null>(null);

    // Original address from initial reverse geocode (for reset)
    const [originalAddress, setOriginalAddress] = useState('');

    // Address search state
    const [addressQuery, setAddressQuery] = useState('');
    const [isAddressTyping, setIsAddressTyping] = useState(false);

    // Form
    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: { errors },
    } = useForm<UploadRealtimeBrickFormInput>({
        resolver: zodResolver(uploadRealtimeBrickSchema),
        defaultValues: {
            title: '',
            description: '',
            address: '',
            latitude: defaultLatitude ?? null,
            longitude: defaultLongitude ?? null,
            isPublic: true,
        },
    });

    const watchedTitle = useWatch({ control, name: 'title' });
    const watchedDescription = useWatch({ control, name: 'description' });
    const watchedAddress = useWatch({ control, name: 'address' });
    const watchedLat = useWatch({ control, name: 'latitude' });
    const watchedLon = useWatch({ control, name: 'longitude' });
    const isPublic = useWatch({ control, name: 'isPublic' });

    // Track which reverse geocode results have been synced (for render-time state adjustment)
    const [lastSyncedReverse, setLastSyncedReverse] = useState('');
    const [lastSyncedPickReverse, setLastSyncedPickReverse] = useState('');

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

    // Reverse geocode for map-picked coords
    const { data: pickReverseData } = useLocationReverse(
        {
            lat: pickReverseCoords.lat,
            lon: pickReverseCoords.lon,
            addressdetails: 1,
            lang: 'en',
            normalizeaddress: 1,
        },
        pickReverseEnabled,
    );

    // Adjust state during render when reverse geocode data arrives
    // (React-recommended pattern: conditional setState during render with stabilizing guard)
    if (reverseData?.display_name && reverseData.display_name !== lastSyncedReverse) {
        setLastSyncedReverse(reverseData.display_name);
        setValue('address', reverseData.display_name);
        setAddressQuery(reverseData.display_name);
        setOriginalAddress(reverseData.display_name);
        setReverseEnabled(false);
    }

    if (pickReverseData?.display_name && pickReverseData.display_name !== lastSyncedPickReverse) {
        setLastSyncedPickReverse(pickReverseData.display_name);
        setValue('address', pickReverseData.display_name, { shouldValidate: true });
        setAddressQuery(pickReverseData.display_name);
        setPickReverseEnabled(false);
    }

    // ─── Address handlers ─────────────────────────────────────────
    const handleAddressChange = useCallback(
        (value: string) => {
            setAddressQuery(value);
            setValue('address', value);
        },
        [setValue],
    );

    const handleAddressSelect = useCallback(
        (location: LocationSuggestion) => {
            const selectedLat = parseFloat(location.lat);
            const selectedLon = parseFloat(location.lon);

            // Validate distance from capture location
            if (
                defaultLatitude != null &&
                defaultLongitude != null &&
                !isNaN(selectedLat) &&
                !isNaN(selectedLon)
            ) {
                const distance = haversineDistanceKm(
                    defaultLatitude,
                    defaultLongitude,
                    selectedLat,
                    selectedLon,
                );

                if (distance > MAX_ADDRESS_DISTANCE_KM) {
                    swal.error(
                        t('alerts.addressTooFar'),
                        t('alerts.addressTooFarDesc', {
                            distance: distance.toFixed(1),
                            limit: MAX_ADDRESS_DISTANCE_KM,
                        }),
                    );
                    return;
                }
            }

            // Address is within range — apply it (keep original GPS coords locked)
            setValue('address', location.display_name, { shouldValidate: true });
            setAddressQuery(location.display_name);
            setIsAddressTyping(false);
        },
        [setValue, defaultLatitude, defaultLongitude, swal, t],
    );

    const handleAddressClear = useCallback(() => {
        setAddressQuery('');
        setValue('address', '');
        setIsAddressTyping(false);
    }, [setValue]);

    // ─── Map pick handler ─────────────────────────────────────────
    const handleMapPick = useCallback((lat: number, lon: number) => {
        setPickedLat(lat);
        setPickedLon(lon);
        // Trigger reverse geocode for picked coords
        setPickReverseCoords({ lat, lon });
        setPickReverseEnabled(true);
        setIsAddressTyping(false);
    }, []);

    const handleMapPickTooFar = useCallback(
        (distance: number) => {
            swal.error(
                t('alerts.locationTooFar'),
                t('alerts.locationTooFarDesc', {
                    distance: distance.toFixed(1),
                    limit: MAX_ADDRESS_DISTANCE_KM,
                }),
            );
        },
        [swal, t],
    );

    // ─── Reset address to original GPS reverse geocode ────────────
    const handleResetAddress = useCallback(() => {
        if (originalAddress) {
            setValue('address', originalAddress, { shouldValidate: true });
            setAddressQuery(originalAddress);
        }
        setPickedLat(null);
        setPickedLon(null);
        setIsAddressTyping(false);
    }, [originalAddress, setValue]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column — Form */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    {/* ─── Form Fields ─────────────────────────────────────── */}
                    <div className="bg-muted/40 border border-border p-6 space-y-6">
                        {/* Section header */}
                        <div className="flex items-center gap-3 pb-4 border-b border-border">
                            <FileText className="size-4 text-primary" />
                            <h3 className="text-sm font-bold tracking-[0.2em] uppercase">
                                {t('metadataHeader')}
                            </h3>
                            <div className="flex-1" />
                            <span className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-widest">
                                {t('requiredFields')}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-5">
                            {/* Title */}
                            <div className="relative z-10 focus-within:z-50">
                                <Input
                                    label={t('title.label')}
                                    {...register('title')}
                                    leftIcon={<Type className="size-4" />}
                                    variant="compact"
                                    placeholder={t('title.placeholder')}
                                    error={errors.title?.message}
                                    required
                                    disabled={isSubmitting}
                                />
                                <div className="absolute right-2 top-[37px]">
                                    <EmojiPickerButton
                                        onEmojiSelect={(emoji) =>
                                            setValue('title', (watchedTitle || '') + emoji, {
                                                shouldValidate: true,
                                            })
                                        }
                                        className="size-7"
                                        position="top"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="relative z-10 focus-within:z-50">
                                <Textarea
                                    label={t('description.label')}
                                    {...register('description')}
                                    rows={3}
                                    variant="compact"
                                    placeholder={t('description.placeholder')}
                                    error={errors.description?.message}
                                    disabled={isSubmitting}
                                />
                                <div className="absolute right-2 bottom-2">
                                    <EmojiPickerButton
                                        onEmojiSelect={(emoji) =>
                                            setValue(
                                                'description',
                                                (watchedDescription || '') + emoji,
                                                {
                                                    shouldValidate: true,
                                                },
                                            )
                                        }
                                        className="size-7"
                                        position="top"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Geo Coordinates (read-only / locked for realtime) */}
                        <div className="space-y-5">
                            <div className="flex items-center gap-3 pb-4 border-b border-border">
                                <Navigation className="size-4 text-secondary" />
                                <h3 className="text-sm font-bold tracking-[0.2em] uppercase">
                                    {t('geoHeader')}
                                </h3>
                                <div className="flex-1" />
                                <span className="text-[9px] font-mono text-primary/60 uppercase tracking-widest flex items-center gap-1.5">
                                    <span className="size-1.5 bg-primary rounded-full animate-pulse" />
                                    {t('gpsLocked')}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Input
                                    label={t('lat')}
                                    type="number"
                                    step="any"
                                    leftIcon={<Navigation className="size-4" />}
                                    variant="compact"
                                    value={watchedLat ?? ''}
                                    disabled
                                />
                                <Input
                                    label={t('lng')}
                                    type="number"
                                    step="any"
                                    leftIcon={<Navigation className="size-4" />}
                                    variant="compact"
                                    value={watchedLon ?? ''}
                                    disabled
                                />
                            </div>

                            <p className="text-[9px] text-muted-foreground/50 font-mono uppercase tracking-wider">
                                {t('coordsLocked')}
                            </p>
                        </div>

                        {/* Address Search + Reset */}
                        <div className="space-y-3">
                            <div className="flex items-end gap-2">
                                <div className="flex-1">
                                    <AddressSearchField
                                        value={addressQuery}
                                        onChange={handleAddressChange}
                                        onSelect={handleAddressSelect}
                                        onClear={handleAddressClear}
                                        error={errors.address?.message}
                                        disabled={isSubmitting}
                                        isTyping={isAddressTyping}
                                        setIsTyping={setIsAddressTyping}
                                    />
                                </div>
                                {originalAddress && watchedAddress !== originalAddress && (
                                    <button
                                        type="button"
                                        onClick={handleResetAddress}
                                        disabled={isSubmitting}
                                        className="shrink-0 mb-0.5 flex items-center gap-1.5 px-3 py-3 border border-border text-muted-foreground text-[10px] font-bold uppercase tracking-widest hover:text-primary hover:border-primary/40 transition-colors disabled:opacity-50"
                                        title={t('resetTooltip')}
                                    >
                                        <RotateCcw className="size-3.5" />
                                        {t('reset')}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Map Picker */}
                        {defaultLatitude != null && defaultLongitude != null && (
                            <AddressMapPicker
                                originLatitude={defaultLatitude}
                                originLongitude={defaultLongitude}
                                pickedLatitude={pickedLat}
                                pickedLongitude={pickedLon}
                                onPick={handleMapPick}
                                onPickTooFar={handleMapPickTooFar}
                                disabled={isSubmitting}
                            />
                        )}
                    </div>

                    {/* ─── Bottom Bar ──────────────────────────────────────── */}
                    <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-muted border border-border">
                        {/* Visibility Toggle */}
                        <button
                            type="button"
                            onClick={() => setValue('isPublic', !isPublic)}
                            className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
                        >
                            {isPublic ? (
                                <>
                                    <Globe className="size-3.5 text-primary" />
                                    <span>{t('visibility.public')}</span>
                                </>
                            ) : (
                                <>
                                    <Lock className="size-3.5 text-secondary" />
                                    <span>{t('visibility.private')}</span>
                                </>
                            )}
                        </button>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="glow-button bg-linear-to-r from-primary to-secondary px-12 py-4 text-primary-foreground text-sm font-black tracking-[0.25em] uppercase flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span>{isSubmitting ? t('submitting') : t('submit')}</span>
                            <Zap className="size-4" />
                        </button>
                    </div>
                </div>

                {/* Right Column — Preview */}
                <div className="lg:col-span-4">
                    <RealtimeBrickPreviewCard
                        imageUrl={capturedPreviewUrl}
                        title={watchedTitle}
                        description={watchedDescription}
                        address={watchedAddress}
                        latitude={watchedLat}
                        longitude={watchedLon}
                        nonce={sessionId?.slice(0, 8)}
                        username={user?.username}
                        avatarUrl={avatarUrl}
                    />
                </div>
            </div>
        </form>
    );
}
