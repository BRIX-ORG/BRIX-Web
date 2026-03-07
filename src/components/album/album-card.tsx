'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
    MoreHorizontal,
    Pencil,
    Trash2,
    Share2,
    ImageIcon,
    Calendar,
    Copy,
    Check,
} from 'lucide-react';
import { cn } from '@/utils/classnames';
import type { Album } from '@/types/album.types';

interface AlbumCardProps {
    album: Album;
    onEdit: (album: Album) => void;
    onDelete: (album: Album) => void;
}

export function AlbumCard({ album, onEdit, onDelete }: AlbumCardProps) {
    const [showMenu, setShowMenu] = useState(false);
    const [copied, setCopied] = useState(false);

    const thumbnail = album.items[0]?.image?.url;
    const itemCount = album.items.length;
    const createdDate = new Date(album.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    const handleShare = async () => {
        const url = `${window.location.origin}/album/${album.id}`;
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="group relative bg-background/50 border border-border/50 rounded-xl overflow-hidden hover:border-primary/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,238,255,0.08)]">
            {/* Thumbnail */}
            <div className="relative aspect-4/3 bg-muted/30 overflow-hidden">
                {thumbnail ? (
                    <Image
                        src={thumbnail}
                        alt={album.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="size-12 text-muted-foreground/30" />
                    </div>
                )}

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Item count badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-background/80 backdrop-blur-sm border border-border/50 rounded-full px-2.5 py-1">
                    <ImageIcon className="size-3 text-primary" />
                    <span className="text-[10px] font-bold text-foreground">{itemCount}</span>
                </div>

                {/* Action menu */}
                <div className="absolute top-3 right-3">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        className="size-8 flex items-center justify-center bg-background/80 backdrop-blur-sm border border-border/50 rounded-full text-muted-foreground hover:text-foreground hover:bg-background transition-colors cursor-pointer"
                    >
                        <MoreHorizontal className="size-4" />
                    </button>

                    {showMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowMenu(false)}
                            />
                            <div className="absolute right-0 top-10 z-20 w-40 bg-background/95 backdrop-blur-xl border border-border/50 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                <button
                                    onClick={() => {
                                        setShowMenu(false);
                                        onEdit(album);
                                    }}
                                    className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
                                >
                                    <Pencil className="size-3.5" />
                                    Edit Album
                                </button>
                                <button
                                    onClick={() => {
                                        setShowMenu(false);
                                        handleShare();
                                    }}
                                    className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
                                >
                                    <Share2 className="size-3.5" />
                                    Share Link
                                </button>
                                <div className="border-t border-border/50" />
                                <button
                                    onClick={() => {
                                        setShowMenu(false);
                                        onDelete(album);
                                    }}
                                    className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                                >
                                    <Trash2 className="size-3.5" />
                                    Delete Album
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Info */}
            <div className="p-4 space-y-2">
                <h3 className="font-bold text-sm text-foreground tracking-tight truncate">
                    {album.name}
                </h3>
                {album.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                        {album.description}
                    </p>
                )}
                <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground/60">
                        <Calendar className="size-3" />
                        <span className="text-[10px] font-mono">{createdDate}</span>
                    </div>
                    <button
                        onClick={handleShare}
                        className={cn(
                            'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer',
                            copied
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20',
                        )}
                    >
                        {copied ? (
                            <>
                                <Check className="size-3" />
                                Copied
                            </>
                        ) : (
                            <>
                                <Copy className="size-3" />
                                Share
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
