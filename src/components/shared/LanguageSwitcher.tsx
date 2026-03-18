'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Globe } from 'lucide-react';
import { useThemeStore } from '@/stores/theme-store';
import { cn } from '@/utils/classnames';

export function LanguageSwitcher() {
    const { language, setLanguage } = useThemeStore();
    const [isHovered, setIsHovered] = useState(false);

    const handleToggleLanguage = () => {
        const newLanguage = language === 'ENG' ? 'VI' : 'ENG';
        setLanguage(newLanguage);
    };

    return (
        <button
            onClick={handleToggleLanguage}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative flex items-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-1.5 rounded sm:rounded bg-transparent sm:bg-muted border-0 sm:border border-border sm:hover:border-primary/40 transition-all duration-300 ease-out sm:hover:shadow-md sm:hover:shadow-primary/10 active:scale-95 group overflow-hidden h-9"
            aria-label={`Switch to ${language === 'VI' ? 'English' : 'Vietnamese'}`}
        >
            {/* Globe icon with spin animation on hover - hidden on mobile */}
            <Globe
                className={cn(
                    'size-4 text-primary transition-transform duration-700 hidden sm:block',
                    isHovered ? 'rotate-180' : 'rotate-0',
                )}
            />

            {/* Flag with flip animation */}
            <div className="relative w-6 h-4 overflow-hidden rounded-sm shadow-sm">
                <div
                    className="absolute inset-0 transition-transform duration-500 ease-in-out"
                    style={{
                        transform: language === 'VI' ? 'rotateY(0deg)' : 'rotateY(180deg)',
                        backfaceVisibility: 'hidden',
                    }}
                >
                    <Image
                        src="/icons/vnflag.svg"
                        alt="Vietnamese flag"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
                <div
                    className="absolute inset-0 transition-transform duration-500 ease-in-out"
                    style={{
                        transform: language === 'ENG' ? 'rotateY(0deg)' : 'rotateY(-180deg)',
                        backfaceVisibility: 'hidden',
                    }}
                >
                    <Image
                        src="/icons/usaflag.svg"
                        alt="USA flag"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            </div>

            {/* Language code badge - hidden on mobile */}
            <span className="text-[10px] font-bold text-foreground uppercase tracking-wider min-w-[24px] hidden sm:block">
                {language}
            </span>

            {/* Animated underline on hover */}
            <span
                className={cn(
                    'absolute bottom-0 left-0 h-px bg-primary transition-all duration-300 ease-out',
                    isHovered ? 'w-full' : 'w-0',
                )}
            />
        </button>
    );
}
