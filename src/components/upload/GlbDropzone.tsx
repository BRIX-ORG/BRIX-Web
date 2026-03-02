'use client';

import { useCallback } from 'react';
import { Box, X } from 'lucide-react';

interface GlbDropzoneProps {
    file: File | null;
    onFileSelect: (file: File) => void;
    onRemove: () => void;
    disabled?: boolean;
}

export function GlbDropzone({ file, onFileSelect, onRemove, disabled }: GlbDropzoneProps) {
    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            if (disabled) return;
            const f = e.dataTransfer.files?.[0];
            if (f && f.name.toLowerCase().endsWith('.glb')) {
                onFileSelect(f);
            }
        },
        [disabled, onFileSelect],
    );

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const f = e.target.files?.[0];
            if (f) onFileSelect(f);
            e.target.value = '';
        },
        [onFileSelect],
    );

    return (
        <div className="bg-muted/40 border border-border overflow-hidden">
            {/* Section Header */}
            <div className="p-4 border-b border-border flex items-center gap-3">
                <Box className="size-4 text-secondary" />
                <h3 className="text-sm font-bold tracking-[0.2em] uppercase">3D Model File</h3>
                <div className="flex-1" />
                <span className="text-[9px] font-mono text-secondary/50 uppercase tracking-widest">
                    .GLB FORMAT
                </span>
            </div>

            {file ? (
                <div className="p-4">
                    <div className="flex items-center gap-4 p-4 bg-secondary/5 border border-secondary/20 rounded-sm">
                        <div className="size-12 bg-secondary/10 border border-secondary/30 flex items-center justify-center rounded-sm shrink-0">
                            <Box className="size-6 text-secondary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-foreground truncate">
                                {file.name}
                            </p>
                            <p className="text-[10px] font-mono text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB — GLB 3D Model
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onRemove}
                            disabled={disabled}
                            className="shrink-0 size-8 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 flex items-center justify-center rounded-sm transition-colors cursor-pointer disabled:opacity-50"
                        >
                            <X className="size-4 text-red-400" />
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="p-8 flex flex-col items-center justify-center gap-4 min-h-40 group cursor-pointer"
                >
                    <div className="size-16 border-2 border-dashed border-secondary/30 group-hover:border-secondary/60 flex items-center justify-center transition-all">
                        <Box className="size-8 text-secondary/40 group-hover:text-secondary/80 transition-all" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-bold tracking-[0.15em] uppercase text-foreground/60 mb-1">
                            Drop GLB File Here
                        </p>
                        <p className="text-[10px] text-muted-foreground/50 font-mono uppercase tracking-widest">
                            Or click to browse
                        </p>
                    </div>
                    <label className="bg-secondary/10 border border-secondary/30 text-secondary px-6 py-2 text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-secondary hover:text-secondary-foreground transition-all cursor-pointer">
                        Select GLB File
                        <input
                            type="file"
                            className="hidden"
                            accept=".glb"
                            onChange={handleFileInput}
                        />
                    </label>
                </div>
            )}
        </div>
    );
}
