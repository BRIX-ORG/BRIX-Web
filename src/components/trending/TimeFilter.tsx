'use client';

import { cn } from '@/utils/classnames';

interface TimeFilterProps {
    value: string;
    onChange?: (value: string) => void;
}

const options = [
    { value: 'DAY', label: '24H' },
    { value: 'WEEK', label: '7 DAYS' },
    { value: 'MONTH', label: '1 MONTH' },
    { value: 'ALL', label: 'ALL TIME' },
];

export function TimeFilter({ value, onChange }: TimeFilterProps) {
    return (
        <div className="inline-flex bg-muted p-0.5 rounded-lg border border-border">
            {options.map((option) => (
                <button
                    key={option.value}
                    onClick={() => onChange?.(option.value)}
                    className={cn(
                        'px-3 py-1.5 rounded-md text-[10px] font-bold transition-all tracking-wider',
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
