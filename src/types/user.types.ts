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
    totalFollowers?: number;
}

/** User item returned in followers/following lists */
export interface FollowUser {
    id: string;
    username: string;
    fullName: string;
    avatar: CloudinaryImage | null;
    background: CloudinaryImage | null;
    gender: Gender;
    role: 'USER' | 'ADMIN';
    provider: 'LOCAL' | 'GOOGLE';
    shortDescription: string | null;
    isFollowing: boolean;
    totalFollowers?: number;
}

/** Paginated response for followers/following lists */
export interface FollowListResponse {
    data: FollowUser[];
    total: number;
    limit: number | null;
    offset: number;
}

/** Response from follow/unfollow actions */
export interface FollowActionResponse {
    isFollowing: boolean;
}

/** Top author returned by /api/bricks/top-authors */
export interface TopAuthor extends User {
    totalVotes: number;
    isFollowing: boolean;
}

/** Top user returned by /api/follows/top-users */
export interface TopUser extends FollowUser {
    totalFollowers: number;
}

export interface PaginatedTopUsersResponse {
    data: TopUser[];
    total: number;
    limit: number | null;
    offset: number;
}
