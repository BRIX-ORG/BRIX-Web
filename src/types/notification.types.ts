import type { Gender, CloudinaryImage } from './user.types';

export type NotificationType =
    | 'UPVOTE_BRICK'
    | 'UPVOTE_COMMENT'
    | 'COMMENT_BRICK'
    | 'REPLY_COMMENT'
    | 'FOLLOW';

export interface NotificationActorDto {
    id: string;
    username: string;
    fullName: string;
    avatar?: CloudinaryImage | null;
    gender: Gender;
}

export interface NotificationBrickDto {
    id: string;
    title: string;
    watermark?: CloudinaryImage | null;
    mediaType: 'IMAGE' | 'GLTF' | 'VIDEO';
}

export interface NotificationCommentDto {
    id: string;
    content: string;
    type?: 'COMMENT' | 'REPLY';
}

export interface NotificationGroup {
    id: string;
    type: NotificationType;
    actorsCount: number;
    isRead: boolean;
    updatedAt: string;
    createdAt: string;
    lastActor: NotificationActorDto;
    brick?: NotificationBrickDto | null;
    comment?: NotificationCommentDto | null;
    actors?: NotificationActorDto[];
}

export interface PaginatedNotifications {
    data: NotificationGroup[];
    total: number;
    limit: number;
    offset: number;
}

// ─── Socket Event Payloads ───────────────────────────────────────

export type SocketNotificationEvent = NotificationGroup;

export interface SocketNotificationUpdatedEvent {
    id: string;
    actorsCount: number;
    lastActorId: string;
    lastActor: NotificationActorDto;
    brick?: NotificationBrickDto;
    comment?: NotificationCommentDto;
}

export interface SocketUnreadCountEvent {
    count: number;
}
