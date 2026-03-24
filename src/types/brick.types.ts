import type { TopAuthor } from './user.types';

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

// Metadata attached to a brick (verification, exif, chain)
export interface BrickMetadata {
    id: string;
    rawExif: Record<string, unknown> | null;
    modelData: Record<string, unknown> | null;
    hashSha256: string | null;
    ipfsCid: string | null;
    imageCid: string | null;
    onChainTx: string | null;
    contractAddr: string | null;
    onChainStatus: string | null;
    onChainId: number | null;
    verifiedAt: string | null;
}

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
    metadata: BrickMetadata | null;
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

// Minimal brick information for map markers
export interface NewsfeedLocation {
    id: string;
    latitude: number;
    longitude: number;
    tagType: BrickTagType;
}

// Upload Art Brick response

// Upload GLB Brick response

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
    metadata: BrickMetadata | null;
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

// ─── Brick Donations ────────────────────────────────────────────

export interface BrickDonation {
    id: string;
    brickId: string;
    fromAddress: string;
    amount: string;
    txHash: string;
    createdAt: string;
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

// ─── Realtime Session ───────────────────────────────────────────

export interface RealtimeSession {
    sessionId: string;
    qrToken: string;
    expiresIn: number;
}

export interface RealtimeUploadResult {
    message: string;
    sessionId: string;
}
export interface PaginatedTopAuthorsResponse {
    data: TopAuthor[];
    total: number;
    limit: number | null;
    offset: number;
}

export interface RealtimeBrick extends UserBrick {
    totalRevenue: string;
}

export interface PaginatedRealtimeBricksResponse {
    data: RealtimeBrick[];
    total: number;
    limit: number;
    offset: number;
}

export interface PaginatedDonationsResponse {
    data: BrickDonation[];
    total: number;
    limit: number;
    offset: number;
}

export interface UserBrickStats {
    totalBricksUploaded: number;
    ipfsBricksUploaded: number;
    onchainBricks: number;
    totalUpvotes: number;
    totalDonationsReceived: string;
    bricksByTagType: {
        REALTIME: number;
        ART: number;
        PRODUCT: number;
    };
}

export interface OnchainActivity {
    id: string;
    brickId: string;
    type: string;
    txHash: string;
    gasUsed: string;
    status: string;
    createdAt: string;
}

export interface PaginatedOnchainActivitiesResponse {
    data: OnchainActivity[];
    total: number;
    limit: number;
    offset: number;
}
