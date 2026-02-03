'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { Camera, Image as ImageIcon } from 'lucide-react';
import { useUpdateAvatar, useUpdateBackground } from '@/hooks/apis/user.api';
import { useToast } from '@/hooks/useToast';
import { useUIStore } from '@/stores/ui-store';
import { getAvatarUrl, getCloudinaryAvatar, getCloudinaryBanner } from '@/utils/cloudinary';
import type { User } from '@/types/user.types';

interface SettingsBannerProps {
    user: User;
}

export function SettingsBanner({ user }: SettingsBannerProps) {
    const toast = useToast();
    const showLoading = useUIStore((state) => state.showLoading);
    const hideLoading = useUIStore((state) => state.hideLoading);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const updateAvatar = useUpdateAvatar();
    const updateBackground = useUpdateBackground();

    const avatarUrl = getAvatarUrl(user.avatar, user.gender);
    const backgroundUrl = user.background?.url;

    const handleAvatarClick = () => {
        avatarInputRef.current?.click();
    };

    const handleBannerClick = () => {
        bannerInputRef.current?.click();
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }

        try {
            showLoading('Uploading avatar...');
            await updateAvatar.mutateAsync(file);
            toast.success('Avatar updated successfully!');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to upload avatar');
        } finally {
            hideLoading();
        }
    };

    const handleBackgroundChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error('Image size must be less than 10MB');
            return;
        }

        try {
            showLoading('Uploading banner...');
            console.log('Uploading banner...');
            await updateBackground.mutateAsync(file);
            console.log('Banner uploaded');
            toast.success('Banner updated successfully!');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error('Error uploading banner:', error);
            toast.error(error?.response?.data?.message || 'Failed to upload banner');
        } finally {
            hideLoading();
        }
    };

    return (
        <>
            {/* Hidden file inputs */}
            <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
            />
            <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBackgroundChange}
            />

            {/* Banner Section */}
            <section className="relative group">
                <div className="h-60 w-full bg-muted rounded-sm overflow-hidden relative border border-primary/10 cyber-grid">
                    {backgroundUrl && (
                        <Image
                            alt="Banner"
                            className="w-full h-full object-cover opacity-40"
                            src={getCloudinaryBanner(backgroundUrl, 1200)}
                            fill
                            sizes="100vw"
                            priority
                        />
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent opacity-60" />
                    <button
                        type="button"
                        onClick={handleBannerClick}
                        disabled={updateBackground.isPending}
                        className="absolute top-4 right-4 bg-background/80 backdrop-blur-md border border-primary/20 px-4 py-2 text-[10px] font-mono uppercase tracking-[0.2em] hover:border-primary transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        <ImageIcon className="size-4" />
                        {updateBackground.isPending ? 'Uploading...' : 'Change Banner'}
                    </button>
                </div>

                {/* Avatar */}
                <div className="absolute -bottom-16 left-10">
                    <div className="relative group/avatar">
                        <div className="size-32 rounded-full border-4 border-primary shadow-[0_0_15px_rgba(0,238,255,0.4)] overflow-hidden bg-linear-to-br from-muted to-background relative">
                            <Image
                                alt="User Avatar"
                                className="object-cover"
                                src={getCloudinaryAvatar(avatarUrl, 128)}
                                fill
                                sizes="128px"
                                priority
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleAvatarClick}
                            disabled={updateAvatar.isPending}
                            className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity rounded-full disabled:opacity-50"
                        >
                            <Camera className="size-6 text-primary" />
                        </button>
                    </div>
                </div>
            </section>
        </>
    );
}
