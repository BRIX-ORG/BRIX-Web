'use client';

import { useState } from 'react';
import { UploadDropzone, MetadataPanel, UploadControls, UploadTabs } from '@/components/upload';

export default function UploadsPage() {
    const [isReady, setIsReady] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileSelect = (files: FileList) => {
        if (files.length > 0) {
            setSelectedFile(files[0]);
            console.log('File selected:', files[0].name);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        setIsUploading(true);
        // TODO: Implement actual upload logic
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setIsUploading(false);
        console.log('Upload complete');
    };

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

            {/* Main Content Grid */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Upload Area */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <UploadDropzone onFileSelect={handleFileSelect} />
                    <UploadControls
                        isReady={isReady}
                        onToggleReady={setIsReady}
                        onUpload={handleUpload}
                        isUploading={isUploading}
                    />
                </div>

                {/* Metadata Sidebar */}
                <div className="lg:col-span-4">
                    <MetadataPanel
                        isProcessing={isUploading}
                        fileData={
                            selectedFile
                                ? {
                                      resolution: '7680 x 4320',
                                      bitDepth: '32-BIT FLOAT',
                                      colorSpace: 'WIDE_GAMUT_P3',
                                      aperture: 'f/2.8',
                                      iso: 'ISO 100',
                                      shutter: '1/125s',
                                      hash: '77a1c22d9b881340b...',
                                      timestamp: new Date().toISOString(),
                                      geoTag: '51.5074° N, 0.1278° W',
                                      aiProbability: '0.04%',
                                  }
                                : undefined
                        }
                    />
                </div>
            </div>

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
