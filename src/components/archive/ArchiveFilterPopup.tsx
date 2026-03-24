'use client';

import { X, Check, Calendar } from 'lucide-react';
import { cn } from '@/utils/classnames';
import type { BrickMediaType, BrickTagType } from '@/types/brick.types';
import type { DateFilterType } from '@/types/algolia.types';
import { useTranslations } from 'next-intl';

export interface ArchiveFilters {
    tagType?: BrickTagType | 'ALL';
    mediaType?: BrickMediaType | 'ALL';
    isPublic?: boolean | 'ALL';
    dateFilterType: DateFilterType;
    dateFilterValue: string;
}

interface ArchiveFilterPopupProps {
    filters: ArchiveFilters;
    onFiltersChange: (filters: ArchiveFilters) => void;
    onClose: () => void;
    isOpen: boolean;
}

export function ArchiveFilterPopup({
    filters,
    onFiltersChange,
    onClose,
    isOpen,
}: ArchiveFilterPopupProps) {
    const t = useTranslations('archive.filters');
    if (!isOpen) return null;

    const tagTypes: (BrickTagType | 'ALL')[] = ['ALL', 'ART', 'REALTIME', 'PRODUCT'];
    const mediaTypes: (BrickMediaType | 'ALL')[] = ['ALL', 'IMAGE', 'GLTF'];
    const visibilityOptions: ('ALL' | 'PUBLIC' | 'PRIVATE')[] = ['ALL', 'PUBLIC', 'PRIVATE'];
    const dateFilterTypes: DateFilterType[] = ['none', 'day', 'month', 'year'];

    const handleFilterUpdate = (key: keyof ArchiveFilters, value: string | boolean) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    return (
        <div className="absolute right-0 top-12 z-50 w-72 bg-background/80 backdrop-blur-2xl border border-primary/20 rounded-2xl shadow-2xl p-5 animate-in fade-in zoom-in duration-200 origin-top-right">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                    {t('title')}
                </h3>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-primary/10 rounded-full transition-colors text-muted-foreground hover:text-primary"
                >
                    <X className="size-4" />
                </button>
            </div>

            <div className="space-y-6">
                {/* Tag Type Filter */}
                <div className="space-y-3">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                        {t('tagType')}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                        {tagTypes.map((type) => (
                            <button
                                key={type}
                                onClick={() => handleFilterUpdate('tagType', type)}
                                className={cn(
                                    'px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center justify-between border',
                                    filters.tagType === type
                                        ? 'bg-primary/20 border-primary/50 text-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]'
                                        : 'bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50 hover:border-primary/20',
                                )}
                            >
                                {type}
                                {filters.tagType === type && <Check className="size-3" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Media Type Filter */}
                <div className="space-y-3">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                        {t('mediaFormat')}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                        {mediaTypes.map((type) => (
                            <button
                                key={type}
                                onClick={() => handleFilterUpdate('mediaType', type)}
                                className={cn(
                                    'px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center justify-between border',
                                    filters.mediaType === type
                                        ? 'bg-primary/20 border-primary/50 text-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]'
                                        : 'bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50 hover:border-primary/20',
                                )}
                            >
                                {type}
                                {filters.mediaType === type && <Check className="size-3" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Visibility Filter */}
                <div className="space-y-3">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                        {t('visibility')}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                        {visibilityOptions.map((option) => {
                            const value = option === 'ALL' ? 'ALL' : option === 'PUBLIC';
                            return (
                                <button
                                    key={option}
                                    onClick={() => handleFilterUpdate('isPublic', value)}
                                    className={cn(
                                        'px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center justify-between border',
                                        filters.isPublic === value
                                            ? 'bg-primary/20 border-primary/50 text-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]'
                                            : 'bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50 hover:border-primary/20',
                                    )}
                                >
                                    {option}
                                    {filters.isPublic === value && <Check className="size-3" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Date Filter */}
                <div className="space-y-3">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                        {t('dateFilter')}
                    </span>
                    <div className="bg-muted/30 border border-primary/5 rounded-xl p-2 space-y-3">
                        <div className="flex items-center gap-1 bg-background/50 rounded-lg p-1">
                            <Calendar className="size-3 text-primary/60 ml-1 shrink-0" />
                            {dateFilterTypes.map((type) => (
                                <button
                                    key={type}
                                    onClick={() =>
                                        onFiltersChange({
                                            ...filters,
                                            dateFilterType: type,
                                            dateFilterValue: '',
                                        })
                                    }
                                    className={cn(
                                        'px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all flex-1',
                                        filters.dateFilterType === type
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground',
                                    )}
                                >
                                    {type === 'none' ? t('all') : type}
                                </button>
                            ))}
                        </div>

                        {filters.dateFilterType !== 'none' && (
                            <div className="px-1">
                                <input
                                    type="text"
                                    placeholder={
                                        filters.dateFilterType === 'day'
                                            ? t('placeholders.day')
                                            : filters.dateFilterType === 'month'
                                              ? t('placeholders.month')
                                              : t('placeholders.year')
                                    }
                                    value={filters.dateFilterValue}
                                    onChange={(e) =>
                                        handleFilterUpdate('dateFilterValue', e.target.value)
                                    }
                                    className="w-full bg-background/50 text-[10px] text-foreground border border-primary/10 rounded-lg outline-none ring-0 placeholder:text-muted-foreground/30 px-3 py-2 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all font-mono"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-4 border-t border-primary/10 flex justify-between gap-4">
                <button
                    onClick={() =>
                        onFiltersChange({
                            tagType: 'ALL',
                            mediaType: 'ALL',
                            isPublic: 'ALL',
                            dateFilterType: 'none',
                            dateFilterValue: '',
                        })
                    }
                    className="text-[10px] font-bold text-muted-foreground uppercase hover:text-primary transition-colors"
                >
                    {t('clearAll')}
                </button>
                <div className="text-[10px] font-mono text-primary/40 uppercase">{t('footer')}</div>
            </div>
        </div>
    );
}
