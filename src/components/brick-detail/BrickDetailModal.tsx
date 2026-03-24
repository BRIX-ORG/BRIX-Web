'use client';

import { useEffect, useState } from 'react';
import { X, Loader2, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { usePreventScroll } from '@/hooks/usePreventScroll';
import { useGetBrickDetail, useGetBrickVotes } from '@/hooks/apis/brick.api';
import {
    BrickMediaViewer,
    BrickInfoPanel,
    BrickVoteBar,
    CommentSection,
    UpvotersModal,
    ShareButton,
} from '@/components/brick-detail';
import { Map, MapMarker, MarkerContent, MapControls } from '@/components/ui/Map';

interface BrickDetailModalProps {
    brickId: string | undefined;
    onClose: () => void;
}

export function BrickDetailModal({ brickId, onClose }: BrickDetailModalProps) {
    const t = useTranslations('brickDetail.page');
    const tc = useTranslations('common');
    const isOpen = !!brickId;
    usePreventScroll(isOpen);

    const { data: session } = useSession();
    const currentUserId = session?.user?.id;

    const { data: brick, isLoading } = useGetBrickDetail(brickId);
    const { data: voteStatus } = useGetBrickVotes(brickId);

    const isOwner = !!currentUserId && currentUserId === brick?.user?.id;
    const [showUpvoters, setShowUpvoters] = useState(false);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    // Scroll to comment anchor on open if hash is present
    useEffect(() => {
        if (!isOpen || !brick) return;
        const hash = window.location.hash;
        if (hash?.startsWith('#comment-')) {
            requestAnimationFrame(() => {
                const target = document.getElementById(hash.slice(1));
                target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        }
    }, [isOpen, brick]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
            />

            {/* Modal container */}
            <div className="relative w-full max-w-5xl max-h-[95vh] bg-background/95 border border-primary/30 rounded-xl overflow-hidden shadow-[0_0_60px_rgba(0,238,255,0.15)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300 flex flex-col">
                {/* Close button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    className="absolute top-3 right-3 z-20 p-1.5 bg-background/80 border border-primary/20 rounded-full hover:bg-muted transition-colors cursor-pointer"
                >
                    <X className="size-4 text-foreground" />
                </button>

                {isLoading || !brick ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="size-8 animate-spin text-primary" />
                        <p className="text-[10px] text-primary animate-pulse tracking-widest uppercase font-mono">
                            {t('loading')}
                        </p>
                    </div>
                ) : (
                    <>
                        {/*Desktop layout: side-by-side*/}
                        <div className="hidden md:flex flex-1 min-h-0">
                            {/* Left panel media + info */}
                            <div className="w-[55%] border-r border-primary/10 flex flex-col overflow-y-auto scrollbar-hide">
                                <div className="p-4 space-y-4">
                                    <BrickMediaViewer brick={brick} isOwner={isOwner} />
                                    <BrickInfoPanel brick={brick} isOwner={isOwner} />

                                    {/* Vote bar + Share */}
                                    <div className="flex items-center gap-4 border-t border-primary/10 pt-3">
                                        <BrickVoteBar
                                            brickId={brick.id}
                                            voteStatus={voteStatus}
                                            onShowUpvoters={() => setShowUpvoters(true)}
                                        />
                                        <ShareButton brickId={brick.id} />
                                        <span className="text-[10px] text-muted-foreground/50 font-mono ml-auto">
                                            {brick._count.votes} {tc('votes')} &middot;{' '}
                                            {brick._count.comments} {tc('comments')}
                                        </span>
                                    </div>

                                    {/* Interactive Map */}
                                    {brick.latitude != null && brick.longitude != null && (
                                        <div className="border border-primary/20 rounded-lg overflow-hidden">
                                            <div className="flex items-center gap-2 px-3 py-2 border-b border-primary/10">
                                                <MapPin className="size-3.5 text-primary" />
                                                <h3 className="text-[10px] font-bold uppercase tracking-widest">
                                                    {t('location')}
                                                </h3>
                                            </div>
                                            <div className="relative w-full h-44">
                                                <Map
                                                    center={[brick.longitude, brick.latitude]}
                                                    zoom={13}
                                                    theme="dark"
                                                    attributionControl={false}
                                                    dragPan
                                                    scrollZoom
                                                    dragRotate={false}
                                                    touchZoomRotate
                                                >
                                                    <MapMarker
                                                        longitude={brick.longitude}
                                                        latitude={brick.latitude}
                                                    >
                                                        <MarkerContent>
                                                            <div className="size-4 rounded-full bg-primary shadow-[0_0_12px_rgba(0,238,255,0.5)] flex items-center justify-center">
                                                                <div className="size-1.5 rounded-full bg-background" />
                                                            </div>
                                                        </MarkerContent>
                                                    </MapMarker>
                                                    <MapControls position="bottom-right" showZoom />
                                                </Map>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right panel — comments */}
                            <div className="w-[45%] flex flex-col min-h-0">
                                <CommentSection
                                    brickId={brick.id}
                                    totalComments={brick._count.comments}
                                    currentUserId={currentUserId}
                                />
                            </div>
                        </div>

                        {/*Mobile layout: stacked*/}
                        <div className="flex md:hidden flex-col flex-1 overflow-y-auto scrollbar-hide">
                            {/* Media + info */}
                            <div className="p-3 space-y-3">
                                <BrickMediaViewer brick={brick} isOwner={isOwner} />
                                <BrickInfoPanel brick={brick} isOwner={isOwner} />

                                {/* Vote bar + Share */}
                                <div className="flex items-center gap-4 border-t border-primary/10 pt-3">
                                    <BrickVoteBar
                                        brickId={brick.id}
                                        voteStatus={voteStatus}
                                        onShowUpvoters={() => setShowUpvoters(true)}
                                    />
                                    <ShareButton brickId={brick.id} />
                                    <span className="text-[10px] text-muted-foreground/50 font-mono ml-auto">
                                        {brick._count.votes} {tc('votes')} {'·'}{' '}
                                        {brick._count.comments} {tc('comments')}
                                    </span>
                                </div>

                                {/* Interactive Map */}
                                {brick.latitude != null && brick.longitude != null && (
                                    <div className="border border-primary/20 rounded-lg overflow-hidden">
                                        <div className="flex items-center gap-2 px-3 py-2 border-b border-primary/10">
                                            <MapPin className="size-3.5 text-primary" />
                                            <h3 className="text-[10px] font-bold uppercase tracking-widest">
                                                {t('location')}
                                            </h3>
                                        </div>
                                        <div className="relative w-full h-44">
                                            <Map
                                                center={[brick.longitude, brick.latitude]}
                                                zoom={13}
                                                theme="dark"
                                                attributionControl={false}
                                                dragPan
                                                scrollZoom
                                                dragRotate={false}
                                                touchZoomRotate
                                            >
                                                <MapMarker
                                                    longitude={brick.longitude}
                                                    latitude={brick.latitude}
                                                >
                                                    <MarkerContent>
                                                        <div className="size-4 rounded-full bg-primary shadow-[0_0_12px_rgba(0,238,255,0.5)] flex items-center justify-center">
                                                            <div className="size-1.5 rounded-full bg-background" />
                                                        </div>
                                                    </MarkerContent>
                                                </MapMarker>
                                                <MapControls position="bottom-right" showZoom />
                                            </Map>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Comments — stacked below media on mobile */}
                            <div className="flex-1 min-h-75 border-t border-primary/10">
                                <CommentSection
                                    brickId={brick.id}
                                    totalComments={brick._count.comments}
                                    currentUserId={currentUserId}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Brick upvoters modal */}
            <UpvotersModal
                isOpen={showUpvoters}
                onClose={() => setShowUpvoters(false)}
                targetId={brickId ?? ''}
                type="brick"
            />
        </div>
    );
}
