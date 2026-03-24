import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { RealtimeDashboardClient } from '@/components/realtime';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('realtime');
    return {
        title: `${t('title')} | BRIX`,
        description: t('description'),
    };
}

export default function RealtimeAssetsPage() {
    return (
        <div className="flex-1 w-full min-h-[100dvh]">
            <RealtimeDashboardClient />
        </div>
    );
}
