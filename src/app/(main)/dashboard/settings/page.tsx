'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useUIStore } from '@/stores/ui-store';
import { SettingsBanner, ProfileForm, PasswordForm } from '@/components/settings';

export default function SettingsPage() {
    const { data: session, status } = useSession();
    const showLoading = useUIStore((state) => state.showLoading);
    const hideLoading = useUIStore((state) => state.hideLoading);

    useEffect(() => {
        if (status === 'loading') {
            showLoading('Loading settings...');
        } else {
            hideLoading();
        }
    }, [status, showLoading, hideLoading]);

    if (status === 'loading') {
        return null;
    }

    if (!session?.user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-muted-foreground">Please sign in to access settings</p>
            </div>
        );
    }

    const user = session.user;

    return (
        <div className="min-h-screen space-y-10 px-4 md:px-6 lg:px-8 py-6">
            <SettingsBanner user={user} />
            <ProfileForm user={user} />
            <div className="border-t border-primary/5 pt-10">
                <PasswordForm />
            </div>
        </div>
    );
}
