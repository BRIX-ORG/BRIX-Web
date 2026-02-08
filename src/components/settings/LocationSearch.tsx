'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, MapPin, Loader2, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useLocationAutocomplete } from '@/hooks/apis/location.api';
import type { LocationSuggestion } from '@/types/location.types';

interface LocationSearchProps {
    onSelect: (location: LocationSuggestion) => void;
    label?: string;
    placeholder?: string;
    defaultValue?: string;
    className?: string;
    required?: boolean;
    error?: string;
    disabled?: boolean;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
    onSelect,
    label,
    placeholder = 'Search for a location...',
    defaultValue = '',
    className = '',
    required = false,
    error,
    disabled = false,
}) => {
    const [query, setQuery] = useState(defaultValue);
    const [isUserTyping, setIsUserTyping] = useState(false);
    const debouncedQuery = useDebounce(query, 500);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { data, isLoading } = useLocationAutocomplete(
        {
            q: debouncedQuery,
            limit: 10,
            countrycodes: 'vn',
            normalizecity: 1,
            lang: 'vi',
        },
        !disabled && debouncedQuery.length >= 3 && isUserTyping,
    );

    const suggestions = useMemo(() => data || [], [data]);

    // Derive dropdown visibility from current state instead of syncing
    const shouldShowDropdown = useMemo(() => {
        return suggestions.length > 0 && debouncedQuery.length >= 3 && isUserTyping;
    }, [suggestions, debouncedQuery, isUserTyping]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsUserTyping(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (location: LocationSuggestion) => {
        setQuery(location.display_name);
        setIsUserTyping(false);
        onSelect(location);
    };

    const handleClear = () => {
        setQuery('');
        setIsUserTyping(false);
    };

    return (
        <div className={`w-full relative ${className}`} ref={dropdownRef}>
            {label && (
                <label className="block text-xs font-mono font-medium uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    {label} {required && <span className="text-red-400">*</span>}
                </label>
            )}
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-muted-foreground/50">
                    <MapPin className="size-4" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsUserTyping(true);
                    }}
                    onFocus={() => {
                        if (query.length >= 3 && suggestions.length > 0) {
                            setIsUserTyping(true);
                        }
                    }}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`
                        w-full bg-muted border border-border rounded-sm font-cabin text-foreground
                        pl-10 pr-10 py-3 text-sm transition-all
                        focus:outline-none focus:border-primary/50 focus:shadow-[0_0_15px_rgba(0,238,255,0.3)]
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${error ? 'border-red-400' : ''}
                    `}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center gap-2">
                    {isLoading ? (
                        <Loader2 className="size-4 animate-spin text-primary" />
                    ) : query && !disabled ? (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-muted-foreground/50 hover:text-foreground transition-colors"
                        >
                            <X className="size-4" />
                        </button>
                    ) : (
                        <Search className="size-4 text-muted-foreground/50" />
                    )}
                </div>
            </div>

            {error && <p className="mt-1.5 text-xs text-red-400 font-mono">{error}</p>}

            {shouldShowDropdown && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-muted/95 backdrop-blur-sm border border-border rounded-sm shadow-[0_0_20px_rgba(0,238,255,0.2)] max-h-75 overflow-y-auto">
                    {suggestions.map((location, index) => (
                        <button
                            key={`${location.place_id}-${index}`}
                            type="button"
                            onClick={() => handleSelect(location)}
                            className="w-full text-left px-4 py-3 hover:bg-primary/10 flex items-start gap-3 border-b border-border/50 last:border-0 transition-colors"
                        >
                            <MapPin className="size-4 mt-0.5 text-primary shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground font-cabin">
                                    {location.display_place || location.address.name}
                                </p>
                                <p className="text-xs text-muted-foreground truncate font-mono">
                                    {location.display_address}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
