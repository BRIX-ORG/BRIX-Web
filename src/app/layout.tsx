import type { Metadata } from 'next';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './globals.css';
import { QueryProvider } from '@/providers/QueryProvider';
import { ApiClientProvider } from '@/providers/ApiClientProvider';
import { ChatSocketProvider } from '@/providers/ChatSocketProvider';
import { LoadingSpinner } from '@/components/shared';
import { fontsVariables } from './fonts';

export const metadata: Metadata = {
    title: {
        default: 'BRIX | Build Your Truth',
        template: '%s | BRIX',
    },
    description:
        'The first immutable image repository with integrated GPS and temporal verification. Captured, hashed, and anchored forever on the block.',
    keywords: [
        'image verification',
        'digital authenticity',
        'blockchain',
        'immutable storage',
        'GPS verification',
        'temporal proof',
        'NFT',
        'photography',
        'BRIX protocol',
    ],
    authors: [{ name: 'BRIX Protocol' }],
    creator: 'BRIX Immutable Network',
    publisher: 'BRIX Immutable Network',
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://www.brix.social',
        siteName: 'BRIX',
        title: 'BRIX | Build Your Truth',
        description:
            'The first immutable image repository with integrated GPS and temporal verification.',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'BRIX - Build Your Truth, Block by Block',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'BRIX | Build Your Truth',
        description:
            'The first immutable image repository with integrated GPS and temporal verification.',
        images: ['/og-image.png'],
        creator: '@brixprotocol',
    },
    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon-16x16.png',
        apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',
    metadataBase: new URL('https://www.brix.social'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <body className={`${fontsVariables.join(' ')} antialiased`} suppressHydrationWarning>
                <QueryProvider>
                    <ApiClientProvider>
                        <ChatSocketProvider>
                            {children}
                            <LoadingSpinner />
                        </ChatSocketProvider>
                    </ApiClientProvider>
                </QueryProvider>
                <ToastContainer
                    position="top-right"
                    autoClose={4000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="dark"
                />
            </body>
        </html>
    );
}
