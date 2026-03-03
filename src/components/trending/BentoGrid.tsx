'use client';

import { BentoItem, TrendingItem } from '@/components/trending';

interface BentoGridProps {
    items: TrendingItem[];
}

export function BentoGrid({ items }: BentoGridProps) {
    return (
        <section className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[240px]">
                {items.map((item) => (
                    <BentoItem key={item.id} item={item} />
                ))}
            </div>
        </section>
    );
}
