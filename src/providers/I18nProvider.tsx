'use client';

import { NextIntlClientProvider } from 'next-intl';
import { useThemeStore } from '@/stores/theme-store';
import { type ReactNode, useMemo } from 'react';
import messagesEn from '../../locales/en.json';
import messagesVi from '../../locales/vi.json';

export function I18nProvider({ children }: { children: ReactNode }) {
    const { language } = useThemeStore();
    const locale = language === 'VI' ? 'vi' : 'en';
    const messages = useMemo(() => (language === 'VI' ? messagesVi : messagesEn), [language]);

    return (
        <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
            {children}
        </NextIntlClientProvider>
    );
}
