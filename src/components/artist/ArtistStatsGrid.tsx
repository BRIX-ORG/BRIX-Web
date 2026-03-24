import type { UserBrickStats } from '@/types/brick.types';
import { Layers, ShieldCheck, HeartPulse } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ArtistStatsGridProps {
    stats?: UserBrickStats | null;
}

export function ArtistStatsGrid({ stats }: ArtistStatsGridProps) {
    const t = useTranslations('artist.stats');

    return (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Box 1: Digital Assets Issued */}
            <div className="relative p-6 rounded-2xl bg-muted/30 border border-primary/10 hover:border-primary/30 transition-all duration-500 group overflow-hidden hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.15)] hover:-translate-y-1">
                {/* Glow Background */}
                <div className="absolute top-0 right-0 p-16 -mr-8 -mt-8 rounded-full bg-primary/5 group-hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-all duration-700 blur-3xl" />

                <div className="flex justify-between items-start mb-6 relative z-10">
                    <p className="text-[10px] sm:text-xs font-mono text-primary/80 uppercase tracking-widest font-semibold flex items-center gap-2">
                        <Layers className="size-4 text-primary" />
                        {t('assetsIssued')}
                    </p>
                </div>

                <div className="flex flex-col gap-2 relative z-10">
                    <p className="text-4xl sm:text-5xl font-bold tracking-tighter bg-gradient-to-br from-foreground to-foreground/40 bg-clip-text text-transparent drop-shadow-sm">
                        {(stats?.totalBricksUploaded || 0).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-mono text-primary font-medium tracking-wider">
                            {t('ipfs')}
                        </span>
                        <span className="text-[11px] sm:text-xs font-mono text-muted-foreground font-semibold">
                            {stats?.ipfsBricksUploaded || 0} {t('assetsStored')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Box 2: Blockchain Validated */}
            <div className="relative p-6 rounded-2xl bg-muted/30 border border-secondary/10 hover:border-secondary/30 transition-all duration-500 group overflow-hidden hover:shadow-[0_0_30px_-5px_hsl(var(--secondary)/0.15)] hover:-translate-y-1 md:translate-y-2 md:hover:translate-y-1">
                <div className="absolute top-0 right-0 p-16 -mr-8 -mt-8 rounded-full bg-secondary/5 group-hover:bg-secondary/10 opacity-0 group-hover:opacity-100 transition-all duration-700 blur-3xl" />

                <div className="flex justify-between items-start mb-6 relative z-10">
                    <p className="text-[10px] sm:text-xs font-mono text-secondary/80 uppercase tracking-widest font-semibold flex items-center gap-2">
                        <ShieldCheck className="size-4 text-secondary" />
                        {t('blockchainValidated')}
                    </p>
                </div>

                <div className="flex flex-col gap-2 relative z-10">
                    <p className="text-4xl sm:text-5xl font-bold tracking-tighter bg-gradient-to-br from-foreground to-foreground/40 bg-clip-text text-transparent drop-shadow-sm">
                        {(stats?.onchainBricks || 0).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 rounded-full bg-secondary/10 border border-secondary/20 text-[10px] font-mono text-secondary font-medium tracking-wider">
                            {t('onChain')}
                        </span>
                        <span className="text-[11px] sm:text-xs font-mono text-muted-foreground font-semibold">
                            {t('metadataVerified')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Box 3: Community Support */}
            <div className="relative p-6 rounded-2xl bg-muted/30 border border-primary/10 hover:border-primary/30 transition-all duration-500 group overflow-hidden hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.15)] hover:-translate-y-1">
                <div className="absolute top-0 right-0 p-16 -mr-8 -mt-8 rounded-full bg-primary/5 group-hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-all duration-700 blur-3xl" />

                <div className="flex justify-between items-start mb-6 relative z-10">
                    <p className="text-[10px] sm:text-xs font-mono text-primary/80 uppercase tracking-widest font-semibold flex items-center gap-2">
                        <HeartPulse className="size-4 text-primary" />
                        {t('communitySupport')}
                    </p>
                </div>

                <div className="flex flex-col gap-2 relative z-10">
                    <div className="flex items-baseline gap-2">
                        <p className="text-4xl sm:text-5xl font-bold tracking-tighter bg-gradient-to-br from-foreground to-foreground/40 bg-clip-text text-transparent drop-shadow-sm">
                            {(stats?.totalUpvotes || 0).toLocaleString()}
                        </p>
                        <span className="text-sm font-semibold text-muted-foreground/60 tracking-wider uppercase font-mono">
                            {t('votes')}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-mono text-primary font-medium tracking-wider">
                            {t('support')}
                        </span>
                        <span className="text-[11px] sm:text-xs font-mono text-muted-foreground font-semibold">
                            {t('polReceived', {
                                amount: (stats?.totalDonationsReceived || 0).toLocaleString(),
                            })}
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
