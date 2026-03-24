import Image from 'next/image';
import Link from 'next/link';
import { Database, MapPin, Users } from 'lucide-react';
import type { FollowUser } from '@/types/user.types';
import type { OnchainActivity } from '@/types/brick.types';
import { getAvatarUrl } from '@/utils/cloudinary';
import { Map, MapMarker, MarkerContent, MarkerTooltip, MapControls } from '@/components/ui/Map';
import { timeAgo } from '@/utils/time';
import { useTranslations } from 'next-intl';

// Keep for backward compatibility
export interface Collaborator {
    id: string;
    avatar: string;
}

interface LocationInfo {
    lat: number;
    lng: number;
    displayName: string;
}

interface ArtistSidebarProps {
    activities: OnchainActivity[];
    totalActivities?: number;
    onViewAllActivities?: () => void;
    followers: FollowUser[];
    totalFollowers: number;
    onViewAllFollowers?: () => void;
    location?: LocationInfo;
}

export function ArtistSidebar({
    activities,
    totalActivities,
    onViewAllActivities,
    followers,
    totalFollowers,
    onViewAllFollowers,
    location,
}: ArtistSidebarProps) {
    const t = useTranslations('artist.sidebar');
    const remainingCount = totalFollowers - followers.length;

    return (
        <aside className="col-span-12 lg:col-span-3 space-y-8">
            {/* Node Activity */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-primary/60">
                    <Database className="size-4" /> {t('nodeActivity')}
                </h3>
                <div className="space-y-4 border-l border-primary/20 pl-4 py-2">
                    {activities.length === 0 ? (
                        <p className="text-xs text-muted-foreground font-mono">{t('noActivity')}</p>
                    ) : (
                        activities.map((activity) => (
                            <div key={activity.id} className="space-y-1">
                                <p
                                    className={`text-[11px] font-mono ${activity.type === 'DONATE' ? 'text-secondary' : 'text-primary'}`}
                                >
                                    {activity.type}_{activity.brickId.substring(0, 8).toUpperCase()}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {activity.type === 'MINT'
                                        ? t('activityMint')
                                        : t('activityDonate')}
                                </p>
                                <p className="text-[9px] font-mono text-muted-foreground/50 uppercase">
                                    {timeAgo(activity.createdAt)}
                                </p>
                            </div>
                        ))
                    )}
                </div>
                {activities.length > 0 &&
                    totalActivities !== undefined &&
                    totalActivities > activities.length && (
                        <button
                            onClick={onViewAllActivities}
                            className="w-full py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground hover:text-primary border border-primary/20 hover:border-primary/50 transition-colors rounded-lg bg-muted/50 cursor-pointer"
                        >
                            {t('viewAllActivities', { count: totalActivities })}
                        </button>
                    )}
            </div>

            {/* Location Mini Map */}
            {location && (
                <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-primary/60">
                        <MapPin className="size-3.5" /> {t('location')}
                    </h3>
                    <div className="relative w-full h-56 rounded-lg overflow-hidden border border-primary/10">
                        <Map
                            center={[location.lng, location.lat]}
                            zoom={11}
                            theme="dark"
                            attributionControl={false}
                            dragPan={true}
                            scrollZoom={true}
                            dragRotate={false}
                            touchZoomRotate={true}
                        >
                            <MapMarker longitude={location.lng} latitude={location.lat}>
                                <MarkerContent>
                                    <div className="size-4 rounded-full bg-primary shadow-[0_0_12px_rgba(0,238,255,0.5)] flex items-center justify-center">
                                        <div className="size-1.5 rounded-full bg-background" />
                                    </div>
                                </MarkerContent>
                                <MarkerTooltip className="bg-background/95! text-foreground! border-none! backdrop-blur-md px-2.5 py-1.5 max-w-52 cyber-grid shadow-[0_0_8px_rgba(0,238,255,0.15)]">
                                    <p className="text-[9px] font-mono text-primary/80 leading-snug">
                                        {location.displayName}
                                    </p>
                                </MarkerTooltip>
                            </MapMarker>
                            <MapControls position="bottom-right" showZoom />
                        </Map>
                    </div>
                </div>
            )}

            {/* Followers */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-primary/60">
                    <Users className="size-4" /> {t('followers')}
                    {totalFollowers > 0 && (
                        <span className="text-muted-foreground">({totalFollowers})</span>
                    )}
                </h3>
                {followers.length === 0 ? (
                    <p className="text-xs text-muted-foreground font-mono">{t('noFollowers')}</p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {followers.map((follower) => (
                            <Link
                                key={follower.id}
                                href={`/dashboard/artist/${follower.username}`}
                                className="size-10 rounded-full border border-primary/30 p-0.5 hover:border-primary transition-colors cursor-pointer"
                                title={follower.username}
                            >
                                <Image
                                    src={getAvatarUrl(follower.avatar, follower.gender)}
                                    alt={follower.username}
                                    width={40}
                                    height={40}
                                    className="rounded-full w-full h-full object-cover"
                                />
                            </Link>
                        ))}
                        {remainingCount > 0 && (
                            <button
                                onClick={onViewAllFollowers}
                                className="size-10 rounded-full border border-primary/30 p-0.5 flex items-center justify-center bg-muted cursor-pointer hover:border-primary transition-colors"
                            >
                                <span className="text-[10px] font-mono">+{remainingCount}</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </aside>
    );
}
