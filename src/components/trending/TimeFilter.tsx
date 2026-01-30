'use client';

import { cn } from '@/types/utils';

interface TimeFilterProps {
    value: '24h' | '7d' | 'all';
    onChange?: (value: '24h' | '7d' | 'all') => void;
}

const options = [
    { value: '24h' as const, label: '24H' },
    { value: '7d' as const, label: '7 DAYS' },
    { value: 'all' as const, label: 'ALL TIME' },
];

export function TimeFilter({ value, onChange }: TimeFilterProps) {
    return (
        <div className="inline-flex bg-muted p-1 rounded-xl border border-border">
            {options.map((option) => (
                <button
                    key={option.value}
                    onClick={() => onChange?.(option.value)}
                    className={cn(
                        'px-6 py-2 rounded-lg text-sm font-bold transition-all',
                        value === option.value
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground',
                    )}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}
