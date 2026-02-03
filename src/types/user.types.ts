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
    address: string;
    shortDescription: string;
    trustScore: number;
    role: 'USER' | 'ADMIN';
    provider: 'LOCAL' | 'GOOGLE';
    verifiedAt: string | null;
    createdAt: string;
    updatedAt: string;
}
