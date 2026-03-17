export function AlbumSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
                <div
                    key={i}
                    className="bg-background/50 border border-border/30 rounded-xl overflow-hidden animate-pulse"
                >
                    {/* Thumbnail skeleton */}
                    <div className="aspect-4/3 bg-muted/30" />
                    {/* Info skeleton */}
                    <div className="p-4 space-y-3">
                        <div className="h-4 bg-muted/40 rounded w-3/4" />
                        <div className="h-3 bg-muted/30 rounded w-full" />
                        <div className="flex items-center justify-between pt-1">
                            <div className="h-3 bg-muted/20 rounded w-20" />
                            <div className="h-6 bg-muted/20 rounded-full w-16" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
