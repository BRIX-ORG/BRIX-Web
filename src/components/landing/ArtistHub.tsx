'use client';

import dynamic from 'next/dynamic';
import ShinyText from '@/components/react-bits/ShinyText';
import { useTranslations } from 'next-intl';

// Dynamic import to avoid SSR issues with WebGL
const DomeGallery = dynamic(() => import('@/components/react-bits/DomeGallery'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center">
            <div className="animate-pulse text-primary font-mono text-xs">Loading Gallery...</div>
        </div>
    ),
});

const artworkImages = [
    {
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBldIJdZ4y5fRgtagcF4uz2V1Noyaqh2fUIeUJV-PX50oIHUInochjBlI1PmYTqXY7QQai9iIzZja3PlloqtPZo44cmd5sXPRvBYSH5xvvPD3gHMS3nqtbqQO92XKJCjDPy8mu7JTkeLC1VHpMmyvgi-rjLIHuAh7e_x7z0VvuHwaw1lSnKpzPkua3amZ4LHU3h3ouLjfytyTWHDPoipDn7vpglDSU8UW_ahz_j8eHojEF6bDwTFt9Zte2dMIJCCkxlVsaOJvfyn2Y',
        alt: 'Electric Dreams by @NeonCipher',
    },
    {
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRts3DhrONEVkH0rA5LVABtSDgKehj9ePLAgmEeQ9hjOCgjWDospiAeS16u6ET_Q6kvQoheWof7e0VybTgAgBIYZdWvuqmfYXNxKdYe5qcCvo5pIUJjRmOicmh9NEXmjpqryx5pwKxgaLaKl-EpUAaAf_8NmcvcBMrKxOQdNRUvScrIi-S1BdXIwRL3zm0RnEAjfVJ4IeIen7hesjXxS3inTP4_OBv5ZjdU0q9DnRZSm_4WBh8qUGncp0PiClQ5VOWTY_VUd1doDQ',
        alt: 'Void Fragment by @VoidWalker',
    },
    {
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0c7_xtb9rDzM1-smC2SgTTeiGGIP7txKpXNocrYAuvyO_3A4XwQlwTWmzqOrarYNNAnlPss9jurvFSDn5tRKQMOc_tjvrl4oQFgarhgZWiB4KwTGATdNmzBjM9ZV9z5qihm2PFzqECmw2sDs_LVZ8Y3ujzXvwLS2nFNTQTfgl4RScaW6viQwlLkL2dzZsMANbmXuYivPI2DkKEFGexhqirja_5AYzQmBIYZ6vanX15F2hNfhx9wotzhhlYzYCvzeJ1XLwGOO2RLM',
        alt: 'Neural Spire by @ArchiTech',
    },
    {
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXocRH_Z4BXQj-BOpApl3cga83_azdq6rdLZsNqU5miulFmElMYSx-AvIMfxBrmPDnQT2DcoQZ8WHKUBwTqA-SAaSKyYTZMcRhisTf4nT1I_XCvxo8N18Qqj9MyXmq_zS4DGxLJRIE23zC_ZEUdTirpP0KaMhwG4NVZ2Vx6tBnOO1pBtci33F_Hr1mDe8iYLkgSIttRl_MDez4bXXrtRKLAkgwsHMUMVdqqoq-CkmhA6hU4W37xJlJTvTmsKXFg2b4hc0iC2NE8qs',
        alt: 'System Failure by @Error_404',
    },
    {
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfX0mo1lUxsu7cU0I1a3rVipp0tY0iFU2XsFTAp15pSZgb8lk9Y9SZn6Du6d4f1MV4mt06PPTFpLKDtk7c1FQVEczO-dQzpYxSEiZ-3NbYJQ_Nfbkw9mhf2aFnNXruOsdH7dGrbbNlI_Uy13yXrT2egtxy6JwyPYMAWO0Ae8MrU3nVO5_8_03LNBQeerQSGYCl98vtaBdZjyhAGzu0xsKxbuU7lVUkCBpBT1MWN0k_oGtT5Kg5K-wQ7iMzFeL-dC8SMumCxmb_Ogg',
        alt: 'Tokyo Night by @CyberNinja',
    },
    {
        src: 'https://images.unsplash.com/photo-1752588975228-21f44630bb3c?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        alt: 'Textured surface',
    },
    {
        src: 'https://images.unsplash.com/photo-1755331039789-7e5680e26e8f?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        alt: 'Abstract art',
    },
    {
        src: 'https://images.unsplash.com/photo-1755569309049-98410b94f66d?q=80&w=772&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        alt: 'Modern sculpture',
    },
];

export function ArtistHub() {
    const t = useTranslations('landing');
    return (
        <section id="artist-hub" className="py-24 bg-background/50 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                {/* Section Header */}
                <div className="flex items-center gap-4 mb-16">
                    <span className="h-px flex-1 bg-border"></span>
                    <ShinyText
                        text={t('ArtistHub.header')}
                        speed={2}
                        delay={0}
                        color="#b5b5b5"
                        shineColor="#00eeff"
                        spread={120}
                        direction="left"
                        yoyo={false}
                        pauseOnHover={false}
                        disabled={false}
                        className="font-display text-2xl font-bold uppercase tracking-[0.3em] px-8 text-center"
                    />
                    <span className="h-px flex-1 bg-border"></span>
                </div>

                {/* Dome Gallery */}
                <div className="h-150 md:h-175 w-full relative">
                    <DomeGallery
                        images={artworkImages}
                        fit={0.6}
                        fitBasis="auto"
                        minRadius={400}
                        maxRadius={800}
                        padFactor={0.2}
                        overlayBlurColor="#050505"
                        maxVerticalRotationDeg={8}
                        dragSensitivity={15}
                        enlargeTransitionMs={350}
                        segments={30}
                        dragDampening={1.5}
                        openedImageWidth="450px"
                        openedImageHeight="450px"
                        imageBorderRadius="8px"
                        openedImageBorderRadius="12px"
                        grayscale={true}
                        popupMode="brix" // enlarge | brix
                    />
                </div>

                {/* CTA */}
                <div className="flex justify-center mt-16">
                    <button className="px-12 py-4 border border-primary text-primary font-display font-bold uppercase tracking-[0.2em] hover:bg-primary hover:text-primary-foreground transition-all">
                        {t('ArtistHub.cta')}
                    </button>
                </div>
            </div>
        </section>
    );
}
