'use client';

import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { Artist } from '@/components/trending';
import CircularGallery, { GalleryItem } from '@/components/react-bits/CircularGallery';

interface RisingArtistsProps {
    artists: Artist[];
    onViewAll?: () => void;
}

export function RisingArtists({ artists, onViewAll }: RisingArtistsProps) {
    const router = useRouter();

    // Transform artists to CircularGallery format
    const galleryItems: GalleryItem[] = artists.map((artist) => ({
        image: artist.avatar,
        text: `${artist.username} • ${artist.brixCount} BRIX`,
        url: `/dashboard/artist/${artist.id}`,
    }));

    const handleItemClick = (item: GalleryItem) => {
        if (item.url) {
            router.push(item.url);
        }
    };

    return (
        <section className="mb-12">
            <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="flex items-center gap-2 text-lg font-bold text-foreground uppercase tracking-widest">
                    <span className="size-2 rounded-full bg-primary animate-pulse" />
                    Rising Artists
                </h3>
                <button
                    onClick={onViewAll}
                    className="text-primary text-xs font-bold uppercase hover:underline flex items-center gap-1"
                >
                    View All
                    <ChevronRight className="size-3" />
                </button>
            </div>
            <div className="h-80 -mx-8">
                <CircularGallery
                    items={galleryItems}
                    bend={2}
                    textColor="#00eeff"
                    borderRadius={0.5}
                    font="bold 16px 'Space Grotesk', sans-serif"
                    scrollSpeed={1.5}
                    scrollEase={0.06}
                    onItemClick={handleItemClick}
                />
            </div>
        </section>
    );
}
