'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { BrixBrandLogo } from '@/components/shared';

// Dynamic imports to avoid SSR issues
const InfiniteMenu = dynamic(() => import('@/components/react-bits/InfiniteMenu'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center">
            <div className="size-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    ),
});

const LiquidEther = dynamic(() => import('@/components/react-bits/LiquidEther'), {
    ssr: false,
});

const itemData = [
    {
        image: 'https://res.cloudinary.com/djyugezvf/image/upload/v1768849395/twocats_vpzpex.jpg',
        link: '#origin',
        key: 'origin',
    },
    {
        image: 'https://res.cloudinary.com/djyugezvf/image/upload/v1768849393/691853eef3064f581617_ckl9nf.jpg',
        link: '#reality',
        key: 'reality',
    },
    {
        image: 'https://res.cloudinary.com/djyugezvf/image/upload/v1768849580/z6225575670668_2b09a49460de530e8f478f0b341abb44_kuaap5.jpg',
        link: '#geo',
        key: 'geo',
    },
    {
        image: 'https://res.cloudinary.com/djyugezvf/image/upload/v1768849581/z5807214149277_d099009ccdfdbdc211cc126757316107_fh5mpy.jpg',
        link: '#trust',
        key: 'trust',
    },
    {
        image: 'https://res.cloudinary.com/djyugezvf/image/upload/v1768849581/z5807219326002_4ee01a24c149ee671b619f21348056ae_r75bch.jpg',
        link: '#studio',
        key: 'studio',
    },
    {
        image: 'https://res.cloudinary.com/djyugezvf/image/upload/v1768849735/z7448102365811_14d54f3cb533dbfe54a9d4eb78a373a8_iuesno.jpg',
        link: '#connect',
        key: 'connect',
    },
    {
        image: 'https://res.cloudinary.com/djyugezvf/image/upload/v1768849736/z7448102365546_21573051d963857076eb3c4c558f2ed7_f4xnsw.jpg',
        link: '#storage',
        key: 'storage',
    },
    {
        image: 'https://res.cloudinary.com/djyugezvf/image/upload/v1768849736/z7448102367356_8124bce40ae986f723d7b276beea6194_aqagmv.jpg',
        link: '/login',
        key: 'start',
    },
];

export default function DemoPage() {
    const t = useTranslations('introduction');

    const items = itemData.map((item) => ({
        ...item,
        title: t(`cards.${item.key}.title`),
        description: t(`cards.${item.key}.desc`),
    }));
    return (
        <div className="relative min-h-screen w-full bg-brix-bg-dark overflow-hidden">
            {/* LiquidEther Background */}
            <div className="absolute inset-0 z-0">
                <LiquidEther
                    colors={['#e2cbff', '#bc00ff', '#00eeff']}
                    mouseForce={20}
                    cursorSize={100}
                    isViscous
                    viscous={30}
                    iterationsViscous={32}
                    iterationsPoisson={32}
                    resolution={0.5}
                    isBounce={false}
                    autoDemo
                    autoSpeed={0.5}
                    autoIntensity={2.2}
                    takeoverDuration={0.25}
                    autoResumeDelay={3000}
                    autoRampDuration={0.6}
                />
            </div>

            {/* Navigation Header */}
            <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
                <BrixBrandLogo href="/" size="sm" animated />

                <div className="flex items-center gap-4">
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground border border-border/50 bg-background/30 backdrop-blur-md transition-all hover:bg-background/50"
                    >
                        <ArrowLeft className="size-4" />
                        {t('nav.back')}
                    </Link>
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-widest bg-primary text-primary-foreground hover:brightness-110 transition-all"
                    >
                        <Home className="size-4" />
                        {t('nav.dashboard')}
                    </Link>
                </div>
            </header>

            {/* Title Overlay */}
            <div className="fixed top-24 left-6 z-40 max-w-sm">
                <h1 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-4">
                    {t('header.title')}{' '}
                    <span className="text-primary">{t('header.highlight')}</span>
                </h1>
                <p className="text-sm text-muted-foreground font-mono">{t('explore')}</p>
            </div>

            {/* InfiniteMenu */}
            <div className="relative z-10 h-screen w-full">
                <InfiniteMenu items={items} scale={1.1} />
            </div>

            {/* Bottom Info */}
            <div className="fixed bottom-6 left-6 right-6 z-40 flex items-end justify-between pointer-events-none">
                <div className="bg-background/30 backdrop-blur-md border border-border/50 p-4 pointer-events-auto">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
                        {t('footer.status')}
                    </p>
                    <div className="flex items-center gap-2">
                        <div className="size-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs font-mono text-green-500">
                            {t('footer.networkOnline')}
                        </span>
                    </div>
                </div>

                <div className="bg-background/30 backdrop-blur-md border border-border/50 p-4 text-right pointer-events-auto">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
                        {t('footer.version')}
                    </p>
                    <span className="text-xs font-mono text-primary">BRIX v1.0.4</span>
                </div>
            </div>
        </div>
    );
}
