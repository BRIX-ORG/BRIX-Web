'use client';

import { useState } from 'react';
import Masonry, { MasonryItem } from '@/components/react-bits/Masonry';

interface Tab {
    id: string;
    label: string;
}

interface ArtistGalleryProps {
    items: MasonryItem[];
    tabs?: Tab[];
}

const defaultTabs: Tab[] = [
    { id: 'gallery', label: 'Verified Gallery' },
    { id: 'metadata', label: 'Metadata Logs' },
    { id: 'contracts', label: 'Contract Stats' },
    { id: 'license', label: 'License Feed' },
];

export function ArtistGallery({ items, tabs = defaultTabs }: ArtistGalleryProps) {
    const [activeTab, setActiveTab] = useState(tabs[0]?.id || 'gallery');

    return (
        <section className="col-span-12 lg:col-span-9 space-y-6">
            {/* Tabs */}
            <div className="flex items-center gap-8 border-b border-primary/10 overflow-x-auto whitespace-nowrap scrollbar-hide">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-4 border-b-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                            activeTab === tab.id
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Masonry Gallery */}
            {activeTab === 'gallery' && (
                <div className="h-300">
                    <Masonry items={items} />
                </div>
            )}

            {/* Other tabs placeholder */}
            {activeTab !== 'gallery' && (
                <div className="h-150 flex items-center justify-center bg-muted/50 rounded-xl border border-primary/10">
                    <p className="text-muted-foreground font-mono text-sm uppercase">
                        {tabs.find((t) => t.id === activeTab)?.label} - Coming Soon
                    </p>
                </div>
            )}
        </section>
    );
}
