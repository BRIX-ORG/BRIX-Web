'use client';

import { useTranslations } from 'next-intl';
import { RisingArtists, GlobalActivityWidget, TrendingGallery } from '@/components/trending';

export default function TrendingPage() {
    const t = useTranslations('trending');
    return (
        <div className="relative p-8 max-w-360 mx-auto">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter neon-glow-text">
                        {t('title')}
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-md text-sm md:text-base leading-relaxed">
                        {t('description')}
                    </p>
                </div>
            </div>

            {/* Rising Artists */}
            <RisingArtists />

            {/* Newsfeed Gallery */}
            <section className="mb-12">
                <TrendingGallery />
            </section>

            {/* Global Activity Widget */}
            <GlobalActivityWidget />
        </div>
    );
}
