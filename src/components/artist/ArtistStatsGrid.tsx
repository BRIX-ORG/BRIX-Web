export interface ArtistStats {
    digitalAssets: number;
    assetsGrowth: string;
    validated: number;
    rank: number;
    rankPercentile: string;
}

interface ArtistStatsGridProps {
    stats: ArtistStats;
}

export function ArtistStatsGrid({ stats }: ArtistStatsGridProps) {
    return (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-muted border border-primary/10 p-6 rounded-xl flex flex-col gap-1 relative overflow-hidden group">
                <p className="text-[10px] font-mono text-primary/60 uppercase tracking-widest">
                    Digital Assets Issued
                </p>
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold tracking-tighter">
                        {stats.digitalAssets.toLocaleString()}
                    </p>
                    <p className="text-xs font-mono text-primary">{stats.assetsGrowth}</p>
                </div>
                <p className="text-[10px] font-mono text-muted-foreground uppercase">
                    Total Bricks Platform-Wide
                </p>
            </div>
            <div className="bg-muted border border-primary/10 p-6 rounded-xl flex flex-col gap-1 relative overflow-hidden group">
                <p className="text-[10px] font-mono text-primary/60 uppercase tracking-widest">
                    Blockchain Validated
                </p>
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold tracking-tighter">
                        {stats.validated.toLocaleString()}
                    </p>
                    <p className="text-xs font-mono text-primary">On-Chain</p>
                </div>
                <p className="text-[10px] font-mono text-muted-foreground uppercase">
                    Metadata Verified Records
                </p>
            </div>
            <div className="bg-muted border border-primary/10 p-6 rounded-xl flex flex-col gap-1 relative overflow-hidden group">
                <p className="text-[10px] font-mono text-primary/60 uppercase tracking-widest">
                    Network Hierarchy
                </p>
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold tracking-tighter">#{stats.rank}</p>
                    <p className="text-xs font-mono text-primary">{stats.rankPercentile}</p>
                </div>
                <p className="text-[10px] font-mono text-muted-foreground uppercase">
                    Global Reputation Rank
                </p>
            </div>
        </section>
    );
}
