import { MapPin, Key } from 'lucide-react';

interface ChatHeaderProps {
    userName: string;
    isOnline?: boolean;
}

export function ChatHeader({ userName, isOnline = true }: ChatHeaderProps) {
    return (
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-background/40 backdrop-blur-sm">
            <div className="flex items-center gap-4">
                {/* Connection Status */}
                <div
                    className={`size-2 rounded-full ${isOnline ? 'bg-primary animate-pulse shadow-[0_0_8px_#00eeff]' : 'bg-muted-foreground'}`}
                />
                <div>
                    <h2 className="text-lg font-bold leading-none uppercase">{userName}</h2>
                    <p className="text-[10px] font-mono text-primary/60 tracking-widest mt-1 uppercase">
                        Secure Link Established | P2P Encrypted
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
                <button className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground hover:text-primary uppercase transition-colors">
                    <MapPin className="size-4" />
                    Track GPS
                </button>
                <button className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground hover:text-primary uppercase transition-colors">
                    <Key className="size-4" />
                    Rotate Keys
                </button>
            </div>
        </div>
    );
}
