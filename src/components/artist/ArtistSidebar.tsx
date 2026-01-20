import Image from 'next/image';
import { Database, Users } from 'lucide-react';

export interface ActivityItem {
    id: string;
    type: 'mint' | 'transfer' | 'verify';
    code: string;
    description: string;
    time: string;
}

export interface Collaborator {
    id: string;
    avatar: string;
}

interface ArtistSidebarProps {
    activities: ActivityItem[];
    collaborators: Collaborator[];
    additionalCollaboratorsCount?: number;
}

export function ArtistSidebar({
    activities,
    collaborators,
    additionalCollaboratorsCount = 0,
}: ArtistSidebarProps) {
    return (
        <aside className="col-span-12 lg:col-span-3 space-y-8">
            {/* Node Activity */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-primary/60">
                    <Database className="size-4" /> Node Activity
                </h3>
                <div className="space-y-4 border-l border-primary/20 pl-4 py-2">
                    {activities.map((activity) => (
                        <div key={activity.id} className="space-y-1">
                            <p
                                className={`text-[11px] font-mono ${activity.type === 'transfer' ? 'text-secondary' : 'text-primary'}`}
                            >
                                {activity.code}
                            </p>
                            <p className="text-xs text-muted-foreground">{activity.description}</p>
                            <p className="text-[9px] font-mono text-muted-foreground/50 uppercase">
                                {activity.time}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Collaborators */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-primary/60">
                    <Users className="size-4" /> Top Collaborators
                </h3>
                <div className="flex flex-wrap gap-2">
                    {collaborators.map((collab) => (
                        <div
                            key={collab.id}
                            className="size-10 rounded-full border border-primary/30 p-0.5 hover:border-primary transition-colors cursor-pointer"
                        >
                            <Image
                                src={collab.avatar}
                                alt="Collaborator"
                                width={40}
                                height={40}
                                className="rounded-full w-full h-full object-cover"
                            />
                        </div>
                    ))}
                    {additionalCollaboratorsCount > 0 && (
                        <div className="size-10 rounded-full border border-primary/30 p-0.5 flex items-center justify-center bg-muted cursor-pointer hover:border-primary transition-colors">
                            <span className="text-[10px] font-mono">
                                +{additionalCollaboratorsCount}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
