import type { UserBrickStats } from '@/types/brick.types';
import { motion } from 'motion/react';
import { Activity, Coins, ShieldCheck, Box } from 'lucide-react';
import type { ComponentType } from 'react';
import { cn } from '@/utils/classnames';

interface StatConfig {
    id: string;
    label: string;
    value: string | number;
    subtext: string;
    icon: ComponentType<{ className?: string }>;
    accentClassName: string;
}

export function RealtimeStatsRow({ stats }: { stats?: UserBrickStats }) {
    const data: StatConfig[] = [
        {
            id: 'realtime-assets',
            label: 'Total Realtime',
            value: (stats?.bricksByTagType?.REALTIME || 0).toLocaleString(),
            subtext: 'Assets captured in realtime',
            icon: Activity,
            accentClassName: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
        },
        {
            id: 'revenue',
            label: 'Revenue Generated',
            value: `${stats?.totalDonationsReceived || '0.0'} POL`,
            subtext: 'Across all assets',
            icon: Coins,
            accentClassName:
                'text-amber-500 bg-amber-500/10 border-amber-500/30 glow-cyan' /* Custom glow */,
        },
        {
            id: 'onchain',
            label: 'Blockchain Verified',
            value: (stats?.onchainBricks || 0).toLocaleString(),
            subtext: 'Minted on Polygon',
            icon: ShieldCheck,
            accentClassName: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
        },
        {
            id: 'ipfs',
            label: 'IPFS Stored',
            value: (stats?.ipfsBricksUploaded || 0).toLocaleString(),
            subtext: 'Decentralized storage',
            icon: Box,
            accentClassName: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/30',
        },
    ];

    return (
        <motion.section
            initial="hidden"
            animate="show"
            variants={{
                show: {
                    transition: { staggerChildren: 0.1 },
                },
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        >
            {data.map((item) => {
                const Icon = item.icon;
                return (
                    <motion.div
                        key={item.id}
                        variants={{
                            hidden: { opacity: 0, y: 15, scale: 0.98 },
                            show: {
                                opacity: 1,
                                y: 0,
                                scale: 1,
                                transition: { type: 'spring', stiffness: 350, damping: 25 },
                            },
                        }}
                        className={cn(
                            'relative p-6 rounded-[2rem] overflow-hidden group transition-all duration-500',
                            'bg-background/40 backdrop-blur-2xl border border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.12)]',
                            'hover:border-white/10 hover:shadow-[0_8px_30px_rgba(0,238,255,0.08)] hover:-translate-y-1',
                        )}
                    >
                        {/* Shimmer overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 translate-x-[-100%] group-hover:translate-x-[100%] ease-in-out" />

                        {/* Subtle background glow */}
                        <div className="absolute -top-12 -right-12 size-36 rounded-full bg-muted/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl" />

                        <div className="flex flex-col h-full relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground/80 transition-colors">
                                    {item.label}
                                </p>
                                <div className={`p-2.5 rounded-2xl border ${item.accentClassName}`}>
                                    <Icon className="size-4" />
                                </div>
                            </div>

                            <p className="text-2xl md:text-3xl xl:text-4xl font-mono tracking-tighter font-bold text-foreground drop-shadow-md truncate">
                                {item.value}
                            </p>

                            <p className="mt-2 text-[10px] font-mono text-muted-foreground/60 tracking-wider uppercase">
                                {item.subtext}
                            </p>
                        </div>
                    </motion.div>
                );
            })}
        </motion.section>
    );
}
