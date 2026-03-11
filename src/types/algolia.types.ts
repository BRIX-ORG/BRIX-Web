/**
 * Algolia Search Record Types
 * Matches exactly what the backend pushes to each index.
 */

// ── Highlight ──────────────────────────────────────────────
export interface AlgoliaHighlightValue {
    value: string;
    matchLevel: 'none' | 'partial' | 'full';
    matchedWords: string[];
    fullyHighlighted?: boolean;
}

export type AlgoliaHighlightResult<T> = {
    [K in keyof T]?: AlgoliaHighlightValue;
};

// ── Media Object ───────────────────────────────────────────
export interface AlgoliaMediaObject {
    url?: string;
    width?: number;
    height?: number;
    format?: string;
    publicId?: string;
}

// ── Index: users ───────────────────────────────────────────
export interface AlgoliaUserRecord {
    objectID: string;
    fullname: string;
    username: string;
    avatar: AlgoliaMediaObject | null;
    background: AlgoliaMediaObject | null;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    // _geoloc?: GeoFilter;
    _geoloc?: { lat: number; lng: number };
    _highlightResult?: {
        fullname?: AlgoliaHighlightValue;
        username?: AlgoliaHighlightValue;
    };
}

// ── Index: bricks ──────────────────────────────────────────
export interface AlgoliaBrickRecord {
    objectID: string;
    title: string | null;
    description: string | null;
    generativeDescription: string | null;
    isPublic: boolean;
    createdAt: number; // milliseconds timestamp

    // Media
    watermark: AlgoliaMediaObject | null;
    thumbnails: AlgoliaMediaObject | null;
    media: AlgoliaMediaObject | null;
    mediaType: 'IMAGE' | 'VIDEO' | 'GLTF' | string;
    tagType: 'ART' | 'REALTIME' | 'PRODUCT' | string;

    // Geo
    latitude: number | null;
    longitude: number | null;
    _geoloc?: { lat: number; lng: number };

    // Author (flattened)
    userId: string;
    fullname: string;
    username: string;
    avatar: AlgoliaMediaObject | null;
    gender: 'MALE' | 'FEMALE' | 'OTHER';

    _highlightResult?: {
        title?: AlgoliaHighlightValue;
        description?: AlgoliaHighlightValue;
        generativeDescription?: AlgoliaHighlightValue;
        fullname?: AlgoliaHighlightValue;
        username?: AlgoliaHighlightValue;
    };
}

// ── Date Filter ─────────────────────────────────────────────
export type DateFilterType = 'none' | 'day' | 'month' | 'year';

// ── Geo Filter ──────────────────────────────────────────────
export interface GeoFilter {
    lat: number;
    lng: number;
    radiusMeters: number; // e.g. 5000 = 5km
}
