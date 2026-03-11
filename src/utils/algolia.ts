import type { DateFilterType } from '@/types/algolia.types';

export function getDateNumericFilter(dateStr: string, type: DateFilterType): string | null {
    if (type === 'none' || !dateStr || dateStr.trim() === '') return null;

    let start: Date;
    let end: Date;

    const parts = dateStr.split('/').map((p) => parseInt(p, 10));

    if (parts.length === 3) {
        // DD/MM/YYYY
        const [d, m, y] = parts;
        if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
        start = new Date(y, m - 1, d, 0, 0, 0, 0);
        end = new Date(y, m - 1, d, 23, 59, 59, 999);
    } else if (parts.length === 2) {
        // MM/YYYY
        const [m, y] = parts;
        if (isNaN(m) || isNaN(y)) return null;
        start = new Date(y, m - 1, 1, 0, 0, 0, 0);
        end = new Date(y, m, 0, 23, 59, 59, 999);
    } else if (parts.length === 1 && dateStr.length === 4) {
        // YYYY
        const y = parts[0];
        if (isNaN(y)) return null;
        start = new Date(y, 0, 1, 0, 0, 0, 0);
        end = new Date(y, 11, 31, 23, 59, 59, 999);
    } else {
        return null;
    }

    return `createdAt >= ${start.getTime()} AND createdAt <= ${end.getTime()}`;
}
