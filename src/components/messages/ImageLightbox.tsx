'use client';

import Image from 'next/image';
import { X } from 'lucide-react';

interface ImageLightboxProps {
    src: string;
    onClose: () => void;
}

export function ImageLightbox({ src, onClose }: ImageLightboxProps) {
    return (
        <div
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 size-10 flex items-center justify-center bg-muted/80 border border-border rounded-full text-foreground hover:text-primary transition-colors z-10"
            >
                <X className="size-5" />
            </button>
            <div
                className="relative max-w-[90vw] max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <Image
                    src={src}
                    alt="Full size image"
                    width={1200}
                    height={900}
                    className="max-w-[90vw] max-h-[90vh] object-contain rounded"
                />
            </div>
        </div>
    );
}
