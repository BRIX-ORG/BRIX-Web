'use client';

import { Shield, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface UploadControlsProps {
    isReady?: boolean;
    onToggleReady?: (ready: boolean) => void;
    onUpload?: () => void;
    isUploading?: boolean;
}

export function UploadControls({
    isReady = true,
    onToggleReady,
    onUpload,
    isUploading = false,
}: UploadControlsProps) {
    const t = useTranslations('uploads');
    return (
        <div className="flex flex-wrap items-center justify-between p-6 bg-muted border border-border">
            <div className="flex items-center gap-4">
                {/* Ready Toggle */}
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                        {t('form.readyForBlockchain')}
                    </span>
                    <label className="inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isReady}
                            onChange={(e) => onToggleReady?.(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="relative w-12 h-6 bg-muted-foreground/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute `after:top-0.5 after:start-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                    </label>
                </div>

                <div className="h-8 w-px bg-border mx-2" />

                {/* Status */}
                <div className="flex items-center gap-2">
                    <Shield className="size-4 text-primary" />
                    <span className="text-[10px] font-bold tracking-widest text-primary uppercase">
                        {t('preview.phase2Ready')}
                    </span>
                </div>
            </div>

            {/* Upload Button */}
            <button
                onClick={onUpload}
                disabled={isUploading}
                className="glow-button bg-linear-to-r from-primary to-secondary px-12 py-4 text-primary-foreground text-sm font-black tracking-[0.25em] uppercase flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <span>{isUploading ? t('form.uploading') : t('form.verifyUpload')}</span>
                <Zap className="size-4" />
            </button>
        </div>
    );
}
