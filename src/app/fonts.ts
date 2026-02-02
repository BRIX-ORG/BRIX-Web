import { Space_Grotesk, Inter, JetBrains_Mono, Cabin } from 'next/font/google';

export const spaceGrotesk = Space_Grotesk({
    variable: '--font-space-grotesk',
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
    display: 'swap',
});

export const inter = Inter({
    variable: '--font-inter',
    subsets: ['latin'],
    weight: ['300', '400', '500', '600'],
    display: 'swap',
});

export const jetbrainsMono = JetBrains_Mono({
    variable: '--font-jetbrains-mono',
    subsets: ['latin'],
    weight: ['400', '700'],
    display: 'swap',
});

export const cabin = Cabin({
    variable: '--font-cabin',
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    display: 'swap',
});

export const fontsVariables: string[] = [
    spaceGrotesk.variable,
    inter.variable,
    jetbrainsMono.variable,
    cabin.variable,
];
