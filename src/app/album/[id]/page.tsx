'use client';

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { BrixBrandLogo } from '@/components/shared';
import { useGetAlbumById } from '@/hooks/apis/album.api';

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
        if (album?.backgroundColor) {
            return [album.backgroundColor, '#bc00ff', '#00eeff'];
        }
        return ['#e2cbff', '#bc00ff', '#00eeff'];
    }, [album]);

    if (isLoading) {
        return (
            <div className="min-h-screen w-full bg-brix-bg-dark flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="size-8 text-primary animate-spin" />
                    <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                        Loading Album...
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
                    <h2 className="text-lg font-bold text-foreground">Album Not Found</h2>
                    <p className="text-sm text-muted-foreground max-w-xs">
                        This album may have been deleted or the link is invalid.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="relative min-h-screen w-full overflow-hidden"
            style={{ backgroundColor: album.backgroundColor || '#0a0a0a' }}
        >
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

            {/* Header — Only BRIX Logo */}
            <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
                <BrixBrandLogo size="sm" animated href={undefined} />
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
                    Drag to explore • {album.items.length} photos
                </p>
            </div>

            {/* InfiniteMenu */}
            <div className="relative z-10 h-screen w-full">
                <InfiniteMenu items={menuItems} scale={1.1} />
            </div>

            {/* Bottom Branding */}
            <div className="fixed bottom-6 left-6 right-6 z-40 flex items-end justify-between pointer-events-none">
                <div className="bg-background/30 backdrop-blur-md border border-border/50 p-4 pointer-events-auto">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
                        POWERED BY
                    </p>
                    <span className="text-xs font-mono text-primary">BRIX ALBUM</span>
                </div>

                <div className="bg-background/30 backdrop-blur-md border border-border/50 p-4 text-right pointer-events-auto">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
                        PHOTOS
                    </p>
                    <span className="text-xs font-mono text-primary">
                        {album.items.length} ITEMS
                    </span>
                </div>
            </div>
        </div>
    );
}
