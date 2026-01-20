'use client';

import { Camera, Mic, Send } from 'lucide-react';

interface MessageInputProps {
    onSend?: (message: string) => void;
}

export function MessageInput({ onSend }: MessageInputProps) {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const input = form.elements.namedItem('message') as HTMLInputElement;
        if (input.value.trim()) {
            onSend?.(input.value);
            input.value = '';
        }
    };

    return (
        <div className="p-6 bg-background/80 backdrop-blur-md border-t border-border">
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

                {/* Input */}
                <input
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
