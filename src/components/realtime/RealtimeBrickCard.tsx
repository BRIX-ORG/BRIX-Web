import { useTranslations } from 'next-intl';
import type { RealtimeBrick } from '@/types/brick.types';
import { motion } from 'motion/react';
import { Coins, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/utils/classnames';
import { timeAgo } from '@/utils/time';
import { formatCoord, generateHash } from '@/utils/brick';

interface RealtimeBrickCardProps {
    brick: RealtimeBrick;
    index: number;
    onClick?: () => void;
}

export function RealtimeBrickCard({ brick, index, onClick }: RealtimeBrickCardProps) {
    const t = useTranslations('realtime');
    const tc = useTranslations('common');
    const imageUrl = brick.watermark?.url || brick.media?.url;
    const hash = generateHash(brick.title);

    let rawStatus = brick.metadata?.onChainStatus;
    const modelData = brick.metadata?.modelData as Record<string, unknown> | undefined;

    if (modelData?.qr_status === 'failed') {
        rawStatus = 'failed';
    } else if (!rawStatus) {
        rawStatus = 'captured';
    }

    let statusDisplay = '';
    let statusColor = '';
    let statusBgIndicator = '';
    let isBreathing = false;

    if (rawStatus === 'onchain') {
        statusDisplay = t('status.onchain');
        statusColor = 'text-emerald-500';
        statusBgIndicator = 'bg-emerald-500';
    } else if (rawStatus === 'ipfs_uploaded') {
        statusDisplay = t('status.ipfs_uploaded');
        statusColor = 'text-blue-500';
        statusBgIndicator = 'bg-blue-500';
    } else if (rawStatus === 'failed') {
        statusDisplay = t('status.failed');
        statusColor = 'text-rose-500';
        statusBgIndicator = 'bg-rose-500';
    } else if (rawStatus === 'pending') {
        statusDisplay = t('status.pending');
        statusColor = 'text-purple-500';
        statusBgIndicator = 'bg-purple-500';
        isBreathing = true;
    } else {
        statusDisplay = t('status.captured');
        statusColor = 'text-amber-500';
        statusBgIndicator = 'bg-amber-500';
        isBreathing = true;
    }

    let revenueDisplay = (
        <p className="text-[11px] font-bold font-mono text-amber-500">
            {brick.totalRevenue || '0.00'} POL
        </p>
    );

    if (rawStatus === 'failed') {
        revenueDisplay = (
            <p className="text-[9px] font-bold text-rose-500/80 uppercase tracking-wider">
                {t('revenueStatus.failed')}
            </p>
        );
    } else if (rawStatus === 'captured') {
        revenueDisplay = (
            <p className="text-[9px] font-bold text-amber-500/80 uppercase tracking-wider">
                {t('revenueStatus.captured')}
            </p>
        );
    } else if (rawStatus === 'ipfs_uploaded') {
        revenueDisplay = (
            <p className="text-[9px] font-bold text-blue-500/80 uppercase tracking-wider">
                {t('revenueStatus.ipfs_uploaded')}
            </p>
        );
    } else if (rawStatus === 'pending') {
        revenueDisplay = (
            <p className="text-[9px] font-bold text-purple-500/80 uppercase tracking-wider animate-pulse">
                {t('revenueStatus.pending')}
            </p>
        );
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{
                type: 'spring',
                stiffness: 300,
                damping: 24,
                delay: Math.min(index * 0.05, 0.3),
            }}
            onClick={onClick}
            className={cn(
                'bg-muted/30 border border-border flex flex-col overflow-hidden rounded-xl h-full',
                'cursor-pointer group hover:-translate-y-1 transition-transform duration-300',
            )}
        >
            {/* Outer Header: Status info */}
            <div className="p-3 border-b border-border/50 flex items-center justify-between bg-background/50">
                <div className="flex items-center gap-2">
                    <div className="relative flex items-center justify-center size-2">
                        {isBreathing && (
                            <span
                                className={cn(
                                    'absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping',
                                    statusBgIndicator,
                                )}
                            />
                        )}
                        <span
                            className={cn(
                                'relative inline-flex rounded-full size-2',
                                statusBgIndicator,
                            )}
                        />
                    </div>
                    <h2
                        className={cn(
                            'text-[10px] font-bold tracking-[0.15em] uppercase',
                            statusColor,
                        )}
                    >
                        {statusDisplay}
                    </h2>
                </div>
                <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest truncate max-w-[80px]">
                    {hash.slice(0, 8)}
                </span>
            </div>

            {/* Inner Frame */}
            <div className="flex-1 p-3 flex flex-col">
                <div
                    className={cn(
                        'w-full flex-1 bg-background/95 border rounded-lg overflow-hidden transition-all duration-500 flex flex-col',
                        'border-primary/20 shadow-[0_0_20px_rgba(0,238,255,0.03)] group-hover:border-primary/40 group-hover:shadow-[0_0_40px_rgba(0,238,255,0.12)]',
                    )}
                >
                    {/* Image Sandbox */}
                    <div className="p-1 shrink-0">
                        <div className="relative aspect-4/3 w-full bg-primary/5 rounded-sm overflow-hidden border border-primary/10">
                            {imageUrl ? (
                                <>
                                    <Image
                                        src={imageUrl}
                                        alt={brick.title || t('defaultAssetTitle')}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"
                                        unoptimized
                                    />
                                    <div className="absolute top-2 right-2 bg-secondary/90 text-secondary-foreground px-2 py-0.5 text-[9px] font-bold rounded shadow-sm tracking-widest uppercase">
                                        {brick.tagType} BRIX
                                    </div>
                                    <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-md text-foreground px-2 py-0.5 text-[9px] font-bold font-mono rounded shadow-sm border border-border/50">
                                        {brick.isPublic ? tc('public') : tc('private')}
                                    </div>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                                    <div className="size-12 border border-dashed border-primary/20 flex items-center justify-center rounded bg-primary/5">
                                        <ImageIcon className="size-5 text-primary/30" />
                                    </div>
                                    <span className="text-[9px] text-primary/40 uppercase tracking-widest font-mono">
                                        {t('card.noContent')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Metadata Box */}
                    <div className="p-3 space-y-3 flex-1 flex flex-col">
                        <div>
                            <div className="flex justify-between items-start mb-1 gap-2">
                                <h3 className="text-xs font-bold tracking-tight text-foreground uppercase truncate flex-1 group-hover:text-primary transition-colors">
                                    {brick.title || (
                                        <span className="text-muted-foreground/50 italic normal-case font-normal">
                                            {t('card.untitled')}
                                        </span>
                                    )}
                                </h3>
                                <span className="text-[9px] text-primary/60 font-mono shrink-0 pt-0.5">
                                    {timeAgo(brick.createdAt)}
                                </span>
                            </div>
                            {brick.description && (
                                <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">
                                    {brick.description}
                                </p>
                            )}
                        </div>

                        {/* Revenue & Coordinates */}
                        <div className="mt-auto space-y-2">
                            <div className="grid grid-cols-2 gap-1.5">
                                <div className="bg-primary/5 border border-primary/10 p-1.5 rounded">
                                    <p className="text-[8px] text-primary/50 uppercase font-bold mb-0.5">
                                        {tc('latitude')}
                                    </p>
                                    <p className="text-[9px] font-mono text-foreground truncate">
                                        {formatCoord(brick.latitude, 'N', 'S')}
                                    </p>
                                </div>
                                <div className="bg-primary/5 border border-primary/10 p-1.5 rounded">
                                    <p className="text-[8px] text-primary/50 uppercase font-bold mb-0.5">
                                        {tc('longitude')}
                                    </p>
                                    <p className="text-[9px] font-mono text-foreground truncate">
                                        {formatCoord(brick.longitude, 'E', 'W')}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-amber-500/5 border border-amber-500/20 p-2 rounded flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-amber-500/80">
                                    <Coins className="size-3.5" />
                                    <span className="text-[9px] uppercase font-bold tracking-widest">
                                        {tc('revenue')}
                                    </span>
                                </div>
                                {revenueDisplay}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
