import Link from 'next/link';

interface AuthTabsProps {
    activeTab: 'login' | 'signup';
}

export function AuthTabs({ activeTab }: AuthTabsProps) {
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
                Login
            </Link>
            <Link
                href="/signup"
                className={`flex-1 text-center py-2 text-sm font-bold uppercase transition-all rounded-sm ${
                    activeTab === 'signup'
                        ? 'bg-background text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                }`}
            >
                Sign Up
            </Link>
        </div>
    );
}
