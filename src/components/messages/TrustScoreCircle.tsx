interface TrustScoreCircleProps {
    score: number; // 0-100
}

export function TrustScoreCircle({ score }: TrustScoreCircleProps) {
    // Calculate stroke-dashoffset for the progress circle
    // circumference = 2 * π * r = 2 * 3.14159 * 74 ≈ 465
    const circumference = 465;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className="relative size-40 flex items-center justify-center">
                <svg className="absolute inset-0 size-full -rotate-90">
                    {/* Background Circle */}
                    <circle
                        cx="80"
                        cy="80"
                        r="74"
                        fill="transparent"
                        stroke="hsl(var(--muted))"
                        strokeWidth="4"
                    />
                    {/* Progress Circle */}
                    <circle
                        cx="80"
                        cy="80"
                        r="74"
                        fill="transparent"
                        stroke="hsl(var(--primary))"
                        strokeWidth="4"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="square"
                    />
                </svg>
                <div className="text-center">
                    <p className="text-4xl font-black text-foreground leading-none">
                        {score}
                        <span className="text-lg">%</span>
                    </p>
                    <p className="text-[10px] font-bold text-primary mt-1 tracking-widest uppercase">
                        TRUST_SCORE
                    </p>
                </div>
            </div>
        </div>
    );
}
