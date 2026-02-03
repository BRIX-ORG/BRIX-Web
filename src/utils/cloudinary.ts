/**
 * Cloudinary Image Transformation Utilities
 * Provides helper functions to optimize and transform Cloudinary image URLs
 *
 * @see https://cloudinary.com/documentation/image_transformations
 */

import type { Gender } from '@/types/auth.types';

export type CloudinaryImage = {
    url: string;
    publicId: string;
    width: number;
    height: number;
    format: string;
};

// Quality presets for different use cases
export type QualityPreset = 'auto' | 'auto:best' | 'auto:good' | 'auto:eco' | 'auto:low' | number;

export type CloudinaryTransformOptions = {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb' | 'limit' | 'pad';
    quality?: QualityPreset;
    format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
    gravity?: 'auto' | 'face' | 'faces' | 'center' | 'north' | 'south' | 'east' | 'west';
    blur?: number;
    radius?: number | 'max';
    aspectRatio?: string; // e.g., "16:9", "1:1", "4:3"
    dpr?: number | 'auto'; // Device Pixel Ratio for Retina displays
};

// Default avatar URLs based on gender
export const DEFAULT_AVATARS = {
    MALE: 'https://res.cloudinary.com/dpndyuheh/image/upload/v1770135569/male_hhuflm.png',
    FEMALE: 'https://res.cloudinary.com/dpndyuheh/image/upload/v1770135569/female_vsjpmi.png',
    OTHER: 'https://res.cloudinary.com/dpndyuheh/image/upload/v1770135569/other_mecsnp.png',
} as const;

// Default background for users without custom background
export const DEFAULT_BACKGROUND =
    'https://res.cloudinary.com/dpndyuheh/image/upload/v1770135569/BRIX/defaults/default_background.jpg';

/**
 * Get default avatar URL based on gender
 */
export function getDefaultAvatar(gender: Gender): string {
    return DEFAULT_AVATARS[gender];
}

/**
 * Get avatar URL from CloudinaryImage or fallback to default based on gender
 */
export function getAvatarUrl(avatar: CloudinaryImage | null, gender: Gender): string {
    if (!avatar?.url) {
        return getDefaultAvatar(gender);
    }
    return avatar.url;
}

/**
 * Get background URL from CloudinaryImage or fallback to default
 */
export function getBackgroundUrl(background: CloudinaryImage | null): string {
    if (!background?.url) {
        return DEFAULT_BACKGROUND;
    }
    return background.url;
}

/**
 * Checks if a URL is a valid Cloudinary URL
 */
export function isCloudinaryUrl(url: string): boolean {
    return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
}

/**
 * Builds transformation string from options
 */
function buildTransformationString(options: CloudinaryTransformOptions): string {
    const transformations: string[] = [];

    // Order matters in Cloudinary transformations (following Cloudinary best practices)
    if (options.aspectRatio) transformations.push(`ar_${options.aspectRatio}`);
    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.crop) transformations.push(`c_${options.crop}`);
    if (options.gravity) transformations.push(`g_${options.gravity}`);
    if (options.dpr) transformations.push(`dpr_${options.dpr}`);
    if (options.quality) transformations.push(`q_${options.quality}`);
    if (options.format) transformations.push(`f_${options.format}`);
    if (options.blur) transformations.push(`e_blur:${options.blur}`);
    if (options.radius) transformations.push(`r_${options.radius}`);

    return transformations.join(',');
}

/**
 * Transforms a Cloudinary URL with specified options
 * ⚠️ Note: Version numbers (v1234567890) are preserved for CDN cache management
 *
 * @example
 * ```ts
 * const optimized = transformCloudinaryUrl(originalUrl, {
 *   width: 800,
 *   quality: 'auto:best',
 *   format: 'auto'
 * });
 * ```
 */
export function transformCloudinaryUrl(url: string, options: CloudinaryTransformOptions): string {
    if (!isCloudinaryUrl(url)) {
        console.warn('Not a Cloudinary URL:', url);
        return url;
    }

    const transformString = buildTransformationString(options);

    // Pattern: https://res.cloudinary.com/{cloud}/image/upload/{transformations}/{version}/{path}
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) {
        console.warn('Could not find /upload/ in Cloudinary URL:', url);
        return url;
    }

    const beforeUpload = url.substring(0, uploadIndex + 8); // includes '/upload/'
    const afterUpload = url.substring(uploadIndex + 8);

    // Remove existing transformations if any (they contain commas)
    // Keep version number for CDN caching!
    const pathParts = afterUpload.split('/');
    const hasExistingTransform = pathParts[0]?.includes(',');

    // If there's an existing transformation, remove only that part
    const cleanPath = hasExistingTransform ? pathParts.slice(1).join('/') : afterUpload;

    return `${beforeUpload}${transformString}/${cleanPath}`;
}

// =============================================================================
// PRESET FUNCTIONS - Optimized for specific UI use cases
// =============================================================================

/**
 * Preset: Optimized thumbnail image
 * Best for: Grid views, small previews
 */
export function getCloudinaryThumbnail(url: string, size: number = 150): string {
    return transformCloudinaryUrl(url, {
        width: size,
        height: size,
        crop: 'fill',
        gravity: 'auto',
        quality: 'auto:good',
        format: 'auto',
    });
}

/**
 * Preset: Avatar image with smart cropping
 * Uses g_auto which automatically detects faces OR focuses on interesting areas for landscapes
 * Best for: User avatars, profile pictures
 */
export function getCloudinaryAvatar(url: string, size: number = 128): string {
    return transformCloudinaryUrl(url, {
        width: size,
        height: size,
        crop: 'fill', // fill keeps more context than thumb while still focusing on interesting area
        gravity: 'auto', // AI-powered: detects faces if present, else focuses on interesting region
        quality: 'auto:good',
        format: 'auto',
    });
}

/**
 * Preset: Artwork/Brick image
 * Best for: Art pieces, music album covers, portfolio items
 */
export function getCloudinaryArtwork(
    url: string,
    width: number = 600,
    aspectRatio: string = '1:1',
): string {
    return transformCloudinaryUrl(url, {
        width,
        aspectRatio,
        crop: 'fill',
        gravity: 'auto',
        quality: 'auto:best', // Higher quality for artwork
        format: 'auto',
    });
}

/**
 * Preset: Responsive image for cards
 * Best for: Card components, list items
 */
export function getCloudinaryCardImage(url: string, width: number = 400): string {
    return transformCloudinaryUrl(url, {
        width,
        crop: 'limit',
        quality: 'auto:good',
        format: 'auto',
    });
}

/**
 * Preset: Banner/Hero image
 * Best for: Page headers, hero sections
 */
export function getCloudinaryBanner(
    url: string,
    width: number = 1200,
    aspectRatio: string = '21:9',
): string {
    return transformCloudinaryUrl(url, {
        width,
        aspectRatio,
        crop: 'fill',
        gravity: 'auto',
        quality: 'auto:good',
        format: 'auto',
    });
}

/**
 * Preset: User profile background image
 * Best for: Profile page backgrounds, cover images
 */
export function getCloudinaryProfileBackground(
    url: string,
    width: number = 1920,
    aspectRatio: string = '16:9',
): string {
    return transformCloudinaryUrl(url, {
        width,
        aspectRatio,
        crop: 'fill',
        gravity: 'auto',
        quality: 'auto:good',
        format: 'auto',
    });
}

/**
 * Preset: Blurred placeholder for progressive loading (LQIP - Low Quality Image Placeholder)
 * Best for: Skeleton loading states, blur-up effect
 */
export function getCloudinaryPlaceholder(url: string): string {
    return transformCloudinaryUrl(url, {
        width: 50,
        quality: 'auto:low',
        blur: 1000,
        format: 'auto',
    });
}

// =============================================================================
// RESPONSIVE HELPERS - For Next.js Image and srcSet
// =============================================================================

/**
 * Generate srcSet for responsive images
 * Best for: <img> tags with srcset attribute
 */
export function getCloudinarySrcSet(
    url: string,
    widths: number[] = [640, 750, 828, 1080, 1200, 1920],
    options?: Omit<CloudinaryTransformOptions, 'width'>,
): string {
    return widths
        .map((width) => {
            const transformedUrl = transformCloudinaryUrl(url, {
                quality: 'auto:good',
                format: 'auto',
                ...options,
                width,
            });
            return `${transformedUrl} ${width}w`;
        })
        .join(', ');
}

/**
 * Get props for Next.js Image component with blur placeholder
 * Returns src, blurDataURL for use with Next.js Image
 */
export function getNextImageProps(
    url: string,
    width: number,
    options?: Omit<CloudinaryTransformOptions, 'width'>,
) {
    return {
        src: transformCloudinaryUrl(url, {
            quality: 'auto:good',
            format: 'auto',
            ...options,
            width,
        }),
        blurDataURL: getCloudinaryPlaceholder(url),
        placeholder: 'blur' as const,
    };
}

/**
 * Get optimized image URL with smart defaults
 */
export function optimizeCloudinaryImage(
    url: string,
    width?: number,
    quality: QualityPreset = 'auto:good',
): string {
    const options: CloudinaryTransformOptions = {
        quality,
        format: 'auto',
    };

    if (width) {
        options.width = width;
        options.crop = 'limit';
    }

    return transformCloudinaryUrl(url, options);
}

/**
 * Get image URL optimized for Retina/HiDPI displays
 */
export function getCloudinaryRetinaImage(
    url: string,
    width: number,
    dpr: number = 2,
    options?: Omit<CloudinaryTransformOptions, 'width' | 'dpr'>,
): string {
    return transformCloudinaryUrl(url, {
        quality: 'auto:good',
        format: 'auto',
        ...options,
        width,
        dpr,
    });
}
