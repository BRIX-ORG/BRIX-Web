'use client';

import { useTranslations } from 'next-intl';
import { Loader2, AlertCircle } from 'lucide-react';
import type { BrickDonation } from '@/types/brick.types';
import { DonationList } from '@/components/brick-detail';

interface DonationSectionProps {
    isConnected: boolean;
    isDonating: boolean;
    donateAmount: string;
    onDonateAmountChange: (value: string) => void;
    onDonate: () => void;
    donations: BrickDonation[];
    isLoadingDonations: boolean;
}

export function DonationSection({
    isConnected,
    isDonating,
    donateAmount,
    onDonateAmountChange,
    onDonate,
    donations,
    isLoadingDonations,
}: DonationSectionProps) {
    const t = useTranslations('onchain.donation');
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Input Section (Only for connected users) */}
            <div className="space-y-3">
                <label className="text-[10px] font-bold text-foreground uppercase tracking-widest block px-1">
                    {t('title')}
                </label>
                {isConnected ? (
                    <div className="flex gap-2">
                        <div className="relative flex-1 group">
                            <input
                                type="number"
                                min="0.001"
                                step="0.001"
                                placeholder="Amount (POL)"
                                value={donateAmount}
                                onChange={(e) => onDonateAmountChange(e.target.value)}
                                className="w-full bg-background border border-primary/20 rounded-lg px-3 py-2 text-xs text-foreground font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-muted-foreground group-focus-within:text-primary transition-colors">
                                POL
                            </div>
                        </div>
                        <button
                            onClick={onDonate}
                            disabled={isDonating || !donateAmount}
                            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/10 transition-all hover:brightness-110 disabled:opacity-50"
                        >
                            {isDonating ? (
                                <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                                t('button')
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 p-3 bg-muted/30 border border-border rounded-lg group hover:border-primary/20 transition-colors">
                        <AlertCircle className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <p className="text-[11px] text-muted-foreground font-medium">
                            {t('connectWarning')}
                        </p>
                    </div>
                )}
            </div>

            {/* Donation History */}
            {!isLoadingDonations ? (
                <DonationList donations={donations} />
            ) : (
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="size-4 animate-spin text-primary opacity-50" />
                </div>
            )}
        </div>
    );
}
