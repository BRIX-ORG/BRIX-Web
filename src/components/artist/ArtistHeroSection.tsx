'use client';

import Image from 'next/image';
import { BadgeCheck, Shield, UserPlus, UserCheck, Terminal, Pencil, Loader2 } from 'lucide-react';
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
    onConnect?: () => void;
    onEditProfile?: () => void;
    onFollowersClick?: () => void;
    onFollowingClick?: () => void;
}

export function ArtistHeroSection({
    artist,
    isOwnProfile = false,
    isFollowing = false,
    isFollowLoading = false,
    onFollow,
    onUnfollow,
    onConnect,
    onEditProfile,
    onFollowersClick,
    onFollowingClick,
}: ArtistHeroSectionProps) {
    return (
        <section className="relative group">
            <div className="h-75 w-full bg-muted rounded-xl overflow-hidden relative border border-primary/10">
                {/* Background image or cyber grid */}
                {artist.background ? (
                    <Image
                        src={artist.background}
                        alt="Profile background"
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div
                        className="absolute inset-0 opacity-30"
                        style={{
                            backgroundImage:
                                'linear-gradient(rgba(0,238,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,238,255,0.05) 1px, transparent 1px)',
                            backgroundSize: '20px 20px',
                        }}
                    />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent opacity-80" />

                {/* Profile Info */}
                <div className="absolute bottom-6 left-8 flex items-end gap-8">
                    <div className="relative">
                        <div className="size-32 rounded-full border-2 border-primary shadow-[0_0_30px_rgba(0,238,255,0.4)] overflow-hidden bg-muted">
                            <Image
                                src={getAvatarUrl(artist.avatar, artist.gender)}
                                alt={artist.username}
                                width={128}
                                height={128}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {artist.verifiedAt && (
                            <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1 border-4 border-background">
                                <BadgeCheck className="size-4" />
                            </div>
                        )}
                    </div>
                    <div className="pb-2 space-y-1">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                            {artist.username}
                        </h1>
                        {artist.fullName && artist.fullName !== artist.username && (
                            <p className="text-sm text-muted-foreground">{artist.fullName}</p>
                        )}
                        <p className="text-primary/80 font-mono text-sm uppercase tracking-widest">
                            {artist.tagline}
                        </p>
                        <div className="flex items-center gap-4 pt-2">
                            <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 px-3 py-1 rounded-full">
                                <Shield className="size-4 text-primary" />
                                <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-tighter">
                                    Trust Score: {artist.trustScore}%
                                </span>
                            </div>
                            <button
                                onClick={onFollowersClick}
                                className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            >
                                <span className="font-bold text-foreground">
                                    {artist.followersCount.toLocaleString()}
                                </span>{' '}
                                followers
                            </button>
                            <button
                                onClick={onFollowingClick}
                                className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            >
                                <span className="font-bold text-foreground">
                                    {artist.followingCount.toLocaleString()}
                                </span>{' '}
                                following
                            </button>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="absolute bottom-6 right-8 flex gap-3">
                    {isOwnProfile ? (
                        <button
                            onClick={onEditProfile}
                            className="flex items-center gap-2 px-6 py-3 bg-muted border border-secondary/50 text-foreground rounded-sm font-bold uppercase text-xs hover:bg-secondary/20 transition-all cursor-pointer"
                        >
                            <Pencil className="size-4" /> Edit Profile
                        </button>
                    ) : (
                        <>
                            {isFollowing ? (
                                <button
                                    onClick={onUnfollow}
                                    disabled={isFollowLoading}
                                    className="flex items-center gap-2 px-6 py-3 bg-primary/10 border border-primary/50 text-primary rounded-sm font-bold uppercase text-xs hover:bg-destructive/20 hover:border-destructive/50 hover:text-destructive transition-all cursor-pointer disabled:opacity-50"
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
                                    className="flex items-center gap-2 px-6 py-3 bg-muted border border-secondary/50 text-foreground rounded-sm font-bold uppercase text-xs hover:bg-secondary/20 transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {isFollowLoading ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        <UserPlus className="size-4" />
                                    )}
                                    Follow
                                </button>
                            )}
                            <button
                                onClick={onConnect}
                                className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-secondary to-primary text-primary-foreground rounded-sm font-bold uppercase text-xs hover:opacity-90 transition-all cursor-pointer"
                            >
                                <Terminal className="size-4" /> Connect
                            </button>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
