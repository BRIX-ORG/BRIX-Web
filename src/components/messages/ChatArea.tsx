'use client';

import { useState, useCallback } from 'react';
import { ChatHeader } from './ChatHeader';
import { MessageBubble, Message } from './MessageBubble';
import { BrickMessage, BrickData } from './BrickMessage';
import { MessageInput } from './MessageInput';

// Mock data
const initialMessages: Message[] = [
    {
        id: '1',
        content:
            'The drop location has changed. LA-GRID sector 7 is too hot. High surveillance drones spotted.',
        sender: 'other',
        senderName: 'NEON_VIPER',
        senderAvatar:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuDnEHcr0lTkRKOa3b29Whyb35l5qE6MFVMRNtqO2LAVedu2_kdBxnV-zXQxJIxxClZUlr7an-pVJFLI_ku_5kAb3R9GRNRvFB_W-M2HMzEuSIdsc9yqeDBh_wb-28CgaeR2SuGHXfnkkO2stxqMH8U2xDyUIjaOrpUOSnUubdNJ2KB_YaGLvL-EKtiMA56TzL2PGDnHzwLou1f79jv7eoWgfRfEN1-ID79RpfS2r1hvq0Auo__8gVkUGSiDBa6OLmhWgHjPXozQaZI',
        reactions: [
            { emoji: '🔥', count: 2, reacted: false },
            { emoji: '👀', count: 1, reacted: true },
        ],
    },
    {
        id: '2',
        content: "Understood. Where is the new drop? I'm already in transit.",
        sender: 'me',
        status: 'delivered',
        reactions: [],
    },
];

const mockBrick: BrickData = {
    id: 'brick-1',
    imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCZsq-9ejljNACQGDFTbvxyAJ23iD0sHamYCcnjbmXDfTMWyfEF_JpEu-6jT9frgLnrx_pb5O0KbuU0ReOOcZArRSINAukwLcRzrr2R1rHJRuM6gX9u_f8DjkZHcKd0uKgs3S5YPFfJrmQ21mFbww9CX9zu1xWSRz2Y6ZkZcWaTlFS7SCCQ8OYWoTyOoo9UVjnBs3cum4Jc7Ab4Vgbi5Bhxe74uB2u5tDsFqS2TAqlCmKRIltKUPKh6_FS9HcbWmvAkP07YEG5rjek',
    latitude: '34.0522° N',
    longitude: '118.2437° W',
    fileRef: 'IMG_882.BRICK',
    altitude: '42M MSL',
    caption: "Check the coordinates. It's an old industrial basement. Access code: 1088.",
    senderName: 'NEON_VIPER',
    senderAvatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAsxw0NA3HXdDQQvEWbtIDwkhb0VY-qEW_A28hjvvW_JC7psH6jqNJhbEYThk5tU7pGvPXJG82eCkHCTo3eM6dk1XdRgNgCxhg1OGma3auF44IIXHkIRYsRNx7GJ4k6TsqZzIJNnUWIHjVl8gDRSsOShujPtvGYg8ObDPnDrZ1bQDhc1bae7Azy_2ovOcUykZud6qndcJoTgkDpEy_5ZeP6yQbB9WAKdFLhICEcfYneBrfdKZlaSXQ59KK84XGbLGqCtEktFcb9zm8',
};

interface ChatAreaProps {
    userName?: string;
}

export function ChatArea({ userName = 'NEON_VIPER' }: ChatAreaProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);

    const handleSend = (message: string) => {
        console.log('Send message:', message);
        // TODO: Implement message sending
    };

    const handleReaction = useCallback((messageId: string, emoji: string) => {
        setMessages((prev) =>
            prev.map((msg) => {
                if (msg.id !== messageId) return msg;
                const reactions = [...(msg.reactions ?? [])];
                const existing = reactions.find((r) => r.emoji === emoji);
                if (existing) {
                    if (existing.reacted) {
                        existing.count -= 1;
                        existing.reacted = false;
                        if (existing.count <= 0) {
                            return {
                                ...msg,
                                reactions: reactions.filter((r) => r.emoji !== emoji),
                            };
                        }
                    } else {
                        existing.count += 1;
                        existing.reacted = true;
                    }
                    return { ...msg, reactions: [...reactions] };
                }
                return { ...msg, reactions: [...reactions, { emoji, count: 1, reacted: true }] };
            }),
        );
    }, []);

    return (
        <section className="flex-1 flex flex-col bg-background/50">
            {/* Header */}
            <ChatHeader userName={userName} isOnline />

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* System Divider */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[9px] font-mono text-muted-foreground font-bold uppercase tracking-widest">
                        Yesterday 23:58 UTC
                    </span>
                    <div className="flex-1 h-px bg-border" />
                </div>

                {/* Messages */}
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} onReaction={handleReaction} />
                ))}

                {/* Brick Share */}
                <BrickMessage brick={mockBrick} />
            </div>

            {/* Input */}
            <MessageInput onSend={handleSend} />
        </section>
    );
}
