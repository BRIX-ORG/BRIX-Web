// ─── Album Types ────────────────────────────────────────────────

export interface AlbumImage {
    url: string;
    publicId: string;
    width: number;
    height: number;
}

export interface AlbumItem {
    image: AlbumImage;
    title: string;
    description: string;
}

export interface Album {
    id: string;
    userId: string;
    name: string;
    description: string | null;
    background: [string, string, string] | null;
    titleColor: string | null;
    descriptionColor: string | null;
    items: AlbumItem[];
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedAlbumsResponse {
    data: Album[];
    total: number;
    limit: number;
    offset: number;
}
