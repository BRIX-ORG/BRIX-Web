'use client';

import { useState, useRef, useEffect } from 'react';
import { Smile } from 'lucide-react';
import dynamic from 'next/dynamic';
import { EmojiStyle, Theme } from 'emoji-picker-react';
import type { EmojiClickData } from 'emoji-picker-react';
import { cn } from '@/utils/classnames';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

interface EmojiPickerButtonProps {
    onEmojiSelect: (emoji: string) => void;
    className?: string;
    pickerClassName?: string;
    position?: 'top' | 'bottom';
    align?: 'left' | 'right';
}

export function EmojiPickerButton({
    onEmojiSelect,
    className,
    pickerClassName,
    position = 'top',
    align = 'right',
}: EmojiPickerButtonProps) {
    const [showPicker, setShowPicker] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!showPicker) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showPicker]);

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        onEmojiSelect(emojiData.emoji);
        setShowPicker(false);
    };

    return (
        <div ref={containerRef} className={cn('relative inline-block', showPicker && 'z-100')}>
            <button
                type="button"
                onClick={() => setShowPicker(!showPicker)}
                className={cn(
                    'p-1.5 rounded transition-colors cursor-pointer',
                    showPicker
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground/60 hover:text-primary hover:bg-primary/5',
                    className,
                )}
                title="Add emoji"
            >
                <Smile className="size-4" />
            </button>

            {showPicker && (
                <div
                    className={cn(
                        'absolute z-1000 shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-primary/20 rounded-lg overflow-hidden',
                        position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
                        align === 'right' ? 'right-0' : 'left-0',
                        pickerClassName,
                    )}
                >
                    <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        theme={Theme.DARK}
                        emojiStyle={EmojiStyle.APPLE}
                        lazyLoadEmojis
                        width={300}
                        height={400}
                    />
                </div>
            )}
        </div>
    );
}
