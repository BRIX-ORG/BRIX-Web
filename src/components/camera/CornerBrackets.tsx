interface CornerBracketsProps {
    className?: string;
}

export function CornerBrackets({ className = '' }: CornerBracketsProps) {
    const bracketClass =
        'w-[60px] h-[60px] border-primary absolute shadow-[0_0_15px_rgba(0,238,255,0.3)]';

    return (
        <div className={`absolute inset-0 pointer-events-none ${className}`}>
            {/* Top Left */}
            <div className={`${bracketClass} top-0 left-0 border-t-2 border-l-2`} />
            {/* Top Right */}
            <div className={`${bracketClass} top-0 right-0 border-t-2 border-r-2`} />
            {/* Bottom Left */}
            <div className={`${bracketClass} bottom-0 left-0 border-b-2 border-l-2`} />
            {/* Bottom Right */}
            <div className={`${bracketClass} bottom-0 right-0 border-b-2 border-r-2`} />
        </div>
    );
}
