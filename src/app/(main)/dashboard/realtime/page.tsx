import { Metadata } from 'next';
import { RealtimeDashboardClient } from '@/components/realtime';

export const metadata: Metadata = {
    title: 'Realtime Assets | BRIX',
    description: 'Manage and monitor your realtime distributed assets.',
};

export default function RealtimeAssetsPage() {
    return (
        <div className="flex-1 w-full min-h-[100dvh]">
            <RealtimeDashboardClient />
        </div>
    );
}
