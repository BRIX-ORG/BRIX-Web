'use client';

import { Globe } from 'lucide-react';
import { Map, MapMarker, MarkerContent } from '@/components/ui/map';

interface GlobalActivityWidgetProps {
    activeNodes?: number;
    latestLocation?: string;
    latestTime?: string;
}

export function GlobalActivityWidget({
    activeNodes = 14288,
    latestLocation = 'Neo-Seoul, KR',
    latestTime = '2s',
}: GlobalActivityWidgetProps) {
    // Sample marker locations
    const markers = [
        { lng: 126.978, lat: 37.5665 }, // Seoul
        { lng: -122.4194, lat: 37.7749 }, // SF
        { lng: 139.6917, lat: 35.6895 }, // Tokyo
        { lng: -0.1276, lat: 51.5074 }, // London
        { lng: 2.3522, lat: 48.8566 }, // Paris
    ];

    return (
        <aside className="fixed bottom-8 right-8 z-40 hidden xl:block w-72">
            <div className="bg-muted border border-border rounded-xl p-4 shadow-2xl backdrop-blur-lg">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Globe className="size-5 text-primary" />
                        <h5 className="text-xs font-black uppercase tracking-widest text-foreground">
                            Global Activity
                        </h5>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                        <span className="size-1.5 bg-primary rounded-full animate-pulse" />
                        Live
                    </span>
                </div>

                {/* Map */}
                <div className="relative w-full aspect-4/3 rounded-lg border border-border overflow-hidden mb-4">
                    <Map center={[20, 30]} zoom={1} interactive={false}>
                        {markers.map((marker, i) => (
                            <MapMarker key={i} longitude={marker.lng} latitude={marker.lat}>
                                <MarkerContent className="size-3 bg-primary rounded-full shadow-[0_0_10px_#00eeff] animate-pulse" />
                            </MapMarker>
                        ))}
                    </Map>
                </div>

                {/* Stats */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">
                            Active Nodes
                        </span>
                        <span className="text-[10px] text-foreground font-mono">
                            {activeNodes.toLocaleString()}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">
                            Network Pulse
                        </span>
                        <div className="flex gap-1">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-1 h-3 bg-primary rounded-full" />
                            ))}
                            {[4, 5].map((i) => (
                                <div key={i} className="w-1 h-3 bg-primary/30 rounded-full" />
                            ))}
                        </div>
                    </div>
                    <div className="pt-2 border-t border-border">
                        <p className="text-[9px] text-muted-foreground leading-tight">
                            Latest upload in{' '}
                            <span className="text-foreground">{latestLocation}</span> ({latestTime}{' '}
                            ago)
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
