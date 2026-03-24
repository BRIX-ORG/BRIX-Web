'use client';

import { Camera, ImageIcon, Package, type LucideIcon } from 'lucide-react';
import type { BrickTagType } from '@/types/brick.types';
import { useTranslations } from 'next-intl';

interface ArtistGalleryTabsProps {
    activeTab: BrickTagType;
    onTabChange: (tab: BrickTagType) => void;
}

export function ArtistGalleryTabs({ activeTab, onTabChange }: ArtistGalleryTabsProps) {
    const t = useTranslations('artist.tabs');
    const tabs: { id: BrickTagType; label: string; icon: LucideIcon }[] = [
        { id: 'REALTIME', label: t('realtime'), icon: Camera },
        { id: 'ART', label: t('art'), icon: ImageIcon },
        { id: 'PRODUCT', label: t('product'), icon: Package },
    ];

    return (
        <div className="flex items-center gap-8 border-b border-primary/10 overflow-x-auto whitespace-nowrap scrollbar-hide">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onTabChange(tab.id)}
                        className={`pb-4 border-b-2 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer ${
                            isActive
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Icon className="size-3.5" />
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}
