'use client';

import { useTranslations } from 'next-intl';
import { ExternalLink } from 'lucide-react';
import type { BrickDonation } from '@/types/brick.types';
import { formatDateTime } from '@/utils/time';

interface DonationListProps {
    donations: BrickDonation[];
}

export function DonationList({ donations }: DonationListProps) {
    const t = useTranslations('onchain.donation');
    if (donations.length === 0) return null;

    return (
        <div className="space-y-2">
            <p className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                {t('recentHeader')}
            </p>
            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                {donations.map((donation) => (
                    <div
                        key={donation.id}
                        className="group flex items-center justify-between rounded-lg border border-primary/10 bg-primary/5 p-2 transition-colors hover:bg-primary/10"
                    >
                        <div className="min-w-0">
                            <p className="text-[10px] font-mono text-primary truncate max-w-[120px]">
                                {donation.fromAddress.slice(0, 6)}...
                                {donation.fromAddress.slice(-4)}
                            </p>
                            <p className="text-[8px] text-muted-foreground">
                                {formatDateTime(donation.createdAt)}
                            </p>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-[11px] font-bold text-foreground">
                                {parseFloat(Number(donation.amount).toFixed(4))} POL
                            </p>
                            <a
                                href={`https://amoy.polygonscan.com/tx/${donation.txHash}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[8px] text-primary/60 hover:text-primary flex items-center gap-0.5 justify-end mt-0.5 transition-colors"
                            >
                                {t('explorer')} <ExternalLink className="size-2" />
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
