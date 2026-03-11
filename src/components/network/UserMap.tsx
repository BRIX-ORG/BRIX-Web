'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { Map as MapIcon, Loader2, Star } from 'lucide-react';
import { useGetUserLocations, useGetUser } from '@/hooks/apis/user.api';
import {
    Map as MapComponent,
    MapMarker,
    MarkerContent,
    MarkerTooltip,
    MapControls,
} from '@/components/ui';
import { getDefaultAvatar } from '@/utils/cloudinary';

// Pulsing marker for user dots
function UserPulsingMarker() {
    return (
        <div className="relative">
            <div className="absolute inset-0 size-3 bg-primary rounded-full animate-ping opacity-75" />
            <div className="relative size-3 bg-primary rounded-full border border-background shadow-[0_0_8px_#00eeff]" />
        </div>
    );
}

// UserMapHoverCard inner component
function UserMapHoverCard({ userId }: { userId: string }) {
    const { data: user, isLoading } = useGetUser(userId);

    if (isLoading) {
        return (
            <div className="w-48 h-24 flex items-center justify-center bg-background border border-border rounded-lg shadow-xl backdrop-blur-xl">
                <Loader2 className="size-5 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) return null;

    const avatarUrl = user.avatar?.url || getDefaultAvatar(user.gender || 'OTHER');

    return (
        <div className="w-56 overflow-hidden rounded-xl bg-background/95 border border-primary/30 shadow-[0_0_20px_rgba(0,238,255,0.1)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300 group hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5),0_0_30px_rgba(0,238,255,0.2)] hover:border-primary/50 transition-all">
            {/* Background Cover */}
            <div className="relative h-16 w-full bg-primary/10 border-b border-primary/20">
                {user.background?.url && (
                    <Image
                        src={user.background.url}
                        alt="cover"
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-60 mix-blend-overlay"
                        unoptimized
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
            </div>

            <div className="px-3 pb-3 space-y-2 relative -mt-6">
                {/* Avatar & Info */}
                <div className="flex gap-2 items-end">
                    <div className="relative size-12 rounded-xl bg-muted overflow-hidden shrink-0 border-2 border-background shadow-md">
                        <Image
                            src={avatarUrl}
                            alt={user.username || 'User'}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                </div>

                <div className="flex-1 min-w-0 mt-1">
                    <p className="text-sm font-black tracking-tight text-foreground truncate group-hover:text-primary transition-colors">
                        {user.fullName || user.username}
                        {user.trustScore >= 80 && (
                            <Star className="inline size-3 ml-1 text-yellow-500 fill-yellow-500 mb-0.5" />
                        )}
                    </p>
                    <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest truncate">
                        @{user.username}
                    </p>
                </div>

                {user.shortDescription && (
                    <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2 mt-2 pt-2 border-t border-border/50">
                        {user.shortDescription}
                    </p>
                )}

                {/* Optional Status / Role Badge */}
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm bg-primary/10 text-primary border border-primary/20">
                        {user.role}
                    </span>
                </div>
            </div>
        </div>
    );
}

export function UserMap() {
    const { data: userLocations = [] } = useGetUserLocations();

    // Scatter locations with exact same coordinates
    const scatteredLocations = useMemo(() => {
        const coordsMap = new Map<string, number>();
        return userLocations.map((loc) => {
            const key = `${loc.latitude.toFixed(5)},${loc.longitude.toFixed(5)}`;
            const count = coordsMap.get(key) || 0;
            coordsMap.set(key, count + 1);

            if (count > 0) {
                // Offset roughly ~5 meters per overlapping item
                const offset = count * 0.00005;
                const angle = count * (Math.PI / 4);
                return {
                    ...loc,
                    latitude: loc.latitude + offset * Math.cos(angle),
                    longitude: loc.longitude + offset * Math.sin(angle),
                };
            }
            return loc;
        });
    }, [userLocations]);

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2 uppercase tracking-widest">
                    <MapIcon className="size-5 text-primary" />
                    Global Explorers
                </h2>
            </div>
            <div className="relative w-full h-[600px] rounded-2xl overflow-hidden border border-border/50 shadow-2xl">
                <MapComponent center={[0, 20]} zoom={2} minZoom={1.5} maxZoom={18}>
                    {scatteredLocations.map((node) => (
                        <MapMarker
                            key={node.id}
                            longitude={node.longitude}
                            latitude={node.latitude}
                        >
                            <MarkerContent>
                                <UserPulsingMarker />
                            </MarkerContent>
                            <MarkerTooltip
                                className="p-0 border-none bg-transparent shadow-none"
                                offset={15}
                            >
                                <UserMapHoverCard userId={node.id} />
                            </MarkerTooltip>
                        </MapMarker>
                    ))}
                    <MapControls position="bottom-right" showZoom showLocate showFullscreen />
                </MapComponent>
            </div>
        </section>
    );
}
