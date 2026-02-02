import Image from 'next/image';
import { Coins, Share2, Zap } from 'lucide-react';
import { cn } from '@/types/utils';

export interface TrendingItem {
    id: string;
    title: string;
    imageUrl: string;
    artist?: string;
    brixCount: string;
    shares?: number;
    verifiedAt?: string | null;
    size?: 'default' | 'large' | 'wide';
}

interface BentoItemProps {
    item: TrendingItem;
    onClick?: () => void;
}

export function BentoItem({ item, onClick }: BentoItemProps) {
    const sizeClasses = {
        default: '',
        large: 'col-span-2 row-span-2',
        wide: 'col-span-2',
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                'group relative overflow-hidden rounded-xl border border-border bg-muted hover:border-primary transition-all duration-500 cursor-pointer',
                sizeClasses[item.size || 'default'],
            )}
        >
            {/* Background Image */}
            <div className="absolute inset-0">
                <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-background/90 via-transparent to-transparent" />

            {/* Verified Badge */}
            {item.verifiedAt && (
                <div className="absolute top-4 left-4">
                    <span className="bg-primary/90 text-primary-foreground text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tighter">
                        Verified Authentic
                    </span>
                </div>
            )}

            {/* Content */}
            <div className="absolute bottom-4 left-4 right-4">
                {item.size === 'large' ? (
                    <>
                        <h4 className="text-2xl font-bold leading-tight mb-2">{item.title}</h4>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-primary">
                                <Coins className="size-5" />
                                <span className="text-sm font-bold">{item.brixCount} BRIX</span>
                            </div>
                            {item.shares && (
                                <div className="flex items-center gap-1.5 text-foreground/70">
                                    <Share2 className="size-5" />
                                    <span className="text-sm">{item.shares}</span>
                                </div>
                            )}
                        </div>
                    </>
                ) : item.size === 'wide' ? (
                    <div className="flex justify-between items-end w-full">
                        <div>
                            <h4 className="text-lg font-bold leading-tight">{item.title}</h4>
                            {item.artist && (
                                <p className="text-xs text-muted-foreground">
                                    Captured by {item.artist}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 text-secondary">
                            <Zap className="size-5" />
                            <span className="text-sm font-black">{item.brixCount} BRIX</span>
                        </div>
                    </div>
                ) : (
                    <>
                        {item.artist && (
                            <p className="text-xs font-bold text-foreground/90">{item.artist}</p>
                        )}
                        <p className="text-primary text-[10px] font-bold">{item.brixCount} BRIX</p>
                    </>
                )}
            </div>
        </div>
    );
}
