interface MetadataPanelProps {
    fileData?: {
        resolution?: string;
        bitDepth?: string;
        colorSpace?: string;
        aperture?: string;
        iso?: string;
        shutter?: string;
        hash?: string;
        timestamp?: string;
        geoTag?: string;
        aiProbability?: string;
    };
    isProcessing?: boolean;
}

export function MetadataPanel({ fileData, isProcessing = false }: MetadataPanelProps) {
    return (
        <div className="bg-muted border border-border flex flex-col h-full min-h-125">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-bold tracking-[0.2em] uppercase flex items-center gap-2">
                    <span className="size-2 bg-primary animate-pulse" />
                    Metadata Analysis
                </h2>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 font-mono text-[11px] overflow-y-auto space-y-4">
                {/* Image Stream Data */}
                <div className="space-y-1">
                    <p className="text-primary/60 uppercase text-[9px] mb-2 font-bold tracking-widest border-b border-primary/20 pb-1">
                        Image Stream Data
                    </p>
                    <div className="flex justify-between border-b border-border/50 py-1">
                        <span className="text-muted-foreground">RESOLUTION:</span>
                        <span className="text-foreground/80">
                            {fileData?.resolution || '-- x --'}
                        </span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 py-1">
                        <span className="text-muted-foreground">BIT_DEPTH:</span>
                        <span className="text-foreground/80">{fileData?.bitDepth || '--'}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 py-1">
                        <span className="text-muted-foreground">COLOR_SPACE:</span>
                        <span className="text-primary">{fileData?.colorSpace || '--'}</span>
                    </div>
                </div>

                {/* Raw EXIF Stream */}
                <div className="space-y-1 pt-4">
                    <p className="text-secondary/60 uppercase text-[9px] mb-2 font-bold tracking-widest border-b border-secondary/20 pb-1">
                        Raw EXIF Stream
                    </p>
                    <div className="bg-black/50 p-3 text-muted-foreground leading-relaxed break-all">
                        <p>
                            {fileData?.aperture || 'f/--'} {fileData?.iso || 'ISO --'}{' '}
                            {fileData?.shutter || '--'}
                        </p>
                        <p>0x48 0x65 0x6c 0x6c 0x6f 0x20 0x57 0x6f 0x72 0x6c 0x64</p>
                        <p className="mt-2 text-primary/40">
                            GEN_HASH: {fileData?.hash || 'awaiting_file...'}
                        </p>
                        <p className="text-primary/40">TIMESTAMP: {fileData?.timestamp || '--'}</p>
                        <p className="text-primary/40">GEO_TAG: {fileData?.geoTag || '--'}</p>
                        <p className="mt-2 text-secondary/40">
                            AI_PROBABILITY: {fileData?.aiProbability || '--'}
                        </p>
                        <p className="text-secondary/40">ARTIFACT_SCAN: NO_ANOMALIES</p>
                    </div>
                </div>

                {/* System Logs */}
                <div className="space-y-1 pt-4">
                    <p className="text-muted-foreground/50 uppercase text-[9px] mb-2 font-bold tracking-widest border-b border-border pb-1">
                        System Logs
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 italic">
                        {isProcessing ? 'Processing file...' : 'Waiting for file initialization...'}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 italic">
                        Listening on port 8080...
                    </p>
                    <div className="w-full bg-muted h-1 mt-4">
                        <div
                            className="bg-primary h-full shadow-[0_0_8px_#00eeff] transition-all"
                            style={{ width: isProcessing ? '66%' : '33%' }}
                        />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-black/40 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-muted-foreground">
                        INTEGRITY_CHECK
                    </span>
                    <span className="text-[10px] font-bold text-primary">PENDING</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground">
                        NETWORK_LATENCY
                    </span>
                    <span className="text-[10px] font-bold text-foreground/80">14MS</span>
                </div>
            </div>
        </div>
    );
}
