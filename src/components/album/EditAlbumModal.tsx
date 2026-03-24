'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Loader2, Palette } from 'lucide-react';
import { AxiosError } from 'axios';
import { HexColorPicker } from 'react-colorful';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/classnames';
import { usePreventScroll } from '@/hooks/usePreventScroll';
import { useUpdateAlbum } from '@/hooks/apis/album.api';
import { useSwal } from '@/hooks/useSwal';
import { useToast } from '@/hooks/useToast';
import { useUIStore } from '@/stores/ui-store';
import { useTranslations } from 'next-intl';
import type { Album } from '@/types/album.types';

interface EditAlbumModalProps {
    album: Album | null;
    onClose: () => void;
}

function ColorPickerField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [rect, setRect] = useState<DOMRect | null>(null);
    const ref = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                // If portal is used, we need to check if the target is in the portal too
                const portal = document.getElementById('color-picker-container');
                if (portal && portal.contains(e.target as Node)) return;
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOpen = () => {
        if (!isOpen && buttonRef.current) {
            setRect(buttonRef.current.getBoundingClientRect());
        }
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative" ref={ref}>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">
                {label}
            </label>
            <button
                ref={buttonRef}
                onClick={toggleOpen}
                className="flex items-center gap-2.5 w-full bg-muted/30 border border-border/50 rounded-lg px-3 py-2.5 text-sm hover:border-primary/40 transition-colors cursor-pointer"
            >
                <div
                    className="size-5 rounded border border-border/50 shrink-0"
                    style={{ backgroundColor: value || '#ffffff' }}
                />
                <span className="text-xs font-mono text-muted-foreground">
                    {value || 'Not set'}
                </span>
                <Palette className="size-3.5 text-muted-foreground ml-auto" />
            </button>

            {isOpen &&
                rect &&
                createPortal(
                    <div
                        id="color-picker-container"
                        className="fixed z-10000 bg-zinc-950/95 backdrop-blur-2xl border border-primary/40 rounded-xl p-3 shadow-[0_0_50px_rgba(0,238,255,0.2)] animate-in fade-in slide-in-from-top-2 zoom-in-95 duration-200"
                        style={{
                            top: rect.bottom + 8,
                            left: rect.left,
                            width: 240, // Match picker width
                        }}
                    >
                        <HexColorPicker color={value || '#ffffff'} onChange={onChange} />
                        <div className="mt-3 space-y-2">
                            <div className="flex items-center gap-2">
                                <div
                                    className="size-4 rounded border border-white/20"
                                    style={{ backgroundColor: value || '#ffffff' }}
                                />
                                <input
                                    type="text"
                                    value={value || ''}
                                    onChange={(e) => onChange(e.target.value)}
                                    placeholder="#ffffff"
                                    className="flex-1 bg-muted/20 border border-border/30 rounded px-2 py-1.5 text-[10px] font-mono text-foreground focus:outline-none focus:border-primary/40 transition-colors"
                                />
                            </div>
                        </div>
                    </div>,
                    document.body,
                )}
        </div>
    );
}

export function EditAlbumModal({ album, onClose }: EditAlbumModalProps) {
    const t = useTranslations('albums.createModal');
    const isOpen = !!album;
    usePreventScroll(isOpen);

    const [name, setName] = useState(album?.name ?? '');
    const [description, setDescription] = useState(album?.description ?? '');
    const [bgColor1, setBgColor1] = useState(album?.background?.[0] ?? '#1a1a2e');
    const [bgColor2, setBgColor2] = useState(album?.background?.[1] ?? '#16213e');
    const [bgColor3, setBgColor3] = useState(album?.background?.[2] ?? '#0f3460');
    const [titleColor, setTitleColor] = useState(album?.titleColor ?? '');
    const [descriptionColor, setDescriptionColor] = useState(album?.descriptionColor ?? '');
    const swal = useSwal();
    const { error: toastError } = useToast();
    const showLoading = useUIStore((s) => s.showLoading);
    const hideLoading = useUIStore((s) => s.hideLoading);
    const updateAlbumMutation = useUpdateAlbum();

    // Re-sync local state when album prop changes (modal opens with different album)
    const albumId = album?.id;
    useEffect(() => {
        if (!album) return;
        setName(album.name);
        setDescription(album.description ?? '');
        setBgColor1(album.background?.[0] ?? '#1a1a2e');
        setBgColor2(album.background?.[1] ?? '#16213e');
        setBgColor3(album.background?.[2] ?? '#0f3460');
        setTitleColor(album.titleColor ?? '');
        setDescriptionColor(album.descriptionColor ?? '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [albumId]);

    const handleSubmit = async () => {
        if (!album || !name.trim()) return;

        try {
            showLoading('Updating album...');
            await updateAlbumMutation.mutateAsync({
                albumId: album.id,
                data: {
                    name: name.trim(),
                    description: description.trim() || undefined,
                    background: [bgColor1, bgColor2, bgColor3],
                    titleColor: titleColor || undefined,
                    descriptionColor: descriptionColor || undefined,
                },
            });
            hideLoading();
            onClose();
            swal.success(t('footer.submit'), t('footer.submit')); // Album Updated?
        } catch (err) {
            hideLoading();
            const errorMessage =
                err instanceof AxiosError
                    ? err.response?.data?.message || err.message
                    : err instanceof Error
                      ? err.message
                      : t('footer.error') || 'Failed to update album';
            toastError(errorMessage);
        }
    };

    if (!isOpen) return null;

    const isSubmitting = updateAlbumMutation.isPending;

    return (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={isSubmitting ? undefined : onClose}
            />

            <div className="relative bg-background/95 w-full max-w-lg max-h-[90vh] rounded-xl border border-primary/20 backdrop-blur-xl shadow-[0_0_40px_rgba(0,238,255,0.1)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                {/* Decorative corners */}
                <div className="absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl-xl" />
                <div className="absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2 border-primary rounded-tr-xl" />
                <div className="absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2 border-primary rounded-bl-xl" />
                <div className="absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 border-primary rounded-br-xl" />

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-border/50">
                    <h3 className="text-base font-bold text-foreground tracking-tight">
                        {t('title')}
                    </h3>
                    {!isSubmitting && (
                        <button
                            onClick={onClose}
                            className="p-1.5 text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 rounded-md transition-colors cursor-pointer"
                        >
                            <X className="size-4" />
                        </button>
                    )}
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">
                            {t('fields.name.label')}
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t('fields.name.placeholder')}
                            maxLength={100}
                            className="w-full bg-muted/30 border border-border/50 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">
                            {t('fields.description.label')}
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('fields.description.placeholder')}
                            maxLength={500}
                            rows={2}
                            className="w-full bg-muted/30 border border-border/50 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                        />
                    </div>

                    {/* Color Settings */}
                    <div className="border-t border-border/30 pt-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-1">
                            {t('etherColors.title')}
                        </p>
                        <p className="text-[9px] text-muted-foreground/60 mb-3">
                            {t('etherColors.subtitle')}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <ColorPickerField
                                label={t('etherColors.labels.0')}
                                value={bgColor1}
                                onChange={setBgColor1}
                            />
                            <ColorPickerField
                                label={t('etherColors.labels.1')}
                                value={bgColor2}
                                onChange={setBgColor2}
                            />
                            <ColorPickerField
                                label={t('etherColors.labels.2')}
                                value={bgColor3}
                                onChange={setBgColor3}
                            />
                        </div>
                    </div>

                    {/* Text Colors */}
                    <div className="border-t border-border/30 pt-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-1">
                            {t('textColors.title')}
                        </p>
                        <p className="text-[9px] text-muted-foreground/60 mb-3">
                            {t('textColors.subtitle')}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <ColorPickerField
                                label={t('textColors.labels.title')}
                                value={titleColor}
                                onChange={setTitleColor}
                            />
                            <ColorPickerField
                                label={t('textColors.labels.description')}
                                value={descriptionColor}
                                onChange={setDescriptionColor}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-4 bg-muted/30 border-t border-primary/10 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex-1 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider text-muted-foreground border border-border hover:border-foreground/20 hover:text-foreground transition-all cursor-pointer disabled:opacity-50"
                    >
                        {t('footer.cancel')}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !name.trim()}
                        className={cn(
                            'flex-1 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2',
                            'bg-primary text-primary-foreground hover:brightness-110 shadow-[0_0_12px_rgba(0,238,255,0.3)]',
                        )}
                    >
                        {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
                        {isSubmitting ? t('footer.submitting') : t('footer.submit')}
                    </button>
                </div>
            </div>
        </div>
    );
}
