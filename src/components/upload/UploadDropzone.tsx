'use client';

import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadDropzoneProps {
    onFileSelect?: (files: FileList) => void;
    className?: string;
}

export function UploadDropzone({ onFileSelect, className }: UploadDropzoneProps) {
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files?.length) {
            onFileSelect?.(e.dataTransfer.files);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            onFileSelect?.(e.target.files);
        }
    };

    return (
        <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className={cn(
                'glitch-border neon-grid relative group overflow-hidden aspect-video flex flex-col items-center justify-center p-12 bg-muted/40',
                className,
            )}
        >
            {/* Scanline effect */}
            <div className="absolute top-0 left-0 w-full h-0.5 bg-primary/10 pointer-events-none" />

            {/* Corner decorations */}
            <div className="absolute top-4 left-4 text-[10px] text-primary/30 font-mono">
                00:00:00:45 // FRAME_ACTIVE
            </div>
            <div className="absolute top-4 right-4 text-[10px] text-primary/30 font-mono">
                SIGNAL_STRENGTH: 98%
            </div>
            <div className="absolute bottom-4 left-4 text-[10px] text-primary/30 font-mono tracking-widest uppercase">
                BRIX_ENCRYPTION_ENABLED
            </div>
            <div className="absolute bottom-4 right-4 text-[10px] text-primary/30 font-mono uppercase">
                SECURE_TUNNEL_04
            </div>

            {/* Content */}
            <div className="flex flex-col items-center gap-8 relative z-20">
                <div className="size-24 border-2 border-dashed border-primary/40 flex items-center justify-center group-hover:border-primary/80 transition-all duration-500">
                    <Upload className="size-12 text-primary/60 group-hover:text-primary transition-all" />
                </div>
                <div className="text-center">
                    <p className="text-foreground text-2xl font-bold tracking-[0.15em] mb-4 uppercase">
                        Initialize Asset Link
                    </p>
                    <p className="text-muted-foreground text-xs font-normal leading-relaxed max-w-[320px] mx-auto uppercase tracking-tighter">
                        Drop digital art artifacts or select from local storage. Neon Cyan grid
                        monitoring active for integrity.
                    </p>
                </div>
                <label className="bg-primary/10 border border-primary text-primary px-10 py-3 text-xs font-bold tracking-[0.2em] uppercase hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer">
                    Select File
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileInput}
                    />
                </label>
            </div>
        </div>
    );
}
