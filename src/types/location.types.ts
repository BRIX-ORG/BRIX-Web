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

// Reverse Geocoding Request Parameters
export interface LocationReverseRequest {
    lat: number; // Latitude of the location
    lon: number; // Longitude of the location
    addressdetails?: number; // Include a breakdown of the address into elements (0 or 1)
    lang?: string; // Preferred language for showing search results
    normalizeaddress?: number; // Makes parsing of the address object easier (0 or 1)
}

// Reverse Geocoding address (simplified shape from API)
export interface LocationReverseAddress {
    lat: string;
    lon: string;
    displayName: string;
    country: string;
}

// Reverse Geocoding Data
export interface LocationReverseData {
    place_id: string;
    licence: string;
    osm_type?: string;
    osm_id?: string;
    lat: string;
    lon: string;
    display_name: string;
    address: LocationReverseAddress;
    boundingbox: string[];
}

// Reverse Geocoding Response
export type LocationReverseResponse = ApiResponse<LocationReverseData>;
