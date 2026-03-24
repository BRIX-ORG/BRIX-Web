import Image from 'next/image';
import { BadgeCheck, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/utils/classnames';

export interface Artist {
    id: string;
    username: string;
    avatar: string;
    brixCount: string;
    verifiedAt?: string | null;
    isRising?: boolean;
}

interface ArtistCardProps {
    artist: Artist;
    onClick?: () => void;
}

export function ArtistCard({ artist, onClick }: ArtistCardProps) {
    const t = useTranslations('search'); // Use 'search' namespace for common 'card' keys
    return (
        <div
            onClick={onClick}
            className="flex flex-col items-center gap-3 min-w-30 group cursor-pointer"
        >
            <div
                className={cn(
                    'relative p-1 rounded-full border-2 transition-all duration-500',
                    'border-primary/10 group-hover:border-primary',
                )}
            >
                <Image
                    src={artist.avatar}
                    alt={`Avatar for ${artist.username}`}
                    width={96}
                    height={96}
                    className="size-24 rounded-full object-cover border-2 border-background"
                />
                {artist.verifiedAt && (
                    <div className="absolute bottom-1 right-1 bg-primary text-primary-foreground rounded-full p-1 border-2 border-background">
                        <BadgeCheck className="size-3" />
                    </div>
                )}
                {artist.isRising && !artist.verifiedAt && (
                    <div className="absolute bottom-1 right-1 bg-secondary text-secondary-foreground rounded-full p-1 border-2 border-background">
                        <Sparkles className="size-3" />
                    </div>
                )}
            </div>
            <div className="text-center">
                <p className="text-foreground text-sm font-bold tracking-tight">
                    {artist.username}
                </p>
                <p className="text-primary text-[10px] font-black uppercase tracking-widest">
                    {artist.brixCount} {t('card.brick')}
                </p>
            </div>
        </div>
    );
}
