/**
 * User-related types
 */

// Gender type
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

// Cloudinary Image type
export interface CloudinaryImage {
    url: string;
    publicId: string;
    width: number;
    height: number;
    format: string;
}

// Address with geolocation
export interface UserAddress {
    lat: string;
    lon: string;
    displayName: string;
    country: string;
}

// User Model
export interface User {
    id: string;
    username: string;
    fullName: string;
    email: string;
    phone: string;
    gender: Gender;
    avatar: CloudinaryImage | null;
    background: CloudinaryImage | null;
    address: UserAddress | null;
    shortDescription: string;
    trustScore: number;
    role: 'USER' | 'ADMIN';
    provider: 'LOCAL' | 'GOOGLE';
    verifiedAt: string | null;
    createdAt: string;
    updatedAt: string;
}
