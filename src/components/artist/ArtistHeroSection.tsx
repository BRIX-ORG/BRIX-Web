'use client';

import Image from 'next/image';
import {
    BadgeCheck,
    Shield,
    UserPlus,
    UserCheck,
    MessageSquare,
    Pencil,
    Loader2,
    Users,
    Share2,
} from 'lucide-react';
import type { Gender } from '@/types/user.types';
import { getAvatarUrl, type CloudinaryImage } from '@/utils/cloudinary';

export interface ArtistData {
    id: string;
    username: string;
    fullName: string;
    tagline: string;
    avatar: CloudinaryImage | null;
    gender: Gender;
    background: string | null;
    trustScore: number;
    verifiedAt: string | null;
    followersCount: number;
    followingCount: number;
}

interface ArtistHeroSectionProps {
    artist: ArtistData;
    isOwnProfile?: boolean;
    isFollowing?: boolean;
    isFollowLoading?: boolean;
    onFollow?: () => void;
    onUnfollow?: () => void;
    onChat?: () => void;
    onEditProfile?: () => void;
    onFollowersClick?: () => void;
    onFollowingClick?: () => void;
    onShareClick?: () => void;
}

export function ArtistHeroSection({
    artist,
    isOwnProfile = false,
    isFollowing = false,
    isFollowLoading = false,
    onFollow,
    onUnfollow,
    onChat,
    onEditProfile,
    onFollowersClick,
    onFollowingClick,
    onShareClick,
}: ArtistHeroSectionProps) {
    return (
        <section className="relative group">
            {/* Main Container with subtle outer glow */}
            <div className="relative min-h-[24rem] w-full rounded-2xl overflow-hidden border border-white/10 bg-background/40 backdrop-blur-sm shadow-2xl transition-all duration-700 group-hover:border-primary/20 flex flex-col p-4 md:p-6 justify-end pt-32">
                {/* 1. Background Layer */}
                <div className="absolute inset-0 z-0">
                    {artist.background ? (
                        <Image
                            src={artist.background}
                            alt="Profile background"
                            fill
                            className="object-cover opacity-85 group-hover:scale-105 transition-transform duration-1000"
                            priority
                        />
                    ) : (
                        <div
                            className="absolute inset-0 opacity-10"
                            style={{
                                backgroundImage:
                                    'linear-gradient(rgba(0,238,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,238,255,0.05) 1px, transparent 1px)',
                                backgroundSize: '30px 30px',
                            }}
                        />
                    )}
                    {/* Balanced gradient overlay — more transparent to show image */}
                    <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/40 to-transparent" />
                </div>

                {/* 2. Glassmorphism Card (Floating effect) */}
                <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-end justify-between gap-6 p-6 md:p-8 rounded-xl border border-white/10 bg-background/20 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] transition-all duration-500 mt-auto">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 text-center md:text-left">
                        {/* Avatar with Halo Glow */}
                        <div className="relative shrink-0">
                            <div className="absolute -inset-1 bg-linear-to-r from-primary via-secondary to-primary rounded-full blur-md opacity-40 group-hover:opacity-100 animate-pulse transition-opacity duration-700" />
                            <div className="relative size-36 rounded-full border-2 border-primary/50 overflow-hidden bg-muted shadow-2xl ring-4 ring-background">
                                <Image
                                    src={getAvatarUrl(artist.avatar, artist.gender)}
                                    alt={artist.username}
                                    width={144}
                                    height={144}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {artist.verifiedAt && (
                                <div className="absolute bottom-1 right-1 bg-primary text-black rounded-full p-1.5 shadow-[0_0_15px_rgba(0,238,255,0.6)] border-2 border-background z-20">
                                    <BadgeCheck className="size-5" />
                                </div>
                            )}
                        </div>

                        {/* Text Content */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 justify-center md:justify-start">
                                <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase drop-shadow-lg">
                                    {artist.username}
                                </h1>
                                <div className="hidden md:flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-sm">
                                    <Shield className="size-3.5 text-primary" />
                                    <span className="text-[10px] font-mono font-bold text-primary uppercase">
                                        TRUST_LEVEL: {artist.trustScore}%
                                    </span>
                                </div>
                            </div>

                            <p className="text-primary/90 font-mono text-sm uppercase tracking-[0.3em] font-medium">
                                {artist.tagline}
                            </p>

                            {artist.fullName && artist.fullName !== artist.username && (
                                <p className="text-muted-foreground font-medium flex items-center gap-2 justify-center md:justify-start">
                                    <span className="size-1 rounded-full bg-white/20" />
                                    {artist.fullName}
                                </p>
                            )}

                            {/* Stats Pills */}
                            <div className="flex items-center gap-6 pt-2 justify-center md:justify-start">
                                <button
                                    onClick={onFollowersClick}
                                    className="group/stat flex flex-col items-start cursor-pointer transition-transform hover:scale-105"
                                >
                                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest group-hover/stat:text-primary transition-colors flex items-center gap-1.5">
                                        <Users className="size-3" /> Followers
                                    </span>
                                    <span className="text-xl font-bold font-mono tracking-tighter">
                                        {artist.followersCount.toLocaleString()}
                                    </span>
                                </button>
                                <div className="w-px h-8 bg-white/10" />
                                <button
                                    onClick={onFollowingClick}
                                    className="group/stat flex flex-col items-start cursor-pointer transition-transform hover:scale-105"
                                >
                                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest group-hover/stat:text-primary transition-colors">
                                        Following
                                    </span>
                                    <span className="text-xl font-bold font-mono tracking-tighter">
                                        {artist.followingCount.toLocaleString()}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-full sm:min-w-0 w-full lg:w-auto mt-4 lg:mt-0">
                        {isOwnProfile ? (
                            <button
                                onClick={onEditProfile}
                                className="group/btn flex items-center justify-center gap-3 px-8 py-4 bg-white/5 border border-white/10 text-white rounded-sm font-black uppercase text-xs tracking-widest hover:bg-primary/10 hover:border-primary/40 transition-all cursor-pointer shadow-lg"
                            >
                                <Pencil className="size-4 group-hover/btn:text-primary transition-colors" />
                                Edit Profile
                            </button>
                        ) : (
                            <>
                                {isFollowing ? (
                                    <button
                                        onClick={onUnfollow}
                                        disabled={isFollowLoading}
                                        className="flex items-center justify-center gap-3 px-8 py-4 bg-primary/10 border border-primary/40 text-primary rounded-sm font-black uppercase text-xs tracking-widest hover:bg-destructive/20 hover:border-destructive/40 hover:text-destructive transition-all cursor-pointer disabled:opacity-50 shadow-[0_0_20px_rgba(0,238,255,0.1)]"
                                    >
                                        {isFollowLoading ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                            <UserCheck className="size-4" />
                                        )}
                                        Following
                                    </button>
                                ) : (
                                    <button
                                        onClick={onFollow}
                                        disabled={isFollowLoading}
                                        className="flex items-center justify-center gap-3 px-8 py-4 bg-primary hover:bg-primary/90 text-black rounded-sm font-black uppercase text-xs tracking-widest transition-all cursor-pointer disabled:opacity-50 shadow-lg"
                                    >
                                        {isFollowLoading ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                            <UserPlus className="size-4" />
                                        )}
                                        Follow artist
                                    </button>
                                )}
                                <button
                                    onClick={onChat}
                                    className="flex items-center justify-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/15 border border-white/10 text-white rounded-sm font-black uppercase text-xs tracking-widest transition-all cursor-pointer shadow-lg"
                                >
                                    <MessageSquare className="size-4" /> Open Chat
                                </button>
                            </>
                        )}
                        <button
                            onClick={onShareClick}
                            title="Share Profile"
                            className="flex items-center justify-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-sm font-black uppercase text-xs tracking-widest transition-all cursor-pointer shadow-lg"
                        >
                            <Share2 className="size-4" /> Share
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
