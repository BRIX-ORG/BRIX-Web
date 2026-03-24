'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Share2, Check, Copy, Link2 } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/utils/classnames';

interface ShareButtonProps {
    brickId: string;
    className?: string;
}

export function ShareButton({ brickId, className }: ShareButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);
    const toast = useToast();
    const t = useTranslations('onchain.share');

    const shareUrl =
        typeof window !== 'undefined' ? `${window.location.origin}/dashboard/brick/${brickId}` : '';

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast.success(t('toast.success'));
            setTimeout(() => {
                setCopied(false);
                setIsOpen(false);
            }, 1500);
        } catch {
            toast.error(t('toast.error'));
        }
    };

    return (
        <div className={cn('relative', className)} ref={popoverRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-sm text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary hover:bg-primary/10 border border-transparent transition-all cursor-pointer"
            >
                <Share2 className="size-3.5" />
                {t('button')}
            </button>

            {isOpen && (
                <div className="absolute bottom-full mb-2 left-0 z-30 w-72 bg-background border border-primary/20 rounded-lg shadow-[0_0_20px_rgba(0,238,255,0.1)] p-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="flex items-center gap-2 mb-2">
                        <Link2 className="size-3.5 text-primary shrink-0" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                            {t('title')}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            readOnly
                            value={shareUrl}
                            className="flex-1 bg-muted/50 border border-primary/10 rounded-sm px-2.5 py-1.5 text-[11px] font-mono text-foreground/80 truncate focus:outline-none focus:border-primary/30"
                            onFocus={(e) => e.target.select()}
                        />
                        <button
                            type="button"
                            onClick={handleCopy}
                            className={cn(
                                'shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-sm text-[11px] font-bold transition-all cursor-pointer',
                                copied
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                                    : 'bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30',
                            )}
                        >
                            {copied ? (
                                <>
                                    <Check className="size-3" />
                                    {t('copied')}
                                </>
                            ) : (
                                <>
                                    <Copy className="size-3" />
                                    {t('copy')}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
