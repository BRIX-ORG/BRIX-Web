'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun, Cloudy } from 'lucide-react';
import { useThemeStore } from '@/stores/theme-store';
import { cn } from '@/utils/classnames';

interface ThemeToggleProps {
    isCollapsed?: boolean;
}

export function ThemeToggle({ isCollapsed = false }: ThemeToggleProps) {
    const { theme, toggleTheme } = useThemeStore();
    const [mounted, setMounted] = useState(false);
    const isDark = theme === 'dark';

    useEffect(() => {
        // eslint-disable-next-line
        setMounted(true);
    }, []);

    // Sync theme to DOM whenever it changes
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    if (!mounted) {
        return (
            <div className={cn('px-3 py-2', isCollapsed ? 'flex justify-center' : '')}>
                <div className="size-10 rounded-full bg-muted animate-pulse" />
            </div>
        );
    }

    if (isCollapsed) {
        return (
            <div className="flex justify-center px-2 py-4">
                <button
                    onClick={toggleTheme}
                    className="relative group p-2 rounded-full transition-all duration-300 overflow-hidden shrink-0 hover:scale-110 active:scale-95 cursor-pointer"
                    aria-label="Toggle theme"
                    style={{
                        background: isDark
                            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
                            : 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                        boxShadow: isDark
                            ? '0 0 20px rgba(253, 224, 71, 0.2)'
                            : '0 0 20px rgba(251, 146, 60, 0.2)',
                    }}
                >
                    <div className="relative w-6 h-6 flex items-center justify-center">
                        <Sun
                            className={cn(
                                'absolute w-5 h-5 transition-all duration-500 ease-out',
                                isDark
                                    ? 'opacity-0 scale-50'
                                    : 'opacity-100 scale-100 text-orange-500',
                            )}
                        />
                        <Moon
                            className={cn(
                                'absolute w-5 h-5 transition-all duration-500 ease-out',
                                isDark
                                    ? 'opacity-100 scale-100 text-yellow-300'
                                    : 'opacity-0 scale-50',
                            )}
                        />
                    </div>
                </button>
            </div>
        );
    }

    return (
        <div
            onClick={toggleTheme}
            className="flex items-center justify-between rounded-lg p-3 my-2 transition-all duration-200 hover:bg-muted group cursor-pointer"
        >
            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-[0.2em] group-hover:text-foreground transition-colors ml-1">
                Display Mode
            </span>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    toggleTheme();
                }}
                className="relative group p-2 rounded-full transition-all duration-300 overflow-hidden shrink-0 hover:scale-110 active:scale-95 cursor-pointer mr-1"
                aria-label="Toggle theme"
                style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
                        : 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                    boxShadow: isDark
                        ? '0 0 0 rgba(253, 224, 71, 0)'
                        : '0 0 0 rgba(251, 146, 60, 0)',
                }}
            >
                {/* Hover glow effect */}
                <div
                    className={cn(
                        'absolute inset-0 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100',
                    )}
                    style={{
                        boxShadow: isDark
                            ? '0 0 20px rgba(253, 224, 71, 0.4), inset 0 0 15px rgba(253, 224, 71, 0.1)'
                            : '0 0 20px rgba(251, 146, 60, 0.4), inset 0 0 15px rgba(251, 146, 60, 0.1)',
                    }}
                />

                {/* Background glow */}
                <div
                    className={cn(
                        'absolute inset-0 transition-opacity duration-500',
                        isDark ? 'opacity-100' : 'opacity-0',
                    )}
                    style={{
                        background:
                            'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 50%)',
                    }}
                />

                {/* Stars decoration for dark mode */}
                <div
                    className={cn(
                        'absolute inset-0 transition-opacity duration-500',
                        isDark ? 'opacity-100' : 'opacity-0',
                    )}
                >
                    <span
                        className="absolute top-1.5 right-2.5 w-1 h-1 bg-white rounded-full animate-pulse"
                        style={{ animationDelay: '0s' }}
                    />
                    <span
                        className="absolute top-3 right-1.5 w-0.5 h-0.5 bg-white/70 rounded-full animate-pulse"
                        style={{ animationDelay: '0.5s' }}
                    />
                    <span
                        className="absolute bottom-2 right-3 w-0.5 h-0.5 bg-white/50 rounded-full animate-pulse"
                        style={{ animationDelay: '1s' }}
                    />
                </div>

                {/* Icon container */}
                <div className="relative w-6 h-6 flex items-center justify-center">
                    {/* Cloud icon (behind sun) */}
                    <Cloudy
                        className={cn(
                            'absolute -top-0.5 w-4 h-4 transition-opacity duration-500 ease-out',
                            isDark ? 'opacity-0 scale-0' : 'opacity-60 scale-100',
                        )}
                        style={{
                            left: '50%',
                            transform: 'translateX(-50%)',
                            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
                            animation: isDark ? 'none' : 'cloud-move 5s ease-in-out infinite',
                            zIndex: 0,
                        }}
                        fill="#F1F5F9"
                        stroke="#CBD5E1"
                        strokeWidth={1.2}
                    />

                    {/* Sun icon */}
                    <Sun
                        className={cn(
                            'absolute w-5 h-5 transition-all duration-500 ease-out group-hover:rotate-45',
                            isDark
                                ? 'opacity-0 rotate-90 scale-50'
                                : 'opacity-100 rotate-0 scale-100 text-orange-500 group-hover:text-orange-400',
                        )}
                        style={{
                            filter: isDark
                                ? 'none'
                                : 'drop-shadow(0 0 8px rgba(251, 146, 60, 0.6))',
                            zIndex: 1,
                        }}
                    />

                    {/* Moon icon */}
                    <Moon
                        className={cn(
                            'absolute w-5 h-5 transition-all duration-500 ease-out group-hover:-rotate-12',
                            isDark
                                ? 'opacity-100 rotate-0 scale-100 text-yellow-300 group-hover:text-yellow-200'
                                : 'opacity-0 -rotate-90 scale-50',
                        )}
                        style={{
                            filter: isDark
                                ? 'drop-shadow(0 0 8px rgba(253, 224, 71, 0.6))'
                                : 'none',
                        }}
                    />
                </div>

                {/* Hover ring effect */}
                <div
                    className={cn(
                        'absolute -inset-1 rounded-full border-2 transition-all duration-300 pointer-events-none opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100',
                        isDark ? 'border-yellow-300/40' : 'border-orange-400/40',
                    )}
                />
            </button>
        </div>
    );
}
