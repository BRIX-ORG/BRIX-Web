export function ResultSkeleton() {
    return (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 w-full">
            {[0, 1, 2, 3].map((i) => (
                <div
                    key={i}
                    className="bg-muted border border-border flex flex-col overflow-hidden rounded-xl mb-4 break-inside-avoid animate-pulse"
                >
                    <div className="p-3 border-b border-border flex items-center justify-between bg-background/50">
                        <div className="h-3 w-16 bg-primary/10 rounded" />
                        <div className="h-3 w-12 bg-primary/10 rounded hidden sm:block" />
                    </div>
                    <div className="flex-1 p-3 flex items-start justify-center">
                        <div className="w-full max-w-sm bg-background/95 border border-border/30 rounded-lg overflow-hidden">
                            <div className="p-1">
                                <div className="aspect-4/3 w-full bg-primary/10 rounded-sm" />
                            </div>
                            <div className="p-3 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="h-4 bg-primary/10 rounded w-1/2" />
                                    <div className="h-3 bg-primary/10 rounded w-1/4" />
                                </div>
                                <div className="h-3 bg-primary/10 rounded w-full" />
                                <div className="h-3 bg-primary/10 rounded w-2/3" />
                                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                                    <div className="size-5 rounded-full bg-primary/10" />
                                    <div className="h-3 bg-primary/10 rounded w-1/3" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function UserSkeleton() {
    return (
        <div className="space-y-2 animate-pulse">
            {[0, 1].map((i) => (
                <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted"
                >
                    <div className="size-10 rounded-xl bg-primary/10 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-primary/10 rounded w-2/3" />
                        <div className="h-2 bg-primary/10 rounded w-1/3" />
                    </div>
                </div>
            ))}
        </div>
    );
}
