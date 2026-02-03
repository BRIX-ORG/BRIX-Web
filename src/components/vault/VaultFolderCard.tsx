import { LucideIcon, ChevronRight, Key } from 'lucide-react';
import { cn } from '@/utils/classnames';

export interface VaultFolder {
    id: string;
    title: string;
    icon: LucideIcon;
    fileCount: number;
    size: string;
    protocol: string;
    status: 'encrypted' | 'locked';
}

interface VaultFolderCardProps {
    folder: VaultFolder;
    onClick?: () => void;
}

export function VaultFolderCard({ folder, onClick }: VaultFolderCardProps) {
    const isLocked = folder.status === 'locked';

    return (
        <div
            onClick={onClick}
            className={cn(
                'group relative bg-muted border border-border rounded-xl p-5 transition-all cursor-pointer',
                isLocked
                    ? 'hover:border-secondary/50 hover:shadow-[0_0_15px_rgba(188,0,255,0.2)]'
                    : 'hover:border-primary/50 hover:shadow-[0_0_15px_rgba(0,238,255,0.2)]',
            )}
        >
            <div className="flex justify-between items-start mb-6">
                <div
                    className={cn(
                        'size-12 rounded flex items-center justify-center group-hover:scale-110 transition-transform',
                        isLocked ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary',
                    )}
                >
                    <folder.icon className="size-7" />
                </div>
                <div
                    className={cn(
                        'text-[10px] px-2 py-0.5 rounded font-mono uppercase font-bold border',
                        isLocked
                            ? 'bg-secondary/10 border-secondary/20 text-secondary'
                            : 'bg-primary/10 border-primary/20 text-primary',
                    )}
                >
                    {isLocked ? 'On-Chain Locked' : 'Encrypted'}
                </div>
            </div>
            <h4 className="text-base font-bold mb-1">{folder.title}</h4>
            <p className="text-muted-foreground text-[11px] font-mono mb-4">
                {folder.fileCount} Files • {folder.size}
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-[10px] text-muted-foreground font-mono">
                    {folder.protocol}
                </span>
                {isLocked ? (
                    <Key className="size-4 text-muted-foreground group-hover:text-secondary" />
                ) : (
                    <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary" />
                )}
            </div>
        </div>
    );
}
