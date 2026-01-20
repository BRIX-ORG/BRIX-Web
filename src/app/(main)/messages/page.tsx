import { MessagesHeader, ContactsSidebar, ChatArea, UserInfoSidebar } from '@/components/messages';

export default function MessagesPage() {
    return (
        <div className="h-screen flex flex-col overflow-hidden bg-background font-display text-foreground">
            {/* Header */}
            <MessagesHeader />

            {/* Main Content */}
            <main className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Contacts */}
                <ContactsSidebar />

                {/* Center - Chat Area */}
                <ChatArea />

                {/* Right Sidebar - User Info */}
                <UserInfoSidebar />
            </main>
        </div>
    );
}
