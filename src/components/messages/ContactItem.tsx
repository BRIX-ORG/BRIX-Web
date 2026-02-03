import Image from 'next/image';
import { cn } from '@/utils/classnames';

export interface Contact {
    id: string;
    name: string;
    avatar: string;
    lastMessage: string;
    time: string;
    isOnline?: boolean;
    isActive?: boolean;
}

interface ContactItemProps {
    contact: Contact;
    onClick?: () => void;
}

export function ContactItem({ contact, onClick }: ContactItemProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                'flex items-center gap-3 p-3 rounded cursor-pointer transition-all',
                contact.isActive
                    ? 'bg-primary/10 border border-primary/30'
                    : 'hover:bg-muted/50 border border-transparent group',
            )}
        >
            {/* Avatar with online indicator */}
            <div className="relative">
                <Image
                    src={contact.avatar}
                    alt={`Avatar for ${contact.name}`}
                    width={40}
                    height={40}
                    className={cn(
                        'size-10 rounded bg-muted object-cover',
                        !contact.isActive && 'opacity-70 group-hover:opacity-100',
                    )}
                />
                {contact.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 size-2.5 bg-primary rounded-full border-2 border-background" />
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                    <p
                        className={cn(
                            'text-sm font-bold truncate',
                            contact.isActive
                                ? 'text-foreground'
                                : 'text-muted-foreground group-hover:text-foreground',
                        )}
                    >
                        {contact.name}
                    </p>
                    <span
                        className={cn(
                            'text-[9px]',
                            contact.isActive ? 'text-primary/60' : 'text-muted-foreground',
                        )}
                    >
                        {contact.time}
                    </span>
                </div>
                <p
                    className={cn(
                        'text-[11px] truncate',
                        contact.isActive ? 'text-muted-foreground' : 'text-muted-foreground/60',
                    )}
                >
                    {contact.lastMessage}
                </p>
            </div>
        </div>
    );
}
