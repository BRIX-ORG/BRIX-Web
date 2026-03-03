/** Shared utility functions for artist brick cards */

export function formatCoord(value: number | null | undefined, pos: string, neg: string): string {
    if (value == null) return '—';
    const abs = Math.abs(value).toFixed(4);
    return `${abs}° ${value >= 0 ? pos : neg}`;
}

export function formatTimestamp(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[1].split('.')[0] + ' UTC';
}

export function generateHash(title: string): string {
    if (!title) return '0x00000...000000';
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
        hash = (hash << 5) - hash + title.charCodeAt(i);
        hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    return `0x${hex.slice(0, 5)}...${hex.slice(-6)}`;
}
