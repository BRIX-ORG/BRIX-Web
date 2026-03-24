import Image from 'next/image';
import { Lock, ShieldCheck } from 'lucide-react';
import { cn } from '@/utils/classnames';
import { useTranslations } from 'next-intl';

export interface EncryptedFile {
    id: string;
    filename: string;
    imageUrl: string;
    hash: string;
    type: 'sensitive' | 'on-chain' | 'biometric';
}

interface EncryptedContentCardProps {
    file: EncryptedFile;
    onDecrypt?: () => void;
}

export function EncryptedContentCard({ file, onDecrypt }: EncryptedContentCardProps) {
    const t = useTranslations('vault');
    const isOnChain = file.type === 'on-chain';

    const typeLabels = {
        sensitive: t('types.sensitive'),
        'on-chain': t('types.onChain'),
        biometric: t('types.biometric'),
    };

    return (
        <div className="group relative aspect-video rounded-xl overflow-hidden bg-muted border border-border shadow-lg">
            {/* Background Image */}
            <div className="absolute inset-0">
                <Image src={file.imageUrl} alt={file.filename} fill className="object-cover" />
            </div>

            {/* Glass Overlay */}
            <div className="absolute inset-0 backdrop-blur-[20px] bg-muted/70 z-10 flex flex-col items-center justify-center text-center p-6 transition-all duration-500 group-hover:backdrop-blur-sm">
                {isOnChain ? (
                    <ShieldCheck className="size-10 text-secondary mb-4 group-hover:scale-125 transition-transform duration-500" />
                ) : (
                    <Lock className="size-10 text-primary mb-4 group-hover:scale-125 transition-transform duration-500" />
                )}
                <p className="font-bold text-lg mb-2">{file.filename}</p>
                <p className="text-muted-foreground text-xs font-mono mb-6">SHA-256: {file.hash}</p>
                <button
                    onClick={onDecrypt}
                    className={cn(
                        'px-6 py-2 text-xs font-bold rounded uppercase tracking-widest hover:scale-105 transition-all',
                        isOnChain
                            ? 'bg-secondary text-secondary-foreground'
                            : 'bg-primary text-primary-foreground',
                    )}
                >
                    {isOnChain ? t('authOnChain') : t('decryptToView')}
                </button>
            </div>

            {/* Type Badge */}
            <div
                className={cn(
                    'absolute top-4 left-4 z-20 px-2 py-1 bg-black/50 backdrop-blur rounded text-[10px] font-mono border',
                    isOnChain
                        ? 'text-secondary border-secondary/30'
                        : 'text-primary border-primary/30',
                )}
            >
                {typeLabels[file.type]}
            </div>
        </div>
    );
}
