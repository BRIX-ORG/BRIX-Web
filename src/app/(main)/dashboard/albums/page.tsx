'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { BookImage, Plus } from 'lucide-react';
import { AxiosError } from 'axios';
import { useGetAlbums, useDeleteAlbum } from '@/hooks/apis/album.api';
import { AlbumCard, AlbumSkeleton, CreateAlbumModal, EditAlbumModal } from '@/components/album';
import { ConfirmPopup } from '@/components/shared';
import { useSwal } from '@/hooks/useSwal';
import { useToast } from '@/hooks/useToast';
import { useUIStore } from '@/stores/ui-store';
import { useTranslations } from 'next-intl';
import type { Album } from '@/types/album.types';

export default function AlbumsPage() {
    const t = useTranslations('albums');
    const { data: session } = useSession();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
    const [deletingAlbum, setDeletingAlbum] = useState<Album | null>(null);
    const swal = useSwal();
    const { error: toastError } = useToast();
    const showLoading = useUIStore((s) => s.showLoading);
    const hideLoading = useUIStore((s) => s.hideLoading);
    const deleteAlbumMutation = useDeleteAlbum();

    const { data, isLoading } = useGetAlbums(50, 0);
    const albums = data?.data ?? [];

    const handleDelete = async () => {
        if (!deletingAlbum) return;
        try {
            showLoading(t('delete.loading'));
            await deleteAlbumMutation.mutateAsync(deletingAlbum.id);
            hideLoading();
            setDeletingAlbum(null);
            swal.success(t('delete.success'), t('delete.successDesc'));
        } catch (err) {
            hideLoading();
            const errorMessage =
                err instanceof AxiosError
                    ? err.response?.data?.message || err.message
                    : err instanceof Error
                      ? err.message
                      : t('delete.error');
            toastError(errorMessage);
        }
    };

    if (!session) return null;

    return (
        <div className="p-8 max-w-280 mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-primary/20">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 text-primary">
                        <BookImage className="size-6" />
                        <h1 className="text-2xl font-bold tracking-tight uppercase">
                            {t('title')}
                        </h1>
                    </div>
                    <p className="text-muted-foreground text-sm font-mono uppercase tracking-[0.2em] opacity-70">
                        {t('subtitle', { count: albums.length })}
                    </p>
                </div>

                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:brightness-110 rounded-sm shadow-[0_0_12px_rgba(0,238,255,0.3)] transition-all cursor-pointer"
                >
                    <Plus className="size-4" />
                    {t('newAlbum')}
                </button>
            </div>

            {/* Grid Section */}
            {isLoading ? (
                <AlbumSkeleton />
            ) : albums.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {albums.map((album) => (
                        <AlbumCard
                            key={album.id}
                            album={album}
                            onEdit={setEditingAlbum}
                            onDelete={setDeletingAlbum}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 border border-dashed border-primary/10 rounded-2xl bg-primary/5">
                    <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <BookImage className="size-8 text-primary/40" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{t('empty.title')}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{t('empty.description')}</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:brightness-110 rounded-sm shadow-[0_0_12px_rgba(0,238,255,0.3)] transition-all cursor-pointer"
                    >
                        <Plus className="size-4" />
                        {t('empty.button')}
                    </button>
                </div>
            )}

            {/* Create Album Modal */}
            <CreateAlbumModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />

            {/* Edit Album Modal */}
            <EditAlbumModal album={editingAlbum} onClose={() => setEditingAlbum(null)} />

            {/* Delete Confirmation */}
            <ConfirmPopup
                isOpen={!!deletingAlbum}
                onClose={() => setDeletingAlbum(null)}
                onConfirm={handleDelete}
                title={t('delete.confirm.title')}
                message={t('delete.confirm.message', { name: deletingAlbum?.name || '' })}
                confirmText={t('delete.confirm.confirmText')}
                type="danger"
                isLoading={deleteAlbumMutation.isPending}
            />
        </div>
    );
}
