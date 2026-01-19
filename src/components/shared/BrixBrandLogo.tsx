import Link from 'next/link';
import { cn } from '@/lib/utils';

interface BrixBrandLogoProps {
    href?: string;
    size?: 'sm' | 'md' | 'lg';
    animated?: boolean;
    className?: string;
}

export function BrixBrandLogo({
    href = '/',
    size = 'md',
    animated = true,
    className,
}: BrixBrandLogoProps) {
    const sizeClasses = {
        sm: {
            wrapper: 'gap-2',
            icon: 'size-6',
            inner: 'size-3',
            text: 'text-lg',
        },
        md: {
            wrapper: 'gap-3',
            icon: 'size-8',
            inner: 'size-4',
            text: 'text-2xl',
        },
        lg: {
            wrapper: 'gap-4',
            icon: 'size-10',
            inner: 'size-5',
            text: 'text-3xl',
        },
    };

    const s = sizeClasses[size];

    const content = (
        <>
            <div
                className={cn(
                    s.icon,
                    'bg-primary flex items-center justify-center rounded-sm transition-transform duration-500',
                    animated && 'rotate-45 group-hover:rotate-90',
                )}
            >
                <div
                    className={cn(
                        s.inner,
                        'bg-background transition-transform duration-500',
                        animated && '-rotate-45 group-hover:-rotate-90',
                    )}
                />
            </div>
            <h2 className={cn(s.text, 'font-display font-bold tracking-tighter text-foreground')}>
                BRIX<span className="text-primary">.</span>
            </h2>
        </>
    );

    if (href) {
        return (
            <Link
                href={href}
                className={cn('flex items-center group cursor-pointer', s.wrapper, className)}
            >
                {content}
            </Link>
        );
    }

    return <div className={cn('flex items-center', s.wrapper, className)}>{content}</div>;
}
