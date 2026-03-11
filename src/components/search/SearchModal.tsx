'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import type { SearchParamsObject, SearchMethodParams } from 'algoliasearch';
import { Search, X, Calendar, MapPin, SlidersHorizontal, Loader2 } from 'lucide-react';
import { algoliaClient, ALGOLIA_INDICES } from '@/lib/algolia';
import { useDebounce } from '@/hooks/useDebounce';
import {
    AlgoliaBrickCard,
    AlgoliaUserCard,
    GeoMapPicker,
    ResultSkeleton,
    UserSkeleton,
    SectionLabel,
} from '@/components/search';
import { cn } from '@/utils/classnames';
import { getDateNumericFilter } from '@/utils/algolia';
import type {
    AlgoliaBrickRecord,
    AlgoliaUserRecord,
    GeoFilter,
    DateFilterType,
} from '@/types/algolia.types';

// ─── Types ──────────────────────────────────────────────────
type TabType = 'all' | 'bricks' | 'people';

interface SearchResults {
    users: AlgoliaUserRecord[];
    bricks: AlgoliaBrickRecord[];
    isLoading: boolean;
}

// ─── Main Modal ──────────────────────────────────────────────
interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [dateFilterType, setDateFilterType] = useState<DateFilterType>('none');
    const [dateFilterValue, setDateFilterValue] = useState('');
    const [geoEnabled, setGeoEnabled] = useState(false);
    const [geoFilter, setGeoFilter] = useState<GeoFilter | null>(null);
    const [radius, setRadius] = useState(5000);
    const [results, setResults] = useState<SearchResults>({
        users: [],
        bricks: [],
        isLoading: false,
    });
    const debouncedQuery = useDebounce(query, 300);
    const inputRef = useRef<HTMLInputElement>(null);

    // Wrap onClose to reset all transient state before closing
    const handleClose = useCallback(() => {
        setQuery('');
        setDateFilterType('none');
        setDateFilterValue('');
        setGeoEnabled(false);
        setGeoFilter(null);
        setRadius(5000);
        setResults({ users: [], bricks: [], isLoading: false });
        onClose();
    }, [onClose]);

    // Focus input when opened
    useEffect(() => {
        if (!isOpen) return;
        const t = setTimeout(() => inputRef.current?.focus(), 100);
        return () => clearTimeout(t);
    }, [isOpen]);

    const fetchSearch = useCallback(async (): Promise<Omit<SearchResults, 'isLoading'> | null> => {
        const hasGeo = geoEnabled && !!geoFilter;
        // Date filter is active if a specific mode is chosen AND the user has entered some value
        const hasDate = dateFilterType !== 'none' && dateFilterValue.trim() !== '';

        if (!debouncedQuery.trim() && !hasGeo && !hasDate) return { users: [], bricks: [] };
        const requests: SearchMethodParams['requests'] = [];

        // Users don't have date properties, so only search them if no date filter is active
        if (!hasDate) {
            const userParams: SearchParamsObject = {
                hitsPerPage: 5,
                attributesToHighlight: ['fullname', 'username'],
            };

            if (hasGeo && geoFilter) {
                userParams.aroundLatLng = `${geoFilter.lat},${geoFilter.lng}`;
                userParams.aroundRadius = radius;
            }

            requests.push({
                indexName: ALGOLIA_INDICES.USERS,
                query: debouncedQuery,
                ...userParams,
            });
        }

        const brickParams: SearchParamsObject = {
            hitsPerPage: 8,
            attributesToHighlight: [
                'title',
                'description',
                'generativeDescription',
                'fullname',
                'username',
            ],
        };

        if (hasDate) {
            const dateF = getDateNumericFilter(dateFilterValue, dateFilterType);
            if (dateF) brickParams.filters = dateF;
        }

        if (hasGeo && geoFilter) {
            brickParams.aroundLatLng = `${geoFilter.lat},${geoFilter.lng}`;
            brickParams.aroundRadius = radius;
        }

        requests.push({
            indexName: ALGOLIA_INDICES.BRICKS,
            query: debouncedQuery,
            ...brickParams,
        });

        const response = await algoliaClient.search({ requests });

        let usersHits: AlgoliaUserRecord[] = [];
        let bricksHits: AlgoliaBrickRecord[] = [];

        if (!hasDate) {
            usersHits = (response.results[0] as { hits: AlgoliaUserRecord[] }).hits ?? [];
            bricksHits = (response.results[1] as { hits: AlgoliaBrickRecord[] }).hits ?? [];
        } else {
            // Only bricks were queried because there is a date filter
            bricksHits = (response.results[0] as { hits: AlgoliaBrickRecord[] }).hits ?? [];
        }

        return { users: usersHits, bricks: bricksHits };
    }, [debouncedQuery, dateFilterType, dateFilterValue, geoEnabled, geoFilter, radius]);

    // setState is called exclusively inside .then()/.catch() callbacks (async callbacks),
    // never synchronously in the effect body — satisfies the react-compiler rule.
    useEffect(() => {
        if (!isOpen) return;
        // Start loading via a resolved Promise so the call is in an async callback
        void Promise.resolve().then(() => setResults((prev) => ({ ...prev, isLoading: true })));
        fetchSearch()
            .then((data) => {
                setResults(
                    data
                        ? { ...data, isLoading: false }
                        : { users: [], bricks: [], isLoading: false },
                );
            })
            .catch((err: unknown) => {
                console.error('[Algolia] Search error:', err);
                setResults({ users: [], bricks: [], isLoading: false });
            });
    }, [
        debouncedQuery,
        dateFilterType,
        dateFilterValue,
        geoEnabled,
        geoFilter,
        radius,
        isOpen,
        fetchSearch,
    ]);

    // Escape key — subscribes to external DOM event, the correct pattern for useEffect.
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClose();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, handleClose]);

    const hasQuery = debouncedQuery.trim().length > 0 || geoEnabled;
    const totalResults = results.users.length + results.bricks.length;
    const showBricks = activeTab === 'all' || activeTab === 'bricks';
    const showUsers = activeTab === 'all' || activeTab === 'people';

    if (!isOpen) return null;

    const modal = (
        <div className="fixed inset-0 z-[9999] flex flex-col">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={onClose} />

            {/* Panel */}
            <div className="relative z-10 flex flex-col w-full max-w-5xl mx-auto mt-16 max-h-[85vh] bg-background border border-border rounded-2xl shadow-[0_0_60px_rgba(0,238,255,0.12)] overflow-hidden">
                {/* ── Search Input ─────────────────────────── */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
                    <Search className="size-5 text-primary/60 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search users, bricks, locations..."
                        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                    />
                    {results.isLoading && (
                        <Loader2 className="size-4 text-primary/50 animate-spin shrink-0" />
                    )}
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="size-4" />
                        </button>
                    )}
                    <button onClick={onClose} className="ml-1 hidden sm:flex items-center">
                        <kbd className="text-[10px] font-mono border border-border/60 px-1.5 py-0.5 rounded text-muted-foreground/50">
                            ESC
                        </kbd>
                    </button>
                </div>

                {/* ── Tabs & Filters ────────────────────────── */}
                <div className="flex items-center gap-2 px-4 py-2 border-b border-border flex-wrap shrink-0">
                    {/* Tabs */}
                    <div className="flex items-center gap-1 bg-muted/60 rounded-lg p-1">
                        {(['all', 'bricks', 'people'] as TabType[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    'px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-200',
                                    activeTab === tab
                                        ? 'bg-primary text-background shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                {tab === 'all' ? 'All' : tab === 'bricks' ? 'Bricks' : 'People'}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-1.5 ml-auto flex-wrap">
                        {/* Date filter selection */}
                        {showBricks && (
                            <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-1 bg-muted/60 rounded-lg p-1">
                                    <Calendar className="size-3 text-muted-foreground/60 ml-1 shrink-0" />
                                    {(['none', 'day', 'month', 'year'] as DateFilterType[]).map(
                                        (d) => (
                                            <button
                                                key={d}
                                                onClick={() => {
                                                    setDateFilterType(d);
                                                    setDateFilterValue(''); // Reset value when switching type
                                                }}
                                                className={cn(
                                                    'px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all',
                                                    dateFilterType === d
                                                        ? 'bg-secondary/80 text-white'
                                                        : 'text-muted-foreground hover:text-foreground',
                                                )}
                                            >
                                                {d === 'none' ? 'All' : d}
                                            </button>
                                        ),
                                    )}
                                </div>

                                {/* Conditional Date Input */}
                                {dateFilterType !== 'none' && (
                                    <input
                                        type="text"
                                        placeholder={
                                            dateFilterType === 'day'
                                                ? 'DD/MM/YYYY'
                                                : dateFilterType === 'month'
                                                  ? 'MM/YYYY'
                                                  : 'YYYY'
                                        }
                                        value={dateFilterValue}
                                        onChange={(e) => setDateFilterValue(e.target.value)}
                                        className="bg-muted/60 text-xs text-foreground border border-border rounded-lg outline-none ring-0 placeholder:text-muted-foreground/50 w-32 px-2 py-1 focus:border-primary/50 transition-colors"
                                    />
                                )}
                            </div>
                        )}

                        {/* Geo toggle */}
                        {showBricks && (
                            <button
                                onClick={() => setGeoEnabled((v) => !v)}
                                className={cn(
                                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 border',
                                    geoEnabled
                                        ? 'bg-primary/10 border-primary/40 text-primary'
                                        : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground',
                                )}
                            >
                                <MapPin className="size-3" />
                                Geo
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Geo Search Panel ─────────────────────── */}
                {geoEnabled && showBricks && (
                    <div className="border-b border-border px-4 py-3 space-y-3 shrink-0">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <SlidersHorizontal className="size-3" />
                                Click map to set center point
                            </p>
                            <span className="text-xs font-mono text-primary">
                                {radius >= 1000 ? `${radius / 1000}km radius` : `${radius}m radius`}
                            </span>
                        </div>

                        {/* Map picker — use onMapClick via MapControls + imperative ref instead */}
                        <GeoMapPicker
                            center={geoFilter ? [geoFilter.lng, geoFilter.lat] : [105.8, 21.0]}
                            markerPos={
                                geoFilter ? { lat: geoFilter.lat, lng: geoFilter.lng } : null
                            }
                            zoom={geoFilter ? 11 : 4}
                            onPick={(lat, lng) => setGeoFilter({ lat, lng, radiusMeters: radius })}
                        />

                        {/* Radius slider */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] text-muted-foreground/60 font-mono">
                                <span>1km</span>
                                <span>Radius</span>
                                <span>100km</span>
                            </div>
                            <input
                                type="range"
                                min={1000}
                                max={100000}
                                step={1000}
                                value={radius}
                                onChange={(e) => {
                                    const r = Number(e.target.value);
                                    setRadius(r);
                                    if (geoFilter)
                                        setGeoFilter((f) => (f ? { ...f, radiusMeters: r } : null));
                                }}
                                className="w-full accent-primary cursor-pointer"
                            />
                        </div>

                        {geoFilter && (
                            <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground/60">
                                <span>
                                    {geoFilter.lat.toFixed(4)}, {geoFilter.lng.toFixed(4)}
                                </span>
                                <button
                                    onClick={() => setGeoFilter(null)}
                                    className="text-primary/60 hover:text-primary transition-colors"
                                >
                                    Clear point
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Results ──────────────────────────────── */}
                <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 space-y-5">
                    {/* Empty state */}
                    {!hasQuery && (
                        <div className="text-center py-12 space-y-2">
                            <Search className="size-8 text-muted-foreground/20 mx-auto" />
                            <p className="text-sm text-muted-foreground/50">
                                Type to search users and bricks
                            </p>
                            <p className="text-xs text-muted-foreground/30">
                                Or enable Geo to find nearby bricks
                            </p>
                        </div>
                    )}

                    {/* No results */}
                    {hasQuery && !results.isLoading && totalResults === 0 && (
                        <div className="text-center py-12 space-y-2">
                            <Search className="size-8 text-muted-foreground/20 mx-auto" />
                            <p className="text-sm text-muted-foreground/50">No results found</p>
                            <p className="text-xs text-muted-foreground/30">
                                Try different keywords or adjust filters
                            </p>
                        </div>
                    )}

                    {/* People */}
                    {showUsers && (
                        <>
                            {results.isLoading && (
                                <div>
                                    <SectionLabel>People</SectionLabel>
                                    <UserSkeleton />
                                </div>
                            )}
                            {!results.isLoading && results.users.length > 0 && (
                                <div>
                                    <SectionLabel count={results.users.length}>People</SectionLabel>
                                    <div className="space-y-2">
                                        {results.users.map((hit) => (
                                            <AlgoliaUserCard
                                                key={hit.objectID}
                                                hit={hit}
                                                onClick={onClose}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Bricks */}
                    {showBricks && (
                        <>
                            {results.isLoading && (
                                <div>
                                    <SectionLabel>Bricks</SectionLabel>
                                    <ResultSkeleton />
                                </div>
                            )}
                            {!results.isLoading && results.bricks.length > 0 && (
                                <div>
                                    <SectionLabel count={results.bricks.length}>
                                        Bricks
                                    </SectionLabel>
                                    <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 w-full">
                                        {results.bricks.map((hit) => (
                                            <AlgoliaBrickCard
                                                key={hit.objectID}
                                                hit={hit}
                                                className="mb-4 break-inside-avoid"
                                                onClick={() => {
                                                    onClose();
                                                    router.push(`/dashboard/brick/${hit.objectID}`);
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-border flex items-center justify-between shrink-0">
                    <p className="text-[10px] text-muted-foreground/30 font-mono">
                        Powered by Algolia
                    </p>
                    {hasQuery && !results.isLoading && (
                        <p className="text-[10px] text-muted-foreground/40 font-mono">
                            {totalResults} result{totalResults !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}
