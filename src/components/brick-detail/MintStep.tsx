'use client';

import { useTranslations } from 'next-intl';
import { Loader2, CheckCircle2, ExternalLink } from 'lucide-react';
import { cn } from '@/utils/classnames';

interface MintStepProps {
    status: string | null;
    isOwner: boolean;
    isMinting: boolean;
    onMint: () => void;
    ipfsCid: string | null;
    imageCid: string | null;
    onChainTx: string | null;
    isMintTxConfirmed: boolean;
}

export function MintStep({
    status,
    isOwner,
    isMinting,
    onMint,
    ipfsCid,
    imageCid,
    onChainTx,
    isMintTxConfirmed,
}: MintStepProps) {
    const t = useTranslations('onchain.mintStep');
    const isIpfsReady = status === 'ipfs_uploaded';
    const isOnChain = status === 'onchain';

    if (!isIpfsReady && !isOnChain) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div
                    className={cn(
                        'size-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors',
                        isOnChain
                            ? 'bg-green-500 text-white border-green-500'
                            : 'bg-primary/10 text-primary border-primary/30',
                    )}
                >
                    {isOnChain ? <CheckCircle2 className="size-3" /> : '2'}
                </div>
                <h4 className="text-xs font-bold text-foreground">{t('title')}</h4>
                {isOnChain && (
                    <span className="text-[9px] bg-green-500/10 text-green-400 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-sm border border-green-500/10">
                        {t('live')}
                    </span>
                )}
            </div>

            <div className="space-y-3">
                {/* IPFS Data Box */}
                <div className="bg-primary/10 hover:bg-primary/20 border border-primary/20 p-2.5 rounded-lg space-y-1.5 transition-colors group">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">
                            {t('assetVerified')}
                        </p>
                        {onChainTx && (
                            <a
                                href={`https://amoy.polygonscan.com/tx/${onChainTx}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[8px] text-primary/60 hover:text-primary flex items-center gap-0.5 transition-colors"
                            >
                                {t('explorer')} <ExternalLink className="size-2" />
                            </a>
                        )}
                    </div>
                    <div className="flex flex-col gap-1.5 min-w-0 mt-2">
                        {imageCid && (
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono text-muted-foreground truncate group-hover:text-primary/70">
                                    {t('imageCid', { cid: imageCid })}
                                </span>
                                <div className="flex gap-2 items-center">
                                    <CheckCircle2 className="size-3 text-green-500/60 shrink-0" />
                                    <a
                                        href={`${process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL || 'https://plum-urban-pike-360.mypinata.cloud'}/ipfs/${imageCid}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[10px] text-primary/60 hover:text-primary transition-colors"
                                    >
                                        <ExternalLink className="size-3" />
                                    </a>
                                </div>
                            </div>
                        )}
                        {ipfsCid && (
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-[10px] font-mono text-muted-foreground truncate group-hover:text-primary/70">
                                    {t('metaCid', { cid: ipfsCid })}
                                </span>
                                <div className="flex gap-2 items-center">
                                    <CheckCircle2 className="size-3 text-green-500/60 shrink-0" />
                                    <a
                                        href={`${process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL || 'https://plum-urban-pike-360.mypinata.cloud'}/ipfs/${ipfsCid}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[10px] text-primary/60 hover:text-primary transition-colors"
                                    >
                                        <ExternalLink className="size-3" />
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mint Button for Owner */}
                {isOwner && isIpfsReady && !isMintTxConfirmed && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                            {t('description')}
                        </p>
                        <button
                            onClick={onMint}
                            disabled={isMinting}
                            className="w-full h-9 bg-primary text-primary-foreground hover:brightness-110 rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                        >
                            {isMinting && <Loader2 className="size-3.5 animate-spin" />}
                            {isMinting ? t('minting') : t('button')}
                        </button>
                    </div>
                )}

                {/* Pending Verification */}
                {isMintTxConfirmed && !isOnChain && (
                    <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/10 rounded-lg animate-pulse">
                        <Loader2 className="size-3.5 animate-spin text-primary" />
                        <span className="text-[11px] text-muted-foreground font-medium">
                            {t('verifying')}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
