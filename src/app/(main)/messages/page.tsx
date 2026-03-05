'use client';

import { useState } from 'react';
import { MessagesHeader, ContactsSidebar, ChatArea, UserInfoSidebar } from '@/components/messages';
import { ChatSocketProvider } from '@/providers/ChatSocketProvider';
import { useChatStore } from '@/stores/chat-store';
import { cn } from '@/utils/classnames';

export default function MessagesPage() {
    const [showInfo, setShowInfo] = useState(false);
    const currentConversationId = useChatStore((s) => s.currentConversationId);

    return (
        <ChatSocketProvider>
            <div className="h-screen flex flex-col overflow-hidden bg-background font-display text-foreground">
                {/* Header */}
                <MessagesHeader />

                {/* Main Content */}
                <main className="flex-1 flex overflow-hidden relative">
                    {/* Left Sidebar - Contacts */}
                    <div
                        className={cn(
                            'w-full md:w-auto md:block',
                            currentConversationId ? 'hidden md:block' : 'block',
                        )}
                    >
                        <ContactsSidebar />
                    </div>

                    {/* Center - Chat Area */}
                    <div
                        className={cn(
                            'flex-1 min-w-0 h-full',
                            currentConversationId ? 'block' : 'hidden md:block',
                        )}
                    >
                        <ChatArea onToggleInfo={() => setShowInfo((prev) => !prev)} />
                    </div>

                    {/* Right Sidebar - User Info */}
                    {showInfo && currentConversationId && (
                        <div className="hidden lg:block">
                            <UserInfoSidebar onClose={() => setShowInfo(false)} />
                        </div>
                    )}
                </main>
            </div>
        </ChatSocketProvider>
    );
}
