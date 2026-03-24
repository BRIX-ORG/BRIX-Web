'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Textarea } from '@/components/ui';
import { Map, MapMarker, MarkerContent, MapControls, type MapRef } from '@/components/ui/Map';
import { User, Phone, MapPin, Mail, ShieldCheck } from 'lucide-react';
import { useUpdateProfile } from '@/hooks/apis/user.api';
import { useToast } from '@/hooks/useToast';
import { useUIStore } from '@/stores/ui-store';
import { useTranslations } from 'next-intl';
import { updateProfileSchema, type UpdateProfileInput } from '@/validations/user';
import { LocationSearch } from '@/components/settings';
import type { User as UserType } from '@/types/user.types';
import type { LocationSuggestion } from '@/types/location.types';

interface ProfileFormProps {
    user: UserType;
}

export function ProfileForm({ user }: ProfileFormProps) {
    const t = useTranslations('settings');
    const toast = useToast();
    const showLoading = useUIStore((state) => state.showLoading);
    const hideLoading = useUIStore((state) => state.hideLoading);
    const updateProfile = useUpdateProfile();
    const mapRef = useRef<MapRef>(null);

    const [selectedLocation, setSelectedLocation] = useState<{
        displayName: string;
        lat: number;
        lng: number;
        country: string;
    } | null>(() => {
        // Initialize with existing user address if available
        if (user.address) {
            const lat = parseFloat(user.address.lat);
            const lng = parseFloat(user.address.lon);

            // Only set if coordinates are valid numbers
            if (!isNaN(lat) && !isNaN(lng)) {
                return {
                    displayName: user.address.displayName,
                    lat,
                    lng,
                    country: user.address.country,
                };
            }
        }
        return null;
    });

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        control,
        formState: { errors, isSubmitting },
    } = useForm<UpdateProfileInput>({
        resolver: zodResolver(updateProfileSchema),
    });

    useEffect(() => {
        reset({
            fullName: user.fullName,
            phone: user.phone,
            gender: user.gender,
            address: user.address,
            shortDescription: user.shortDescription || '',
        });
    }, [user, reset]);

    // Auto fly to new location when selected
    useEffect(() => {
        if (selectedLocation && mapRef.current) {
            mapRef.current.flyTo({
                center: [selectedLocation.lng, selectedLocation.lat],
                zoom: 15,
                duration: 1500,
                essential: true,
            });
        }
    }, [selectedLocation]);

    const handleLocationSelect = (location: LocationSuggestion) => {
        const lat = parseFloat(location.lat);
        const lng = parseFloat(location.lon);

        // Validate coordinates before setting
        if (isNaN(lat) || isNaN(lng)) {
            toast.error('Invalid location coordinates');
            return;
        }

        const addressData = {
            lat: location.lat,
            lon: location.lon,
            displayName: location.display_name,
            country: location.address.country,
        };

        setValue('address', addressData, { shouldValidate: true });
        setSelectedLocation({
            displayName: location.display_name,
            lat,
            lng,
            country: location.address.country,
        });
    };

    const onSubmit = async (data: UpdateProfileInput) => {
        try {
            showLoading(t('actions.saving'));
            await updateProfile.mutateAsync(data);
            toast.success(t('messages.updateProfileSuccess'));
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to update profile');
        } finally {
            hideLoading();
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="pt-8 space-y-10">
            <section className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-1">
                        {t('identity.title')}
                    </h2>
                    <p className="text-muted-foreground text-sm">{t('identity.description')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label={t('identity.fullName')}
                        {...register('fullName')}
                        leftIcon={<User className="size-4" />}
                        variant="compact"
                        disabled={isSubmitting || updateProfile.isPending}
                        error={errors.fullName?.message}
                    />

                    <Input
                        label={t('identity.phone')}
                        type="tel"
                        {...register('phone')}
                        leftIcon={<Phone className="size-4" />}
                        variant="compact"
                        placeholder="0912345678"
                        disabled={isSubmitting || updateProfile.isPending}
                        error={errors.phone?.message}
                    />

                    <div className="space-y-2">
                        <label className="block text-xs font-mono font-medium uppercase tracking-[0.2em] text-muted-foreground">
                            {t('identity.username')}
                        </label>
                        <div className="w-full bg-muted/50 border border-border p-3 rounded-sm text-muted-foreground font-mono text-sm flex items-center gap-3">
                            <User className="size-4 text-muted-foreground/50" />
                            {user.username}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-mono font-medium uppercase tracking-[0.2em] text-muted-foreground">
                            {t('identity.email')}
                        </label>
                        <div
                            className="w-full bg-muted/50 border border-border p-3 rounded-sm text-muted-foreground font-mono text-sm flex items-center justify-between group cursor-help"
                            title="Account Verified"
                        >
                            <div className="flex items-center gap-3">
                                <Mail className="size-4 text-muted-foreground/50" />
                                {user.email}
                            </div>
                            <ShieldCheck className="size-4 text-primary group-hover:scale-110 transition-transform" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-mono font-medium uppercase tracking-[0.2em] text-muted-foreground">
                            {t('identity.gender')}
                        </label>
                        <Controller
                            name="gender"
                            control={control}
                            render={({ field }) => (
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        {
                                            value: 'MALE',
                                            label: t('identity.options.male'),
                                            icon: '♂',
                                        },
                                        {
                                            value: 'FEMALE',
                                            label: t('identity.options.female'),
                                            icon: '♀',
                                        },
                                        {
                                            value: 'OTHER',
                                            label: t('identity.options.other'),
                                            icon: '⚧',
                                        },
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            disabled={isSubmitting || updateProfile.isPending}
                                            onClick={() => field.onChange(option.value)}
                                            className={`
                                                relative flex flex-col items-center justify-center gap-1 p-4
                                                border rounded-sm font-mono text-sm uppercase tracking-wider
                                                transition-all duration-200
                                                disabled:opacity-50 disabled:cursor-not-allowed
                                                ${
                                                    field.value === option.value
                                                        ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(0,238,255,0.3)]'
                                                        : 'bg-muted border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                                                }
                                            `}
                                        >
                                            <span className="text-xl">{option.icon}</span>
                                            <span className="text-xs">{option.label}</span>
                                            {field.value === option.value && (
                                                <div className="absolute -top-1 -right-1 size-2 bg-primary rounded-full" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        />
                        {errors.gender && (
                            <p className="text-xs text-red-400 font-mono">
                                {errors.gender.message}
                            </p>
                        )}
                    </div>

                    <Textarea
                        label={t('identity.bio')}
                        {...register('shortDescription')}
                        rows={3}
                        variant="compact"
                        disabled={isSubmitting || updateProfile.isPending}
                        error={errors.shortDescription?.message}
                    />

                    <div className="col-span-1 md:col-span-2">
                        <LocationSearch
                            label={t('identity.location')}
                            placeholder="Search for your address..."
                            defaultValue={user.address?.displayName || ''}
                            onSelect={handleLocationSelect}
                            disabled={isSubmitting || updateProfile.isPending}
                            error={errors.address?.displayName?.message}
                        />
                    </div>

                    {selectedLocation && (
                        <div className="col-span-1 md:col-span-2">
                            <div className="space-y-2">
                                <label className="block text-xs font-mono font-medium uppercase tracking-[0.2em] text-muted-foreground">
                                    {t('identity.preview')}
                                </label>
                                <div className="relative w-full h-75 rounded-sm overflow-hidden border border-border shadow-[0_0_15px_rgba(0,238,255,0.2)]">
                                    <Map
                                        ref={mapRef}
                                        center={[selectedLocation.lng, selectedLocation.lat]}
                                        zoom={15}
                                        theme="dark"
                                    >
                                        <MapMarker
                                            longitude={selectedLocation.lng}
                                            latitude={selectedLocation.lat}
                                        >
                                            <MarkerContent>
                                                <div className="relative">
                                                    <div className="size-6 rounded-full bg-primary shadow-[0_0_20px_rgba(0,238,255,0.6)] flex items-center justify-center animate-pulse">
                                                        <MapPin className="size-4 text-background" />
                                                    </div>
                                                </div>
                                            </MarkerContent>
                                        </MapMarker>
                                        <MapControls
                                            position="bottom-right"
                                            showZoom
                                            showCompass
                                            showLocate
                                        />
                                    </Map>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting || updateProfile.isPending}
                    className="bg-linear-to-r from-secondary to-secondary/80 shadow-[0_0_20px_rgba(188,0,255,0.4)] px-12 py-4 text-white text-sm font-bold uppercase tracking-[0.2em] rounded-sm hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting || updateProfile.isPending
                        ? t('actions.saving')
                        : t('actions.save')}
                </button>
            </div>
        </form>
    );
}
