'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useUIStore } from '@/stores/ui-store';
import { useTranslations } from 'next-intl';
import { SettingsBanner, ProfileForm, PasswordForm } from '@/components/settings';

export default function SettingsPage() {
    const t = useTranslations('settings');
    const { data: session, status } = useSession();
    const showLoading = useUIStore((state) => state.showLoading);
    const hideLoading = useUIStore((state) => state.hideLoading);

    useEffect(() => {
        if (status === 'loading') {
            showLoading(t('messages.loading'));
        } else {
            hideLoading();
        }
    }, [status, showLoading, hideLoading, t]);

    if (status === 'loading') {
        return null;
    }

    if (!session?.user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-muted-foreground">{t('messages.signInRequired')}</p>
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
