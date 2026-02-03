'use client';

import Image from 'next/image';
import { Share2 } from 'lucide-react';
import { Map, MapMarker, MarkerContent, MarkerTooltip, MapControls } from '@/components/ui/Map';

// Pulsing marker for active nodes
function PulsingMarker({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = {
        sm: 'size-2',
        md: 'size-3',
        lg: 'size-4',
    };

    return (
        <div className="relative">
            {/* Pulse ring */}
            <div
                className={`absolute inset-0 ${sizeClasses[size]} bg-primary rounded-full animate-ping opacity-75`}
            />
            {/* Core */}
            <div
                className={`relative ${sizeClasses[size]} bg-primary rounded-full border border-background shadow-[0_0_8px_#00eeff]`}
            />
        </div>
    );
}

// Node locations for the mini map
const nodeLocations = [
    { id: 1, city: 'Tokyo', lat: 35.6895, lng: 139.6917, status: 'active' },
    { id: 2, city: 'New York', lat: 40.7128, lng: -74.006, status: 'active' },
    { id: 3, city: 'London', lat: 51.5074, lng: -0.1276, status: 'syncing' },
    { id: 4, city: 'Berlin', lat: 52.52, lng: 13.405, status: 'active' },
    { id: 5, city: 'Singapore', lat: 1.3521, lng: 103.8198, status: 'active' },
];

const bentoItems = [
    {
        id: 1,
        type: 'large',
        title: 'Nexus Plaza Core',
        hash: '0x72...9F',
        coords: '40.7128° N, 74.0060° W',
        verified: true,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDb_ZNE0Wzkz4kTWB69wgwVfYniEcbajWc9SJ1fVyWS9XwmTRV3WquOmw_hIvxjG3-89weHVDjgMniWKH5IxkiRXoePgiyxVfgLnZzDt9tEVD4iFNyCbTD6piiJ1pEZQA9oe-2BtSuHfFX0VUCaPGuHK19RxhR69yA6kP1Ej5bf8eSNzn5A4GOcjaIXbxvlgn0zLdp5f0bmVt5PQuRRP6F6ajWVv2eTFOBUrhAIVxiydx4qDjN26sb_I995qwyNqJBYBSLZbIPMbAc',
        timestamp: '2023-10-27 14:22:01 UTC',
        blockId: '9928374',
        originNode: 'NYC_04',
    },
    {
        id: 2,
        type: 'square',
        verified: true,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAczzuNdG4lqiqri7O6IscVkY1POVfSTJKs7c-8jbMxgnaXGybvqgJfrrNF90vqKtihIOLJ_2MvoX97LYN97HaWO1NJPTlCdh6cRIB3V8Dsj6J5GKqX25FffXHNSTFevjc8V5aFrtWVYoolZbZZD4LdUjWYJW9Ar9YxJaZxK8DJzcLh6bF-wPTYohDAgCIDY8tuqGRWXimbafTdps_fauYgE8tWNT0yqei03IixM_3EUQDV8UMaVi9ONeXj5BgjJqpizooKkVCKN8A',
    },
    {
        id: 3,
        type: 'square',
        signature: '09923...AD',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGigkrixKqLLaTdkqN_joE2cpfi8CUu-vIGO4zvAC8ox7sE3wCHYuyFSyvkm4fpfoUwsb7ybvtzf34QNH2MoB3a9zTrfuYRwhM4r20mgT9XaCFFs5E_WQACbJ7umJfNUhjAEqF41zI5EcAbp-wK01q30onuBHP8RdR9WqYkQSqk5bzfvT8NK_289tLMgpguNxuEZvJNqopuDIH3M7o59fpkVWs56HaxdkjUQJHdOFmBmvscdhOHoWyJN3UK79_NaWZ9vhFzKeVz6I',
    },
    {
        id: 4,
        type: 'wide',
        title: 'Sublevel Synthesis',
        location: 'TOKYO',
        blockId: 'BLOCK_882',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA46CgRFvtFY_Ao0qhO9aWsr40VrxxSr0_EkG5WUCxhgGjiomD3NSN2_nzKow-Dy5LB0Km6r-NXrXIllZLLPvdqbuZhvwkUMu3WrtJ3GLlQDI7DirpEMMUWY7XmyC6nnW3Zoz3bvbbRjthIlGuAIblozQ-UsebIU-i2V4KQt-w3-FXRQ09JTN9khJBMT3WO22zvE0s4eCo_EYzKuVPKkcRUiJSTHY-U71CEbyxsCyvHE9PU2joYvqZiFVQgDsl7m6c35aCdtOvQ3aw',
    },
    {
        id: 5,
        type: 'tall',
        title: 'Titanium H-01',
        verified: true,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4Qs33oMWR1svDpp1MstahyNCqs_TX8SX-zpkPVRKT-8MKGvnR6hX8FbYVjSfkJj2fN66iVn-G8roruOVHx95WWF4E4qLI_Q-zIUhi5Vs_wA0i1XRy_SaMFDe2tIW6719Ep9Iu7s7uKjH6odnVcN9zRE0k_KTNIBbc6Ze58DAuAG4xvEvcZkX61XVnFMODW26MJIlMvmXr67Lzol2p9y6G195gSo3IoEAmBpGysxqXVcvmGQLs0Dca_KN1BQqyk0uf3oY9UU-G4uc',
    },
    {
        id: 6,
        type: 'square',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtFayfjZqIKnhmFUdHmvtVdzC_NeqtplFVFH5wdHZp8ajJGLLwN8WW1Y1qFXaedGuMGGfKlBEIdyytSCSqEV_2hMheBLnRHZX8dSU_ixaP9x0ppOTFtqoXCary39T5M1oJxMAu_-XXl0G0ZumBlJC6RDDERbszf6nc29hhrTNRg04-qnJVeMGpqTgFesId-gWJFliCAnRypvfCTzKiyXTEh-O5FkSGBGNpHn8NFdjqa673drbcplaijrx6oepaZKvs9ZrkCYW_axk',
    },
    {
        id: 7,
        type: 'square',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAo71Pw8JWudmO5sfe4OS62UwbZzJMNcagE2viCt6kHm3S7ggkoY6u57S9IJautEOXtC9-4SUdj-p0b4ATMkuoKiTcGmtNUZHol250w8QZdsrJGSQVbzhanTrYKeZ0vYUgN2sZ9e5PztWI7D8gcKhi934qfvMnrfHiWJIdsUe9L-noktZFxgKAG3xY0smMtZdLxHitttSM9ePC5Jybsn5iz1NkF38VSBTeNdXEWDvvbB8yk2m7RAyNyNpywGNRerZznPWN18m1ri0g',
    },
];

const verificationFeed = [
    { title: 'Block #9928374 Added', time: 'Just now', location: 'London, UK', active: true },
    { title: 'Batch Proof Validated', time: '2m ago', location: 'Berlin, DE', active: true },
    { title: 'Node NYC_04 Syncing', time: '5m ago', location: 'New York, US', active: false },
];

const filterTags = ['#Realtime', '#DigitalArt', '#Product'];

export default function DashboardPage() {
    return (
        <div className="flex">
            {/* Main Feed Area */}
            <div className="flex-1 overflow-y-auto">
                {/* Header & Filters */}
                <div className="px-4 md:px-8 pt-6 md:pt-8 pb-4">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl md:text-4xl font-bold tracking-tighter uppercase mb-2">
                                Global Feed
                            </h1>
                            <p className="text-muted-foreground text-xs md:text-sm font-mono">
                                LIVE_VERIFICATION_STREAM_NODES: [STABLE]
                            </p>
                        </div>
                        <div className="flex gap-2 bg-muted p-1 border border-border rounded overflow-x-auto">
                            {filterTags.map((tag, index) => (
                                <button
                                    key={tag}
                                    className={`px-3 md:px-4 py-1 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded transition-colors whitespace-nowrap ${
                                        index === 0
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bento Grid Feed - Responsive */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 pb-12">
                        {bentoItems.map((item) => (
                            <div
                                key={item.id}
                                className={`group relative border border-border bg-muted overflow-hidden hover:border-primary/40 transition-colors ${
                                    item.type === 'large'
                                        ? 'sm:col-span-2 sm:row-span-2 min-h-50 sm:min-h-120'
                                        : item.type === 'wide'
                                          ? 'sm:col-span-2 min-h-50 sm:min-h-60'
                                          : item.type === 'tall'
                                            ? 'sm:row-span-2 min-h-75 sm:min-h-120'
                                            : 'min-h-50 sm:min-h-60'
                                }`}
                            >
                                <Image
                                    src={item.image}
                                    alt={item.title || 'Verified content'}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-background/40" />

                                {/* Verified Badge */}
                                {item.verified && (
                                    <div className="absolute top-3 left-3 flex items-center gap-2 px-2 py-1 bg-background/80 border border-green-500/50 rounded-sm">
                                        <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[10px] font-mono text-green-500 uppercase font-bold tracking-tighter">
                                            Verified_Block
                                        </span>
                                    </div>
                                )}

                                {/* Coords */}
                                {item.coords && (
                                    <div className="absolute top-3 right-3 text-[10px] font-mono text-foreground/80 bg-background/80 px-2 py-1 border border-border">
                                        {item.coords}
                                    </div>
                                )}

                                {/* Signature */}
                                {item.signature && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-background/90 p-2 border-t border-border">
                                        <p className="text-[10px] font-mono text-muted-foreground truncate">
                                            AUTH_SIGNATURE: {item.signature}
                                        </p>
                                    </div>
                                )}

                                {/* Title Card for large/wide items */}
                                {item.title && item.type !== 'tall' && (
                                    <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-background/80 backdrop-blur-sm">
                                        <div className="px-3 py-2 flex justify-between items-center">
                                            <span className="text-xs font-bold tracking-widest uppercase">
                                                {item.title}
                                            </span>
                                            {item.hash && (
                                                <span className="text-[10px] font-mono text-primary">
                                                    HASH: {item.hash}
                                                </span>
                                            )}
                                        </div>
                                        {item.timestamp && (
                                            <div className="bg-primary/5 py-1 border-t border-border overflow-hidden">
                                                <p className="text-[9px] font-mono text-primary/70 uppercase tracking-[0.2em] animate-marquee whitespace-nowrap">
                                                    TIMESTAMP: {item.timestamp} {' // '}
                                                    BLOCK_ID: {item.blockId} {' // '}
                                                    ORIGIN_NODE: {item.originNode} {' // '}
                                                    DATA_INTEGRITY: 99.9%
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Title Card for tall items */}
                                {item.title && item.type === 'tall' && (
                                    <div className="absolute inset-0 flex flex-col justify-end p-4">
                                        <div className="bg-background/90 border border-border p-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="size-1 bg-green-500" />
                                                <span className="text-[9px] font-mono text-green-500 uppercase">
                                                    Verified Asset
                                                </span>
                                            </div>
                                            <p className="text-xs uppercase font-bold">
                                                {item.title}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Export button for wide items */}
                                {item.type === 'wide' && (
                                    <div className="absolute top-3 right-3">
                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-background/80 border border-primary/30">
                                            <Share2 className="size-3 text-primary" />
                                            <span className="text-[9px] font-mono">EXPORT</span>
                                        </div>
                                    </div>
                                )}

                                {/* Hover overlay for simple items */}
                                {!item.title && !item.signature && (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/40 backdrop-blur-[2px]">
                                        <button className="bg-primary text-primary-foreground px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                                            View Block
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Sidebar */}
            <aside className="hidden xl:flex w-72 border-l border-border bg-background flex-col shrink-0">
                {/* Origin Topology Map */}
                <div className="p-6 border-b border-border">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">
                        Origin Topology
                    </h3>
                    <div className="relative w-full aspect-square border border-primary/20 overflow-hidden rounded-sm">
                        <Map
                            center={[30, 20]}
                            zoom={0.8}
                            minZoom={0.5}
                            maxZoom={3}
                            scrollZoom={false}
                            dragRotate={false}
                            pitchWithRotate={false}
                        >
                            {/* Node markers */}
                            {nodeLocations.map((node) => (
                                <MapMarker key={node.id} longitude={node.lng} latitude={node.lat}>
                                    <MarkerContent>
                                        <PulsingMarker
                                            size={node.status === 'syncing' ? 'lg' : 'sm'}
                                        />
                                    </MarkerContent>
                                    <MarkerTooltip>
                                        <div className="text-center">
                                            <p className="font-display font-bold text-[10px]">
                                                {node.city}
                                            </p>
                                            <p className="text-[9px] text-primary font-mono">
                                                {node.status === 'syncing'
                                                    ? 'SYNCING...'
                                                    : 'ACTIVE'}
                                            </p>
                                        </div>
                                    </MarkerTooltip>
                                </MapMarker>
                            ))}

                            {/* Map Controls */}
                            <MapControls position="bottom-right" showZoom />
                        </Map>

                        {/* Status overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-2 z-10">
                            <p className="text-[10px] font-mono text-primary text-center">
                                LOCALIZING_ACTIVE_UPLOADS...
                            </p>
                        </div>
                    </div>
                </div>

                {/* Verification Feed */}
                <div className="p-6">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">
                        Verification Feed
                    </h3>
                    <div className="space-y-4">
                        {verificationFeed.map((item, index) => (
                            <div key={index} className="flex gap-3">
                                <div
                                    className={`size-1.5 mt-1.5 rounded-full shrink-0 ${
                                        item.active ? 'bg-green-500' : 'bg-primary/40'
                                    }`}
                                />
                                <div>
                                    <p
                                        className={`text-[11px] font-bold uppercase tracking-tight ${
                                            !item.active ? 'text-muted-foreground' : ''
                                        }`}
                                    >
                                        {item.title}
                                    </p>
                                    <p className="text-[10px] font-mono text-muted-foreground">
                                        {item.time} • {item.location}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pro Upgrade Card */}
                <div className="mt-auto p-6 border-t border-border">
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-sm">
                        <p className="text-[10px] font-mono text-primary mb-1 font-bold">
                            BRIX_PRO_STATUS
                        </p>
                        <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed font-medium">
                            Elevate your node ranking and unlock raw metadata access.
                        </p>
                        <button className="w-full bg-primary/20 hover:bg-primary/30 border border-primary/50 py-2 text-[10px] font-bold uppercase tracking-widest text-primary transition-all">
                            Upgrade Security
                        </button>
                    </div>
                </div>
            </aside>
        </div>
    );
}
