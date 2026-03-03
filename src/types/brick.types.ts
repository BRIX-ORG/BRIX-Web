import type { ApiResponse } from './api.types';

// Media stored in MinIO (original file)
export interface BrickMedia {
    url: string;
    etag: string;
    objectName: string;
}

// Cloudinary media (used for GLB uploads and watermarks)
export interface BrickCloudinaryMedia {
    url: string;
    publicId: string;
    resourceType: string;
}

// Thumbnail stored in Cloudinary
export interface BrickThumbnail {
    url: string;
    width: number;
    format: string;
    height: number;
    publicId: string;
}

// Watermarked version stored in Cloudinary
export interface BrickWatermark {
    url: string;
    width: number;
    format: string;
    height: number;
    publicId: string;
}

// Media type enum
export type BrickMediaType = 'IMAGE' | 'GLTF';

// Tag type enum
export type BrickTagType = 'ART' | 'REALTIME' | 'PRODUCT';

// Brick Model (Art / Image)
export interface Brick {
    id: string;
    userId: string;
    media: BrickMedia | null;
    thumbnail: BrickMedia | null;
    watermark: BrickWatermark | null;
    title: string;
    description: string | null;
    generatedDescription: string | null;
    mediaType: BrickMediaType;
    tagType: BrickTagType;
    isPublic: boolean;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    createdAt: string;
    updatedAt: string;
}

// GLB Brick Model (3D model with thumbnails)
export interface GlbBrick {
    id: string;
    userId: string;
    media: BrickCloudinaryMedia;
    thumbnail: BrickThumbnail[];
    watermark: BrickWatermark | null;
    title: string;
    description: string | null;
    generatedDescription: string | null;
    mediaType: BrickMediaType;
    tagType: BrickTagType;
    isPublic: boolean;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    createdAt: string;
    updatedAt: string;
}

// Unified brick type from GET /api/bricks/user/{idOrUsername}
// Media can be either MinIO (IMAGE) or Cloudinary (GLTF)
export interface UserBrick {
    id: string;
    userId: string;
    media: BrickMedia | BrickCloudinaryMedia;
    thumbnail: BrickThumbnail[] | null;
    watermark: BrickWatermark | null;
    title: string;
    description: string | null;
    generatedDescription: string | null;
    mediaType: BrickMediaType;
    tagType: BrickTagType;
    isPublic: boolean;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    createdAt: string;
    updatedAt: string;
}

// Paginated response for user bricks
export interface PaginatedBricksResponse {
    data: UserBrick[];
    total: number;
    limit: number;
    offset: number;
}

// Upload Art Brick response
export type UploadArtBrickResponse = ApiResponse<Brick>;

// Upload GLB Brick response
export type UploadGlbBrickResponse = ApiResponse<GlbBrick>;

// ─── Brick Detail (GET /api/bricks/{id}) ────────────────────────

export interface BrickDetailUser {
    id: string;
    username: string;
    fullName: string;
    gender: import('./user.types').Gender;
    avatar: import('./user.types').CloudinaryImage | null;
}

export interface BrickDetail {
    id: string;
    user: BrickDetailUser;
    media: BrickMedia | BrickCloudinaryMedia | null;
    thumbnail: BrickThumbnail[] | null;
    watermark: BrickWatermark | null;
    title: string;
    description: string | null;
    generatedDescription: string | null;
    mediaType: BrickMediaType;
    tagType: BrickTagType;
    isPublic: boolean;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    _count: {
        votes: number;
        comments: number;
    };
    createdAt: string;
    updatedAt: string;
}

// ─── Brick Votes ────────────────────────────────────────────────

export interface BrickVoteStatus {
    userVote: number | null;
    upvoteCount: number;
    downvoteCount: number;
    score: number;
}

// ─── Brick Upvoter ──────────────────────────────────────────────

export interface BrickUpvoter {
    id: string;
    username: string;
    fullName: string;
    gender: import('./user.types').Gender;
    avatar: import('./user.types').CloudinaryImage | null;
}

// ─── Brick Comment ──────────────────────────────────────────────

export interface BrickCommentImage {
    url: string;
    publicId: string;
    width: number;
    height: number;
    format: string;
}

export interface BrickComment {
    id: string;
    brickId: string;
    content: string;
    type: 'COMMENT' | 'REPLY';
    parentId: string | null;
    user: BrickDetailUser;
    likeCount: number;
    replyCount: number;
    images: BrickCommentImage[];
    replies: BrickComment[];
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedCommentsResponse {
    comments: BrickComment[];
    total: number;
}
