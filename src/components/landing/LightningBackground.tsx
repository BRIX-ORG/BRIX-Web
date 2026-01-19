'use client';

import dynamic from 'next/dynamic';

// Dynamic import for Lightning background (WebGL)
const Lightning = dynamic(() => import('@/components/react-bits-bg/Lightning'), {
    ssr: false,
});

export function LightningBackground() {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none opacity-30">
            <Lightning
                hue={180} // Cyan hue to match BRIX primary color
                xOffset={0}
                speed={0.8}
                intensity={1.2}
                size={1.2}
            />
        </div>
    );
}
