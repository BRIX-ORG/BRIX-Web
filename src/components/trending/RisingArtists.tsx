'use client';

import { ChevronRight } from 'lucide-react';
import { ArtistCard, Artist } from './ArtistCard';

interface RisingArtistsProps {
    artists: Artist[];
    onViewAll?: () => void;
}

export function RisingArtists({ artists, onViewAll }: RisingArtistsProps) {
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
            <div className="flex overflow-x-auto gap-8 pb-4 scrollbar-hide">
                {artists.map((artist) => (
                    <ArtistCard key={artist.id} artist={artist} />
                ))}
            </div>
        </section>
    );
}
