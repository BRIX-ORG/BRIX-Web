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
import Stack from '@/components/react-bits/Stack';
import { useToast } from '@/hooks/useToast';
import { useTranslations, useLocale } from 'next-intl';

interface AlbumCardProps {
    album: Album;
    onEdit: (album: Album) => void;
    onDelete: (album: Album) => void;
}

export function AlbumCard({ album, onEdit, onDelete }: AlbumCardProps) {
    const t = useTranslations('albums.card');
    const locale = useLocale();
    const [showMenu, setShowMenu] = useState(false);
    const [copied, setCopied] = useState(false);
    const { success } = useToast();

    const itemCount = album.items.length;
    const cards = album.items.map((item, index) => (
        <Image
            key={`${album.id}-item-${index}`}
            src={item.image.url}
            alt={item.title || `${album.name} - ${index + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
    ));

    const createdDate = new Date(album.createdAt).toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    const handleShare = async () => {
        const url = `${window.location.origin}/album/${album.id}`;
        await navigator.clipboard.writeText(url);
        setCopied(true);
        success(t('copied'));
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="group relative bg-background/80 backdrop-blur-xl border border-primary/20 rounded-xl overflow-hidden hover:border-primary/40 transition-all duration-500 hover:shadow-[0_0_30px_rgba(var(--primary),0.12)] flex flex-col h-full">
            {/* Thumbnail */}
            <div className="relative aspect-4/3 bg-muted/30 overflow-hidden">
                {itemCount > 0 ? (
                    <div className="absolute inset-0 p-4" onClick={(e) => e.stopPropagation()}>
                        <Stack
                            randomRotation
                            sensitivity={200}
                            sendToBackOnClick={true}
                            cards={cards}
                            pauseOnHover
                        />
                    </div>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="size-12 text-muted-foreground/20" />
                    </div>
                )}

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Item count badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-primary/20 backdrop-blur-md border border-primary/30 rounded-full px-2 py-0.5">
                    <ImageIcon className="size-3 text-primary" />
                    <span className="text-[10px] font-bold text-primary tracking-wider">
                        {itemCount}
                    </span>
                </div>

                {/* Action menu */}
                <div className="absolute top-3 right-3">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        className="size-8 flex items-center justify-center bg-background/80 backdrop-blur-md border border-border/50 rounded-full text-muted-foreground hover:text-primary hover:border-primary/40 transition-all cursor-pointer"
                    >
                        <MoreHorizontal className="size-4" />
                    </button>

                    {showMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowMenu(false)}
                            />
                            <div className="absolute right-0 top-10 z-20 w-40 bg-background/95 backdrop-blur-2xl border border-primary/20 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                <button
                                    onClick={() => {
                                        setShowMenu(false);
                                        onEdit(album);
                                    }}
                                    className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors cursor-pointer"
                                >
                                    <Pencil className="size-3.5" />
                                    {t('menu.edit')}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowMenu(false);
                                        handleShare();
                                    }}
                                    className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors cursor-pointer"
                                >
                                    <Share2 className="size-3.5" />
                                    {t('menu.share')}
                                </button>
                                <div className="border-t border-white/5" />
                                <button
                                    onClick={() => {
                                        setShowMenu(false);
                                        onDelete(album);
                                    }}
                                    className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                                >
                                    <Trash2 className="size-3.5" />
                                    {t('menu.delete')}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Info */}
            <div className="p-4 flex flex-col flex-1 min-h-0 bg-background/50">
                <div className="space-y-2 mb-4">
                    <h3 className="font-bold text-sm text-foreground tracking-tight truncate group-hover:text-primary transition-colors">
                        {album.name}
                    </h3>
                    {album.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {album.description}
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-between pt-1 mt-auto">
                    <div className="flex items-center gap-1.5 text-muted-foreground/40">
                        <Calendar className="size-3" />
                        <span className="text-[9px] font-mono tracking-tighter uppercase">
                            {createdDate}
                        </span>
                    </div>
                    <button
                        onClick={handleShare}
                        className={cn(
                            'flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer',
                            copied
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20',
                        )}
                    >
                        {copied ? (
                            <>
                                <Check className="size-2.5" />
                                {t('copiedButton')}
                            </>
                        ) : (
                            <>
                                <Copy className="size-2.5" />
                                {t('shareButton')}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
