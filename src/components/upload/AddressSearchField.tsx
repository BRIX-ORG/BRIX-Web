'use client';

import { useRef, useEffect, useMemo } from 'react';
import { MapPin, Loader2, X, Search } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useLocationAutocomplete } from '@/hooks/apis/location.api';
import { cn } from '@/utils/classnames';
import type { LocationSuggestion } from '@/types/location.types';

interface AddressSearchFieldProps {
    value: string;
    onChange: (value: string) => void;
    onSelect: (location: LocationSuggestion) => void;
    onClear: () => void;
    error?: string;
    disabled?: boolean;
    isTyping: boolean;
    setIsTyping: (value: boolean) => void;
}

export function AddressSearchField({
    value,
    onChange,
    onSelect,
    onClear,
    error,
    disabled,
    isTyping,
    setIsTyping,
}: AddressSearchFieldProps) {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const debouncedQuery = useDebounce(value, 500);

    const { data: addressSuggestions, isLoading: isSearching } = useLocationAutocomplete(
        {
            q: debouncedQuery,
            limit: 8,
            normalizecity: 1,
            lang: 'en',
        },
        debouncedQuery.length >= 3 && isTyping,
    );

    const suggestions = useMemo(() => addressSuggestions || [], [addressSuggestions]);
    const shouldShowDropdown = useMemo(
        () => suggestions.length > 0 && debouncedQuery.length >= 3 && isTyping,
        [suggestions, debouncedQuery, isTyping],
    );

    // Click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsTyping(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setIsTyping]);

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <label className="block text-xs font-mono font-medium uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Address
            </label>
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-muted-foreground/50">
                    <MapPin className="size-4" />
                </div>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        setIsTyping(true);
                    }}
                    onFocus={() => {
                        if (value.length >= 3 && suggestions.length > 0) {
                            setIsTyping(true);
                        }
                    }}
                    placeholder="Search for an address or auto-detected from GPS..."
                    disabled={disabled}
                    className={cn(
                        'w-full bg-muted border border-border rounded-sm font-cabin text-foreground',
                        'pl-10 pr-10 py-3 text-sm transition-all',
                        'focus:outline-none focus:border-primary/50 focus:shadow-[0_0_15px_rgba(0,238,255,0.3)]',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        error ? 'border-red-400' : '',
                    )}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center gap-2">
                    {isSearching ? (
                        <Loader2 className="size-4 animate-spin text-primary" />
                    ) : value && !disabled ? (
                        <button
                            type="button"
                            onClick={onClear}
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

            {/* Dropdown */}
            {shouldShowDropdown && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-muted/95 backdrop-blur-sm border border-border rounded-sm shadow-[0_0_20px_rgba(0,238,255,0.2)] max-h-75 overflow-y-auto">
                    {suggestions.map((location: LocationSuggestion, index: number) => (
                        <button
                            key={`${location.place_id}-${index}`}
                            type="button"
                            onClick={() => onSelect(location)}
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
}
