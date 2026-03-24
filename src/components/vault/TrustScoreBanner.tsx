import { Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface TrustScoreBannerProps {
    currentScore?: number;
    maxScore?: number;
    requirement?: number;
    level?: number;
}

export function TrustScoreBanner({
    currentScore = 850,
    maxScore = 1000,
    requirement = 750,
    level = 4,
}: TrustScoreBannerProps) {
    const t = useTranslations('vault.trust');
    const percentage = (currentScore / maxScore) * 100;

    return (
        <div className="relative overflow-hidden bg-muted border border-border p-6 rounded-xl flex items-center justify-between">
            <div className="flex flex-col gap-1 z-10">
                <div className="flex items-center gap-2">
                    <Shield className="size-5 text-primary" />
                    <h3 className="text-lg font-bold">{t('title')}</h3>
                </div>
                <p className="text-muted-foreground text-sm">{t('description', { level })}</p>
            </div>
            <div className="flex flex-col items-end gap-2 z-10">
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest">
                            {t('current')}
                        </p>
                        <p className="text-2xl font-bold text-primary font-mono">
                            {currentScore}/{maxScore}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest">
                            {t('requirement')}
                        </p>
                        <p className="text-2xl font-bold text-secondary font-mono">
                            {requirement}+
                        </p>
                    </div>
                </div>
                <div className="w-64 h-1.5 bg-muted-foreground/20 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-linear-to-r from-primary to-secondary rounded-full"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
            {/* Background decoration */}
            <div className="absolute -right-4 -bottom-4 text-[120px] text-foreground/2 rotate-12 select-none pointer-events-none">
                <Shield className="size-32" />
            </div>
        </div>
    );
}
