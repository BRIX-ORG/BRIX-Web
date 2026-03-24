import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface AuthTabsProps {
    activeTab: 'login' | 'signup';
}

export function AuthTabs({ activeTab }: AuthTabsProps) {
    const t = useTranslations('auth');
    return (
        <div className="flex mb-10 bg-muted p-1 rounded-sm">
            <Link
                href="/login"
                className={`flex-1 text-center py-2 text-sm font-bold uppercase transition-all rounded-sm ${
                    activeTab === 'login'
                        ? 'bg-background text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                }`}
            >
                {t('tabs.login')}
            </Link>
            <Link
                href="/signup"
                className={`flex-1 text-center py-2 text-sm font-bold uppercase transition-all rounded-sm ${
                    activeTab === 'signup'
                        ? 'bg-background text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                }`}
            >
                {t('tabs.signup')}
            </Link>
        </div>
    );
}
