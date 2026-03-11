import type { CloudinaryImage, Gender } from './user.types';

// ─── Conversation Partner ───────────────────────────────────────

export interface ConversationPartner {
    id: string;
    username: string;
    fullName: string;
    avatar: CloudinaryImage | null;
    gender: Gender;
    isOnline: boolean;
    lastSeenAt: string | null;
}

// ─── Message Media Types ────────────────────────────────────────

export interface MessageImage {
    url: string;
    objectName: string;
    etag: string;
    width: number;
    height: number;
}

export interface MessageVoice {
    url: string;
    objectName: string;
    etag: string;
    duration: number;
    mimeType: string;
}

export interface MessageFile {
    url: string;
    objectName: string;
    etag: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
}

// ─── Message Reactions ──────────────────────────────────────────

/** Map of emoji → array of userId who reacted */
export type MessageReactions = Record<string, string[]>;

// ─── Message ────────────────────────────────────────────────────

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    images: MessageImage[];
    voice: MessageVoice | null;
    file: MessageFile | null;
    brickId: string | null;
    reactions: MessageReactions | null;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
    // Client-only fields for optimistic updates
    _tempId?: string;
    _status?: MessageStatus;
    _isEdited?: boolean;
}

// ─── Conversation ───────────────────────────────────────────────

export interface Conversation {
    id: string;
    partner: ConversationPartner;
    lastMessage: Message | null;
    unreadCount: number;
    createdAt: string;
    updatedAt: string;
}

// ─── Paginated Responses ────────────────────────────────────────

export interface PaginatedConversationsResponse {
    data: Conversation[];
    total: number;
    limit: number;
    offset: number;
}

export interface PaginatedMessagesResponse {
    data: Message[];
    total: number;
    limit: number;
    offset: number;
}

// ─── Media/File list responses ──────────────────────────────────

export interface ConversationMediaItem {
    messageId: string;
    senderId: string;
    createdAt: string;
    data: MessageImage[];
}

export interface ConversationFileItem {
    messageId: string;
    senderId: string;
    createdAt: string;
    data: MessageFile;
}

export interface PaginatedMediaResponse {
    data: ConversationMediaItem[];
    total: number;
    limit: number;
    offset: number;
}

export interface PaginatedFilesResponse {
    data: ConversationFileItem[];
    total: number;
    limit: number;
    offset: number;
}

// ─── Socket Events ──────────────────────────────────────────────

export type SocketNewMessageEvent = Message;

export type SocketMessageUpdatedEvent = Message;

export interface SocketMessageDeletedEvent {
    messageId: string;
    conversationId: string;
}

export interface SocketMessageReactionEvent {
    messageId: string;
    conversationId: string;
    reactions: MessageReactions | null;
}

export interface SocketMessagesReadEvent {
    conversationId: string;
    readerId: string;
}

export interface SocketTypingEvent {
    userId: string;
    conversationId: string;
}

export interface SocketUserOnlineEvent {
    userId: string;
}

export interface SocketUserOfflineEvent {
    userId: string;
    lastSeenAt: string;
}

export interface SocketTypingListEvent {
    conversationId: string;
    users: string[];
}
