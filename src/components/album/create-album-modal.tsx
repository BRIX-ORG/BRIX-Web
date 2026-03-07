'use client';

import { useState, useRef } from 'react';
import { X, Upload, Plus, Trash2, Loader2, Palette } from 'lucide-react';
import { AxiosError } from 'axios';
import { HexColorPicker } from 'react-colorful';
import Image from 'next/image';
import { cn } from '@/utils/classnames';
import { usePreventScroll } from '@/hooks/usePreventScroll';
import { useCreateAlbum } from '@/hooks/apis/album.api';
import { useSwal } from '@/hooks/useSwal';
import { useToast } from '@/hooks/useToast';
import { useUIStore } from '@/stores/ui-store';

interface CreateAlbumModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ImageItem {
    file: File;
    preview: string;
    title: string;
    description: string;
}

// ─── Reusable inline color picker ──────────────────────────────
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

    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
        if (!ref.current?.contains(e.relatedTarget as Node)) {
            setIsOpen(false);
        }
    };

    return (
        <div className="relative" ref={ref} onBlur={handleBlur}>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">
                {label}
            </label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 w-full bg-muted/30 border border-border/50 rounded-lg px-2.5 py-2 text-sm hover:border-primary/40 transition-colors cursor-pointer"
            >
                <div
                    className="size-4 rounded border border-border/50 shrink-0"
                    style={{ backgroundColor: value || '#1a1a1a' }}
                />
                <span className="text-[11px] font-mono text-muted-foreground truncate">
                    {value || 'Not set'}
                </span>
                <Palette className="size-3 text-muted-foreground ml-auto shrink-0" />
            </button>
            {isOpen && (
                <div className="absolute z-50 top-full mt-2 left-0 bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl p-3 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                    <HexColorPicker color={value || '#1a1a1a'} onChange={onChange} />
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="#1a1a1a"
                        className="mt-2 w-full bg-muted/30 border border-border/30 rounded px-2 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:border-primary/40 transition-colors"
                    />
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════

export function CreateAlbumModal({ isOpen, onClose }: CreateAlbumModalProps) {
    usePreventScroll(isOpen);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [backgroundColor, setBackgroundColor] = useState('');
    const [titleColor, setTitleColor] = useState('');
    const [descriptionColor, setDescriptionColor] = useState('');
    const [imageItems, setImageItems] = useState<ImageItem[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const swal = useSwal();
    const { error: toastError } = useToast();
    const showLoading = useUIStore((s) => s.showLoading);
    const hideLoading = useUIStore((s) => s.hideLoading);
    const createAlbumMutation = useCreateAlbum();

    const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const remaining = 10 - imageItems.length;
        const newFiles = files.slice(0, remaining);

        const newItems: ImageItem[] = newFiles.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
            title: '',
            description: '',
        }));

        setImageItems((prev) => [...prev, ...newItems]);

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleRemoveImage = (index: number) => {
        setImageItems((prev) => {
            const updated = [...prev];
            URL.revokeObjectURL(updated[index].preview);
            updated.splice(index, 1);
            return updated;
        });
    };

    const handleUpdateItem = (index: number, field: 'title' | 'description', value: string) => {
        setImageItems((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            swal.warning('Missing Name', 'Album name is required');
            return;
        }
        if (imageItems.length === 0) {
            swal.warning('No Images', 'Please add at least one image');
            return;
        }

        try {
            showLoading('Creating album...');
            await createAlbumMutation.mutateAsync({
                name: name.trim(),
                description: description.trim() || undefined,
                backgroundColor: backgroundColor || undefined,
                titleColor: titleColor || undefined,
                descriptionColor: descriptionColor || undefined,
                items: imageItems.map((item) => ({
                    title: item.title.trim(),
                    description: item.description.trim(),
                })),
                images: imageItems.map((item) => item.file),
            });
            hideLoading();
            handleClose();
            swal.success('Album Created', 'Your album has been created successfully!');
        } catch (err) {
            hideLoading();
            const errorMessage =
                err instanceof AxiosError
                    ? err.response?.data?.message || err.message
                    : err instanceof Error
                      ? err.message
                      : 'Failed to create album';
            toastError(errorMessage);
        }
    };

    const handleClose = () => {
        imageItems.forEach((item) => URL.revokeObjectURL(item.preview));
        setName('');
        setDescription('');
        setBackgroundColor('');
        setTitleColor('');
        setDescriptionColor('');
        setImageItems([]);
        onClose();
    };

    if (!isOpen) return null;

    const isSubmitting = createAlbumMutation.isPending;

    return (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={isSubmitting ? undefined : handleClose}
            />

            {/* Modal */}
            <div className="relative bg-background/95 w-full max-w-2xl max-h-[90vh] rounded-xl border border-primary/20 backdrop-blur-xl shadow-[0_0_40px_rgba(0,238,255,0.1)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                {/* Decorative corners */}
                <div className="absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl-xl" />
                <div className="absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2 border-primary rounded-tr-xl" />
                <div className="absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2 border-primary rounded-bl-xl" />
                <div className="absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 border-primary rounded-br-xl" />

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-border/50">
                    <div>
                        <h3 className="text-base font-bold text-foreground tracking-tight">
                            Create New Album
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Max 10 images per album
                        </p>
                    </div>
                    {!isSubmitting && (
                        <button
                            onClick={handleClose}
                            className="p-1.5 text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 rounded-md transition-colors cursor-pointer"
                        >
                            <X className="size-4" />
                        </button>
                    )}
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    {/* Name & Description */}
                    <div className="space-y-3">
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
                    </div>

                    {/* Theme Colors */}
                    <div className="border-t border-border/20 pt-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-3">
                            Album Theme Colors
                        </p>
                        <div className="grid grid-cols-3 gap-3">
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

                    {/* Image Upload */}
                    <div className="border-t border-border/20 pt-4">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                Images ({imageItems.length}/10)
                            </label>
                            {imageItems.length < 10 && (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 rounded-full hover:bg-primary/20 transition-colors cursor-pointer"
                                >
                                    <Plus className="size-3" />
                                    Add Images
                                </button>
                            )}
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleAddImages}
                            className="hidden"
                        />

                        {imageItems.length === 0 ? (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full border-2 border-dashed border-border/50 rounded-xl p-8 flex flex-col items-center gap-3 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer"
                            >
                                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Upload className="size-5 text-primary" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium text-foreground">
                                        Click to upload images
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        PNG, JPG, WEBP up to 10 images
                                    </p>
                                </div>
                            </button>
                        ) : (
                            <div className="space-y-3">
                                {imageItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex gap-3 p-3 bg-muted/20 border border-border/30 rounded-lg"
                                    >
                                        {/* Preview */}
                                        <div className="relative size-20 rounded-lg overflow-hidden shrink-0 bg-muted/30">
                                            <Image
                                                src={item.preview}
                                                alt={`Image ${index + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                            <button
                                                onClick={() => handleRemoveImage(index)}
                                                className="absolute top-1 right-1 size-5 flex items-center justify-center bg-destructive/90 rounded-full text-white hover:bg-destructive transition-colors cursor-pointer"
                                            >
                                                <Trash2 className="size-2.5" />
                                            </button>
                                        </div>

                                        {/* Fields */}
                                        <div className="flex-1 space-y-2">
                                            <input
                                                type="text"
                                                value={item.title}
                                                onChange={(e) =>
                                                    handleUpdateItem(index, 'title', e.target.value)
                                                }
                                                placeholder={`Title for page ${index + 1}`}
                                                className="w-full bg-background/50 border border-border/30 rounded px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors"
                                            />
                                            <input
                                                type="text"
                                                value={item.description}
                                                onChange={(e) =>
                                                    handleUpdateItem(
                                                        index,
                                                        'description',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder={`Description for page ${index + 1}`}
                                                className="w-full bg-background/50 border border-border/30 rounded px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-4 bg-muted/30 border-t border-primary/10 flex gap-3">
                    <button
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="flex-1 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider text-muted-foreground border border-border hover:border-foreground/20 hover:text-foreground transition-all cursor-pointer disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !name.trim() || imageItems.length === 0}
                        className={cn(
                            'flex-1 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2',
                            'bg-primary text-primary-foreground hover:brightness-110 shadow-[0_0_12px_rgba(0,238,255,0.3)]',
                        )}
                    >
                        {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
                        {isSubmitting ? 'Creating...' : 'Create Album'}
                    </button>
                </div>
            </div>
        </div>
    );
}
