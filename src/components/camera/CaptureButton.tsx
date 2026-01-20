'use client';

interface CaptureButtonProps {
    onClick: () => void;
    disabled?: boolean;
}

export function CaptureButton({ onClick, disabled = false }: CaptureButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="group relative transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {/* Outer frame */}
            <div className="w-16 h-16 border-2 border-primary/40 bg-primary/10 flex items-center justify-center">
                {/* Inner shutter */}
                <div className="w-8 h-8 bg-primary animate-[pulse-shutter_2s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
            </div>
            {/* Hover glow */}
            <div className="absolute inset-0 bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
    );
}
