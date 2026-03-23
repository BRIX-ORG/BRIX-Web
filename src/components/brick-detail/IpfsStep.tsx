'use client';

import { Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/classnames';

interface IpfsStepProps {
    status: string | null;
    isOwner: boolean;
    isDistributing: boolean;
    onDistribute: () => void;
    fee: string;
}

export function IpfsStep({ status, isOwner, isDistributing, onDistribute, fee }: IpfsStepProps) {
    const isPending = status === 'pending';
    const isUploaded = status === 'ipfs_uploaded' || status === 'onchain';

    if (isUploaded && !isOwner) return null;

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <div
                    className={cn(
                        'size-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors',
                        isUploaded
                            ? 'bg-green-500 text-white border-green-500'
                            : 'bg-primary/10 text-primary border-primary/30',
                    )}
                >
                    {isUploaded ? <CheckCircle2 className="size-3" /> : '1'}
                </div>
                <h4 className="text-xs font-bold text-foreground">Distribute to IPFS</h4>
            </div>

            {isOwner && !isUploaded && !isPending && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Step 1: Distribute your verified image to the decentralized IPFS network to
                        ensure permanent storage.
                    </p>
                    <button
                        onClick={onDistribute}
                        disabled={isDistributing}
                        className="w-full h-9 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
                    >
                        {isDistributing ? (
                            <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                            <div className="size-1.5 rounded-full bg-primary animate-pulse group-hover:scale-125 transition-transform" />
                        )}
                        {isDistributing ? 'Processing...' : `Distribute to IPFS (${fee} POL)`}
                    </button>
                </div>
            )}

            {isPending && (
                <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/10 rounded-lg animate-pulse">
                    <Loader2 className="size-3.5 animate-spin text-primary" />
                    <span className="text-[11px] text-muted-foreground font-medium">
                        Initialising IPFS distribution. Please wait...
                    </span>
                </div>
            )}
        </div>
    );
}
