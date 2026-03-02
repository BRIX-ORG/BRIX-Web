'use client';

import { ArtUploadForm, UploadTabs } from '@/components/upload';

export default function UploadsPage() {
    return (
        <div className="p-8 max-w-350 mx-auto w-full">
            {/* Page Header */}
            <div className="w-full mb-8">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-2 italic">
                    BRIX_IMAGE_UPLOAD_CENTER
                </h1>
                <p className="text-primary text-xs tracking-[0.3em] font-medium uppercase opacity-80">
                    High-Tech Neural Art Processing Protocol v2.4.0
                </p>
            </div>

            {/* Tabs */}
            <UploadTabs />

            {/* Art Upload Form */}
            <ArtUploadForm />

            {/* Visual Decoration Footer */}
            <div className="w-full mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 opacity-30 pointer-events-none">
                <div className="h-24 border border-border flex flex-col justify-end p-2 overflow-hidden">
                    <div className="flex gap-1 h-8 items-end">
                        <div className="w-full bg-primary/20 h-1/2" />
                        <div className="w-full bg-primary/20 h-3/4" />
                        <div className="w-full bg-primary/20 h-1/3" />
                        <div className="w-full bg-primary/20 h-full" />
                    </div>
                </div>
                <div className="h-24 border border-border flex items-center justify-center p-2">
                    <div className="size-12 border border-dashed border-muted-foreground/40 rotate-45" />
                </div>
                <div className="h-24 border border-border flex flex-col justify-center p-4">
                    <div className="text-[8px] font-mono leading-none mb-1">DATA_PACKET_0091</div>
                    <div className="text-[8px] font-mono leading-none mb-1">DATA_PACKET_0092</div>
                    <div className="text-[8px] font-mono leading-none">DATA_PACKET_0093</div>
                </div>
                <div className="h-24 border border-border flex items-center justify-center p-2 relative">
                    <div className="absolute inset-2 border border-primary/10" />
                    <span className="text-[10px] font-black tracking-tighter">AUTHENTIC_BRIX</span>
                </div>
            </div>
        </div>
    );
}
