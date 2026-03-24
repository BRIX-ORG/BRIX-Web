'use client';

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { Loader2, Share2 } from 'lucide-react';
import { BrixBrandLogo } from '@/components/shared';
import { useGetAlbumById } from '@/hooks/apis/album.api';
import { useToast } from '@/hooks/useToast';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

// Dynamic imports to avoid SSR issues
const InfiniteMenu = dynamic(() => import('@/components/react-bits/InfiniteMenu'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center">
            <div className="size-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    ),
});

const LiquidEther = dynamic(() => import('@/components/react-bits/LiquidEther'), {
    ssr: false,
});

export default function AlbumViewPage() {
    const params = useParams();
    const albumId = params.id as string;

    const { data: album, isLoading, error } = useGetAlbumById(albumId);
    const { success } = useToast();
    const t = useTranslations('album');
    const [copied, setCopied] = useState(false);

    // Map album items to InfiniteMenu format
    const menuItems = useMemo(() => {
        if (!album?.items?.length) return [];
        return album.items.map((item) => ({
            image: item.image.url,
            link: '#',
            title: item.title || '',
            description: item.description || '',
        }));
    }, [album]);

    // Custom LiquidEther colors based on album theme
    const etherColors = useMemo(() => {
        if (album?.background && album.background.length === 3) {
            return album.background as [string, string, string];
        }
        return ['#e2cbff', '#bc00ff', '#00eeff'] as [string, string, string];
    }, [album]);

    const handleShare = async () => {
        try {
            const url = window.location.href;
            await navigator.clipboard.writeText(url);
            setCopied(true);
            success(t('successShare'));
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy link:', err);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen w-full bg-brix-bg-dark flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="size-8 text-primary animate-spin" />
                    <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                        {t('loading')}...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !album) {
        return (
            <div className="min-h-screen w-full bg-brix-bg-dark flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center px-6">
                    <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center">
                        <span className="text-2xl">📸</span>
                    </div>
                    <h2 className="text-lg font-bold text-foreground">{t('notFound')}</h2>
                    <p className="text-sm text-muted-foreground max-w-xs">{t('notFoundDesc')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            {/* LiquidEther Background */}
            <div className="absolute inset-0 z-0">
                <LiquidEther
                    colors={etherColors}
                    mouseForce={20}
                    cursorSize={100}
                    isViscous
                    viscous={30}
                    iterationsViscous={32}
                    iterationsPoisson={32}
                    resolution={0.5}
                    isBounce={false}
                    autoDemo
                    autoSpeed={0.5}
                    autoIntensity={2.2}
                    takeoverDuration={0.25}
                    autoResumeDelay={3000}
                    autoRampDuration={0.6}
                />
            </div>

            {/* Header — BRIX Logo + Share Button */}
            <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
                <BrixBrandLogo size="sm" animated href={undefined} />
                <button
                    onClick={handleShare}
                    className="group flex items-center gap-2 px-4 py-2 bg-background/30 backdrop-blur-md border border-border/50 rounded-full text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary hover:border-primary/40 transition-all cursor-pointer"
                >
                    <Share2
                        className={`size-3.5 transition-transform ${copied ? 'scale-0' : 'scale-100'}`}
                    />
                    <div className="absolute left-4">
                        {copied && (
                            <div className="size-3.5 bg-green-500 rounded-full flex items-center justify-center animate-in zoom-in duration-200">
                                <span className="text-[8px] text-white">✓</span>
                            </div>
                        )}
                    </div>
                    <span className="ml-0.5">{copied ? t('copied') : t('share')}</span>
                </button>
            </header>

            {/* Album Title Overlay */}
            <div className="fixed top-24 left-6 z-40 max-w-sm">
                <h1
                    className="font-display text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-2"
                    style={{ color: album.titleColor || undefined }}
                >
                    {album.name}
                </h1>
                {album.description && (
                    <p
                        className="text-sm font-mono"
                        style={{
                            color: album.descriptionColor || undefined,
                            opacity: album.descriptionColor ? 1 : 0.7,
                        }}
                    >
                        {album.description}
                    </p>
                )}
                <p className="text-xs text-muted-foreground font-mono mt-2">
                    {t('explore')} • {t('photos', { count: album.items.length })}
                </p>
            </div>

            {/* InfiniteMenu */}
            <div className="relative z-10 h-screen w-full">
                <InfiniteMenu
                    items={menuItems}
                    scale={1.1}
                    titleColor={album.titleColor || undefined}
                    descriptionColor={album.descriptionColor || undefined}
                />
            </div>

            {/* Bottom Branding */}
            <div className="fixed bottom-6 left-6 right-6 z-40 hidden md:flex items-end justify-between pointer-events-none">
                <div className="bg-background/30 backdrop-blur-md border border-border/50 p-4 pointer-events-auto">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
                        {t('poweredBy')}
                    </p>
                    <span className="text-xs font-mono text-primary">BRIX ALBUM</span>
                </div>

                <div className="bg-background/30 backdrop-blur-md border border-border/50 p-4 text-right pointer-events-auto">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
                        {t('items', { count: '' }).split(' ')[0]}
                    </p>
                    <span className="text-xs font-mono text-primary">
                        {t('items', { count: album.items.length })}
                    </span>
                </div>
            </div>
        </div>
    );
}
