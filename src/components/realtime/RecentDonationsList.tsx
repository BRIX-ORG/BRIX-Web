import { useTranslations } from 'next-intl';
import type { BrickDonation } from '@/types/brick.types';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowDownLeft, ExternalLink, Info } from 'lucide-react';
import { timeAgo } from '@/utils/time';
import { cn } from '@/utils/classnames';

interface RecentDonationsListProps {
    donations: BrickDonation[];
    onLoadMore: () => void;
    hasMore: boolean;
}

export function RecentDonationsList({ donations, onLoadMore, hasMore }: RecentDonationsListProps) {
    const t = useTranslations('realtime');
    return (
        <div
            className={cn(
                'flex flex-col overflow-hidden h-full lg:max-h-[calc(100vh-10rem)]',
                'bg-background/40 backdrop-blur-2xl border border-white/5 rounded-[2rem]',
                'shadow-[0_8px_30px_rgb(0,0,0,0.12)]',
            )}
        >
            <div className="flex flex-col gap-1 p-6 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent shrink-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="relative flex size-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
                    </span>
                    <h3 className="text-sm font-bold tracking-[0.2em] uppercase text-foreground">
                        {t('donations.title')}
                    </h3>
                </div>
                <p className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground/60">
                    {t('donations.subtext')}
                </p>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-6">
                <AnimatePresence mode="popLayout">
                    {donations.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-10 text-center gap-3"
                        >
                            <div className="p-4 rounded-full bg-muted/30 border border-white/5 shadow-inner">
                                <Info className="size-6 text-muted-foreground/50" />
                            </div>
                            <p className="text-sm text-foreground/80 font-bold tracking-widest uppercase">
                                {t('donations.empty.title')}
                            </p>
                            <p className="text-[10px] font-mono text-muted-foreground/50 max-w-[20ch]">
                                {t('donations.empty.description')}
                            </p>
                        </motion.div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {donations.map((donation, i) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 300,
                                        damping: 25,
                                        delay: i * 0.05,
                                    }}
                                    key={donation.id}
                                    className="flex items-center gap-4 group cursor-default"
                                >
                                    {/* Icon Indicator */}
                                    <div className="flex items-center justify-center size-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 shrink-0 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300">
                                        <ArrowDownLeft className="size-4 text-emerald-500" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-sm font-bold font-mono truncate text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                                                +{donation.amount} POL
                                            </span>
                                            <span className="text-[9px] text-muted-foreground/60 tracking-widest uppercase font-mono whitespace-nowrap">
                                                {timeAgo(donation.createdAt)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-4 mt-1">
                                            <span className="text-[10px] text-muted-foreground/80 font-mono tracking-wider truncate w-24">
                                                {donation.fromAddress.slice(0, 6)}...
                                                {donation.fromAddress.slice(-4)}
                                            </span>
                                            <a
                                                href={`https://amoy.polygonscan.com/tx/${donation.txHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-emerald-400 shrink-0"
                                            >
                                                <ExternalLink className="size-3.5 cursor-pointer" />
                                            </a>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>

                {hasMore && (
                    <motion.button
                        layout
                        onClick={onLoadMore}
                        className="w-full py-3.5 mt-8 border border-white/5 rounded-xl bg-muted/20 hover:bg-muted/40 hover:border-white/10 text-[10px] tracking-[0.2em] uppercase font-bold text-muted-foreground hover:text-foreground transition-all duration-300"
                    >
                        {t('donations.loadPrevious')}
                    </motion.button>
                )}
            </div>
        </div>
    );
}
