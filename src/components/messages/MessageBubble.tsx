import Image from 'next/image';
import { cn } from '@/types/utils';

export interface Message {
    id: string;
    content: string;
    sender: 'me' | 'other';
    senderName?: string;
    senderAvatar?: string;
    timestamp?: string;
    status?: 'sent' | 'delivered' | 'read';
}

interface MessageBubbleProps {
    message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const isMe = message.sender === 'me';

    return (
        <div className={cn('flex items-end gap-3 max-w-[80%]', isMe && 'justify-end ml-auto')}>
            {/* Other's Avatar */}
            {!isMe && message.senderAvatar && (
                <Image
                    src={message.senderAvatar}
                    alt={`Avatar for ${message.senderName}`}
                    width={32}
                    height={32}
                    className="size-8 rounded bg-muted shrink-0 object-cover"
                />
            )}

            <div className={cn('flex flex-col gap-1', isMe && 'items-end')}>
                {/* Sender Name */}
                {!isMe && message.senderName && (
                    <p className="text-[10px] font-bold text-muted-foreground ml-1">
                        {message.senderName.toUpperCase()}
                    </p>
                )}

                {/* Message Bubble */}
                <div
                    className={cn(
                        'p-4 rounded-sm text-sm leading-relaxed',
                        isMe
                            ? 'bg-primary/5 border border-primary/30 text-foreground text-right'
                            : 'bg-muted/80 border border-border text-foreground',
                    )}
                >
                    {message.content}
                </div>

                {/* Status */}
                {isMe && message.status && (
                    <p className="text-[10px] font-bold text-primary/40 mr-1">
                        YOU · {message.status.toUpperCase()}
                    </p>
                )}
            </div>

            {/* My Avatar */}
            {isMe && (
                <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJ88P-FRzRf5zWL-X7tVPXUoS7SecoZ0T8oQNlph_gPcslfG_0XG5X2PqjO9rxoiBsMHl5v8Qtfovp1O6-NHU4BiErUvaTlAMtitIAY242y3QbFa_WdsAOwT6LwW0uYjOv-l_am_ZsPltu-HhKIkPNstXI5ySKQf2_oJDuRzPjjLNo8-PAY_QqtTzj0od_f0PxIr9l56bHUtzBb0D5jNyo0MVk5NIbJyTO_Ay8kTFpNTpZCpILouj2uFZoTlbeymSVa9NsTWTHSZ8"
                    alt="Your avatar"
                    width={32}
                    height={32}
                    className="size-8 rounded shrink-0 border border-primary/20 object-cover"
                />
            )}
        </div>
    );
}
