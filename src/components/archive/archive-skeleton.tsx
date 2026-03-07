'use client';

export function ArchiveSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
                <div
                    key={i}
                    className="bg-background/40 border border-primary/10 rounded-lg overflow-hidden animate-pulse"
                >
                    <div className="aspect-video bg-primary/5" />
                    <div className="px-3 py-3 space-y-2">
                        <div className="h-3 bg-primary/10 rounded w-3/4" />
                        <div className="h-2 bg-primary/5 rounded w-1/2" />
                    </div>
                    <div className="px-3 py-2 border-t border-primary/5 flex justify-between">
                        <div className="h-2 bg-primary/5 rounded w-1/4" />
                        <div className="h-2 bg-primary/5 rounded w-1/4" />
                    </div>
                </div>
            ))}
        </div>
    );
}
