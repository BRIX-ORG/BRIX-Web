/** Relative time formatting utilities */

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

/**
 * Returns a human-readable relative time string (e.g. "2m ago", "3h ago", "5d ago").
 * Falls back to a short date for anything older than 1 year.
 */
export function timeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = Date.now();
    const diff = now - date.getTime();

    if (diff < 0) return 'just now';
    if (diff < MINUTE) return `${Math.floor(diff / SECOND)}s ago`;
    if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`;
    if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
    if (diff < WEEK) return `${Math.floor(diff / DAY)}d ago`;
    if (diff < MONTH) return `${Math.floor(diff / WEEK)}w ago`;
    if (diff < YEAR) return `${Math.floor(diff / MONTH)}mo ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Returns a formatted date string: "Mar 3, 2026 at 14:49"
 */
export function formatDateTime(dateStr: string): string {
    const date = new Date(dateStr);
    const datePart = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
    const timePart = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
    return `${datePart} at ${timePart}`;
}
