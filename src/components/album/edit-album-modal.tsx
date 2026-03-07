'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Loader2, Palette } from 'lucide-react';
import { AxiosError } from 'axios';
import { HexColorPicker } from 'react-colorful';
import { cn } from '@/utils/classnames';
import { usePreventScroll } from '@/hooks/usePreventScroll';
import { useUpdateAlbum } from '@/hooks/apis/album.api';
import { useSwal } from '@/hooks/useSwal';
import { useToast } from '@/hooks/useToast';
import { useUIStore } from '@/stores/ui-store';
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
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">
                {label}
            </label>
            <button
                onClick={() => setIsOpen(!isOpen)}
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
            {isOpen && (
                <div className="absolute z-50 top-full mt-2 left-0 bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl p-3 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                    <HexColorPicker color={value || '#ffffff'} onChange={onChange} />
                    <input
                        type="text"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="#ffffff"
                        className="mt-2 w-full bg-muted/30 border border-border/30 rounded px-2 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:border-primary/40 transition-colors"
                    />
                </div>
            )}
        </div>
    );
}

export function EditAlbumModal({ album, onClose }: EditAlbumModalProps) {
    const isOpen = !!album;
    usePreventScroll(isOpen);

    const [name, setName] = useState(album?.name ?? '');
    const [description, setDescription] = useState(album?.description ?? '');
    const [backgroundColor, setBackgroundColor] = useState(album?.backgroundColor ?? '');
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
        setBackgroundColor(album.backgroundColor ?? '');
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
                    backgroundColor: backgroundColor || undefined,
                    titleColor: titleColor || undefined,
                    descriptionColor: descriptionColor || undefined,
                },
            });
            hideLoading();
            onClose();
            swal.success('Album Updated', 'Your album has been updated successfully!');
        } catch (err) {
            hideLoading();
            const errorMessage =
                err instanceof AxiosError
                    ? err.response?.data?.message || err.message
                    : err instanceof Error
                      ? err.message
                      : 'Failed to update album';
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
                        Edit Album
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
                            Album Name *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter album name..."
                            maxLength={100}
                            className="w-full bg-muted/30 border border-border/50 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add a description..."
                            maxLength={500}
                            rows={2}
                            className="w-full bg-muted/30 border border-border/50 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                        />
                    </div>

                    {/* Color Settings */}
                    <div className="border-t border-border/30 pt-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-3">
                            Album Theme Colors
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <ColorPickerField
                                label="Background"
                                value={backgroundColor}
                                onChange={setBackgroundColor}
                            />
                            <ColorPickerField
                                label="Title"
                                value={titleColor}
                                onChange={setTitleColor}
                            />
                            <ColorPickerField
                                label="Description"
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
                        Cancel
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
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}
