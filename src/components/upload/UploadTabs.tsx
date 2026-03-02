'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/classnames';

interface Tab {
    href: string;
    label: string;
}

const tabs: Tab[] = [
    { href: '/dashboard/uploads', label: 'Art Upload' },
    { href: '/dashboard/uploads/model', label: 'Model Upload' },
];

export function UploadTabs() {
    const pathname = usePathname();

    return (
        <div className="w-full flex justify-start mb-6 border-b border-border">
            <div className="flex gap-12">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={cn(
                                'relative flex flex-col items-center justify-center pb-4 transition-colors',
                                isActive
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground/70',
                            )}
                        >
                            <span className="text-sm font-bold leading-normal tracking-widest uppercase">
                                {tab.label}
                            </span>
                            {isActive && (
                                <div className="absolute bottom-0 w-full h-0.75 bg-primary shadow-[0_0_10px_#00eeff]" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
