'use client';

import { PlusCircle } from 'lucide-react';
import { ContactItem, Contact } from './ContactItem';

// Mock data for demo
const mockContacts: Contact[] = [
    {
        id: '1',
        name: 'NeonViper',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIm21OR215emlg5aAsy_pA1wk3ev_Lz_GuU7rdXrAImNX7jMzl686cc2Vp6maE2Je1dhD6SgiaS2FELXU7fxHgF8QYBa5-y0on4GPolUvPJHacwxhRs0tQL4s0DuRnw0Hyo24OVjfDYOlyAgtAe3cm7iYxFfrzAwWL2ELPA2T_rLeAgXAfFtK73uZ39c-tJ5w5_9m5esJerEQxnJ__cl9Xht18BJbJRSu7vlOVe1lom1aoR-c1_az5MmGcWM4PXw8hqapD363EzZI',
        lastMessage: 'Dropped the brick. Copy?',
        time: '2m',
        isOnline: true,
        isActive: true,
    },
    {
        id: '2',
        name: 'Cypher',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-udIvopAatUn7kZR1sTprT2fquuNO3ccYx9kI_2SIdBpsOdy2UGv2jxYanjcO9ugAB7n0HoTTtCIXfDzLKk6Lyrvb6Elz3yaWpCPBiwjT316p-DwLYTOSIruikNNCgwFaYkOId3Sh7YrFwH-UBCpFhx2t5hXTxTAEaYsFh4h7EzAQc6SLTt3dY51IBBVNEUync7y6Hx80SybLEHiIx-G4pTPCGKfzn9SzFDJJvx0BnV5mQ82pEpQsk0Ogw4xrsSVN0qk9K0tL0X8',
        lastMessage: 'Secure link established...',
        time: '14h',
        isOnline: false,
    },
    {
        id: '3',
        name: 'Glitch_01',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkl4EYI7sn7sNTL6aTgnsgzS4h1QAX3kUCwmFtxZarChvTp2C6cVL3JC7R8nUHVnnYBsLB62bB-MVniUkGJZS-Y0y2esS1uchvYP9VKpxgcJfXcBh4LsDYS7R4IZGka6TlUvneFUH0ad995PcigreoALOcf5w-2-maAGTzqtbQLt1SfNeXg_4Q_a4YlWZM3rKQgzJIb1HowfKwPjh9saJvbMgmyGbOdVcw0fOIQasyy1f2CYeLLs48rOZ6RJ-kd9hGyTMXa7eyhOc',
        lastMessage: 'Sent 3 encrypted files',
        time: '2d',
        isOnline: false,
    },
];

interface ContactsSidebarProps {
    onSelectContact?: (contact: Contact) => void;
}

export function ContactsSidebar({ onSelectContact }: ContactsSidebarProps) {
    const activeContacts = mockContacts.filter((c) => c.isOnline);
    const offlineContacts = mockContacts.filter((c) => !c.isOnline);

    return (
        <aside className="w-72 border-r border-border bg-background flex flex-col">
            {/* Active Sessions */}
            <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold tracking-widest text-primary/60 uppercase">
                        Active Sessions
                    </span>
                    <button className="hover:text-primary transition-colors">
                        <PlusCircle className="size-4 text-primary" />
                    </button>
                </div>

                <div className="space-y-1">
                    {activeContacts.length > 0 ? (
                        activeContacts.map((contact) => (
                            <ContactItem
                                key={contact.id}
                                contact={contact}
                                onClick={() => onSelectContact?.(contact)}
                            />
                        ))
                    ) : (
                        <p className="text-[10px] text-muted-foreground/50 font-mono uppercase tracking-widest text-center py-3">
                            No active sessions
                        </p>
                    )}
                </div>
            </div>

            {/* Offline / Inactive */}
            <div className="p-4 flex-1 overflow-y-auto">
                <span className="text-[10px] font-bold tracking-widest text-muted-foreground/50 uppercase mb-4 block">
                    Offline
                </span>

                <div className="space-y-1">
                    {offlineContacts.length > 0 ? (
                        offlineContacts.map((contact) => (
                            <ContactItem
                                key={contact.id}
                                contact={contact}
                                onClick={() => onSelectContact?.(contact)}
                            />
                        ))
                    ) : (
                        <p className="text-[10px] text-muted-foreground/50 font-mono uppercase tracking-widest text-center py-3">
                            No offline contacts
                        </p>
                    )}
                </div>
            </div>

            {/* System Node Status */}
            <div className="mt-auto p-4 border-t border-border">
                <div className="bg-muted/30 p-3 rounded border border-border">
                    <p className="text-[10px] font-bold text-primary mb-1 uppercase tracking-tighter">
                        System Node: LA_02
                    </p>
                    <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                        <div className="bg-primary h-full w-2/3 shadow-[0_0_5px_#00eeff]" />
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-2 font-mono uppercase tracking-widest">
                        Signal Strength: 88%
                    </p>
                </div>
            </div>
        </aside>
    );
}
