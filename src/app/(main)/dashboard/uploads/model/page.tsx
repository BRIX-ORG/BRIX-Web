'use client';

import { UploadTabs } from '@/components/upload';
import { GlbUploadForm } from '@/components/upload/GlbUploadForm';

export default function ModelUploadPage() {
    return (
        <div className="p-8 max-w-350 mx-auto w-full">
            {/* Page Header */}
            <div className="w-full mb-8">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-2 italic">
                    BRIX_MODEL_UPLOAD_CENTER
                </h1>
                <p className="text-secondary text-xs tracking-[0.3em] font-medium uppercase opacity-80">
                    3D Model Processing Pipeline — GLB Upload Protocol v1.0
                </p>
            </div>

            {/* Tabs */}
            <UploadTabs />

            {/* GLB Upload Form */}
            <GlbUploadForm />

            {/* Footer decoration */}
            <div className="w-full mt-8 flex items-center gap-4 opacity-30">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[9px] font-mono text-muted-foreground tracking-widest uppercase">
                    BRIX_UPLOAD_PROTOCOL_v2.4.0
                </span>
                <div className="flex-1 h-px bg-border" />
            </div>
        </div>
    );
}
