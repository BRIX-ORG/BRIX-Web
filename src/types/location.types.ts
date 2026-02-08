import type { ApiResponse } from './api.types';

// Address object structure from LocationIQ
export interface LocationAddress {
    name?: string;
    house_number?: string;
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    city_district?: string;
    locality?: string;
    town?: string;
    state?: string;
    postcode?: string;
    country: string;
    country_code: string;
}

// Location suggestion from LocationIQ
export interface LocationSuggestion {
    place_id: string;
    osm_id: string;
    osm_type: string;
    licence: string;
    lat: string;
    lon: string;
    boundingbox: [string, string, string, string]; // [minLat, maxLat, minLon, maxLon]
    class: string;
    type: string;
    display_name: string;
    display_place: string;
    display_address: string;
    address: LocationAddress;
}

// Autocomplete Request Parameters
export interface LocationAutocompleteRequest {
    q: string; // Search query string (required)
    limit?: number; // Limit the number of returned results (default: 10)
    countrycodes?: string; // Comma-separated ISO 3166-1 alpha-2 codes (e.g., "vn,us")
    normalizecity?: 0 | 1; // Normalize city value (0 or 1)
    lang?: string; // 2-digit language code (e.g., "en", "vi")
}

// Autocomplete Response
export type LocationAutocompleteResponse = ApiResponse<LocationSuggestion[]>;
