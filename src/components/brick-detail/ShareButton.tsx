'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Share2 } from 'lucide-react';
import { cn } from '@/utils/classnames';
import { ShareBrickModal } from './ShareBrickModal';

interface ShareButtonProps {
    brickId: string;
    className?: string;
}

export function ShareButton({ brickId, className }: ShareButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const t = useTranslations('onchain.share');

    return (
        <div className={cn('relative', className)}>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-sm text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary hover:bg-primary/10 border border-transparent transition-all cursor-pointer"
            >
                <Share2 className="size-3.5" />
                {t('button')}
            </button>

            <ShareBrickModal brickId={brickId} isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </div>
    );
}
