'use client';

interface PulsingMarkerProps {
    size?: 'sm' | 'md' | 'lg';
}

export function PulsingMarker({ size = 'sm' }: PulsingMarkerProps) {
    const sizeClasses = {
        sm: 'size-2',
        md: 'size-3',
        lg: 'size-4',
    };

    return (
        <div className="relative">
            {/* Pulse ring */}
            <div
                className={`absolute inset-0 ${sizeClasses[size]} bg-primary rounded-full animate-ping opacity-75`}
            />
            {/* Core */}
            <div
                className={`relative ${sizeClasses[size]} bg-primary rounded-full border border-background shadow-[0_0_8px_#00eeff]`}
            />
        </div>
    );
}
