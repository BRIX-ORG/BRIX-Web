'use client';

import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AuditLogEntry {
    id: string;
    timestamp: string;
    message: string;
    type: 'info' | 'warning' | 'error';
}

interface AuditLogSidebarProps {
    logs: AuditLogEntry[];
    nodeUptime?: string;
    traffic?: string;
}

export function AuditLogSidebar({
    logs,
    nodeUptime = '99.99%',
    traffic = '2.4 TB',
}: AuditLogSidebarProps) {
    return (
        <aside className="w-80 border-l border-border flex flex-col bg-background/40 backdrop-blur-xl">
            {/* Header */}
            <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-primary">
                        Live Security Audit
                    </h3>
                    <div className="flex items-center gap-1.5">
                        <span className="size-2 bg-primary rounded-full animate-pulse" />
                        <span className="text-[10px] text-primary/70 font-mono">LIVE</span>
                    </div>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                        className="w-full bg-muted/50 border border-border rounded text-xs font-mono pl-10 pr-3 py-2 placeholder:text-muted-foreground/50 focus:ring-primary focus:border-primary outline-none"
                        placeholder="Search logs..."
                        type="text"
                    />
                </div>
            </div>

            {/* Log Entries */}
            <div className="flex-1 overflow-y-auto p-4 font-mono text-[10px] space-y-3 leading-relaxed">
                {logs.map((log) => (
                    <div
                        key={log.id}
                        className={cn(
                            'flex gap-2',
                            log.type === 'error' && 'text-secondary/80 bg-secondary/5 p-1 rounded',
                            log.type === 'warning' && 'text-yellow-500/80',
                            log.type === 'info' && 'text-muted-foreground',
                        )}
                    >
                        <span
                            className={cn(
                                log.type === 'error' ? 'text-secondary' : 'text-primary/60',
                            )}
                        >
                            [{log.timestamp}]
                        </span>
                        <span>{log.message}</span>
                    </div>
                ))}
            </div>

            {/* Node Status Footer */}
            <div className="p-6 bg-muted/50 border-t border-border">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">
                        Node Status
                    </span>
                    <span className="text-[10px] text-primary uppercase font-bold">
                        Encrypted Connection
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted rounded p-2 text-center">
                        <p className="text-[8px] text-muted-foreground uppercase">Uptime</p>
                        <p className="text-xs font-mono">{nodeUptime}</p>
                    </div>
                    <div className="bg-muted rounded p-2 text-center">
                        <p className="text-[8px] text-muted-foreground uppercase">Traffic</p>
                        <p className="text-xs font-mono">{traffic}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
