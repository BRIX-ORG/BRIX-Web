'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, Mic, Send, Smile } from 'lucide-react';
import dynamic from 'next/dynamic';
import { EmojiStyle, Theme } from 'emoji-picker-react';
import type { EmojiClickData } from 'emoji-picker-react';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

interface MessageInputProps {
    onSend?: (message: string) => void;
}

export function MessageInput({ onSend }: MessageInputProps) {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!showEmojiPicker) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showEmojiPicker]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const input = inputRef.current;
        if (input && input.value.trim()) {
            onSend?.(input.value);
            input.value = '';
        }
    };

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        if (inputRef.current) {
            const input = inputRef.current;
            const start = input.selectionStart ?? input.value.length;
            const end = input.selectionEnd ?? input.value.length;
            const newValue = input.value.slice(0, start) + emojiData.emoji + input.value.slice(end);
            input.value = newValue;
            const cursorPos = start + emojiData.emoji.length;
            input.setSelectionRange(cursorPos, cursorPos);
            input.focus();
        }
    };

    return (
        <div className="relative p-6 bg-background/80 backdrop-blur-md border-t border-border">
            {/* Emoji Picker */}
            {showEmojiPicker && (
                <div ref={emojiPickerRef} className="absolute bottom-full left-6 mb-2 z-50">
                    <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        theme={Theme.DARK}
                        emojiStyle={EmojiStyle.APPLE}
                        lazyLoadEmojis
                        width={350}
                        height={400}
                    />
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="flex items-center gap-4 bg-muted border border-border rounded p-2 focus-within:border-primary transition-all"
            >
                {/* Add Photo Button */}
                <button
                    type="button"
                    className="size-10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                >
                    <Camera className="size-5" />
                </button>

                {/* Emoji Picker Toggle */}
                <button
                    type="button"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                    className={`size-10 flex items-center justify-center transition-colors ${showEmojiPicker ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                >
                    <Smile className="size-5" />
                </button>

                {/* Input */}
                <input
                    ref={inputRef}
                    name="message"
                    className="flex-1 bg-transparent border-none text-sm focus:ring-0 placeholder:text-muted-foreground font-bold tracking-tight outline-none"
                    placeholder="TRANSMIT SECURE DATA..."
                    type="text"
                />

                {/* Action Buttons */}
                <div className="flex gap-1 pr-1">
                    <button
                        type="button"
                        className="size-10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                    >
                        <Mic className="size-5" />
                    </button>
                    <button
                        type="submit"
                        className="bg-primary text-primary-foreground px-4 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white transition-colors"
                    >
                        SEND
                        <Send className="size-3" />
                    </button>
                </div>
            </form>

            {/* Status Indicators */}
            <div className="flex items-center justify-center gap-6 mt-3">
                <div className="flex items-center gap-2">
                    <div className="size-1.5 bg-primary rounded-full" />
                    <span className="text-[8px] font-mono text-primary/60 uppercase tracking-widest">
                        VPN Active: Tokyo_Proxy_4
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="size-1.5 bg-primary rounded-full" />
                    <span className="text-[8px] font-mono text-primary/60 uppercase tracking-widest">
                        Encryption: AES-256-GCM
                    </span>
                </div>
            </div>
        </div>
    );
}
