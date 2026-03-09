import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    webpack(config) {
        config.module.rules.push({
            test: /\.svg$/,
            use: [
                {
                    loader: '@svgr/webpack',
                    options: {
                        icon: true,
                    },
                },
            ],
        });
        return config;
    },

    turbopack: {
        root: __dirname,
        rules: {
            '*.svg': {
                loaders: [
                    {
                        loader: '@svgr/webpack',
                        options: {},
                    },
                ],
                as: '*.js',
            },
        },
    },

    output: 'standalone',
    reactStrictMode: true,
    compress: true,
    poweredByHeader: false,

    images: {
        formats: ['image/avif', 'image/webp'],
        dangerouslyAllowSVG: true,
        unoptimized: process.env.NODE_ENV === 'development',
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'pbs.twimg.com',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '9000',
                pathname: '/**',
            },
        ],
    },

    experimental: {
        optimizeCss: true,
        scrollRestoration: true,
    },

    compiler: {
        styledComponents: true,
        removeConsole: process.env.NODE_ENV === 'production',
    },
    // devIndicators: false,
};

export default nextConfig;
