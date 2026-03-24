'use client';

import { useState, useRef } from 'react';
import { X, Upload, Plus, Trash2, Loader2, Palette } from 'lucide-react';
import { AxiosError } from 'axios';
import { HexColorPicker } from 'react-colorful';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { cn } from '@/utils/classnames';
import { usePreventScroll } from '@/hooks/usePreventScroll';
import { useCreateAlbum } from '@/hooks/apis/album.api';
import { useSwal } from '@/hooks/useSwal';
import { useToast } from '@/hooks/useToast';
import { useUIStore } from '@/stores/ui-store';
import { useTranslations } from 'next-intl';

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
    const [rect, setRect] = useState<DOMRect | null>(null);
    const ref = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
        if (!ref.current?.contains(e.relatedTarget as Node)) {
            // Check if focus went to portal
            const portal = document.getElementById('color-picker-container');
            if (portal && portal.contains(e.relatedTarget as Node)) return;
            setIsOpen(false);
        }
    };

    const toggleOpen = () => {
        if (!isOpen && buttonRef.current) {
            setRect(buttonRef.current.getBoundingClientRect());
        }
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative" ref={ref} onBlur={handleBlur}>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">
                {label}
            </label>
            <button
                ref={buttonRef}
                type="button"
                onClick={toggleOpen}
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
            {isOpen &&
                rect &&
                createPortal(
                    <div
                        id="color-picker-container"
                        className="fixed z-10000 bg-zinc-950/95 backdrop-blur-2xl border border-primary/40 rounded-xl p-3 shadow-[0_0_50px_rgba(0,238,255,0.2)] animate-in fade-in slide-in-from-top-2 zoom-in-95 duration-200"
                        style={{
                            top: rect.bottom + 8,
                            left: rect.left,
                            width: 220, // Match picker width
                        }}
                    >
                        <HexColorPicker color={value || '#1a1a1a'} onChange={onChange} />
                        <div className="mt-3 space-y-2">
                            <div className="flex items-center gap-2">
                                <div
                                    className="size-4 rounded border border-white/20"
                                    style={{ backgroundColor: value || '#1a1a1a' }}
                                />
                                <input
                                    type="text"
                                    value={value}
                                    onChange={(e) => onChange(e.target.value)}
                                    placeholder="#1a1a1a"
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

// ═══════════════════════════════════════════════════════════════

export function CreateAlbumModal({ isOpen, onClose }: CreateAlbumModalProps) {
    const t = useTranslations('albums.createModal');
    usePreventScroll(isOpen);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [bgColor1, setBgColor1] = useState('#1a1a2e');
    const [bgColor2, setBgColor2] = useState('#16213e');
    const [bgColor3, setBgColor3] = useState('#0f3460');
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
            swal.warning(t('fields.name.placeholder'), t('fields.name.placeholder')); // Missing Name?
            return;
        }
        if (imageItems.length === 0) {
            swal.warning(t('images.placeholder.title'), t('images.placeholder.title')); // No Images?
            return;
        }

        try {
            showLoading(t('footer.submitting'));
            await createAlbumMutation.mutateAsync({
                name: name.trim(),
                description: description.trim() || undefined,
                background: [bgColor1, bgColor2, bgColor3],
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
            swal.success(t('footer.submit'), t('footer.submit')); // Album Created?
        } catch (err) {
            hideLoading();
            const errorMessage =
                err instanceof AxiosError
                    ? err.response?.data?.message || err.message
                    : err instanceof Error
                      ? err.message
                      : t('footer.error') || 'Failed to create album';
            toastError(errorMessage);
        }
    };

    const handleClose = () => {
        imageItems.forEach((item) => URL.revokeObjectURL(item.preview));
        setName('');
        setDescription('');
        setBgColor1('#1a1a2e');
        setBgColor2('#16213e');
        setBgColor3('#0f3460');
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
                            {t('title')}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{t('subtitle')}</p>
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
                    </div>

                    {/* Ether Colors */}
                    <div className="border-t border-border/20 pt-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-1">
                            {t('etherColors.title')}
                        </p>
                        <p className="text-[9px] text-muted-foreground/60 mb-3">
                            {t('etherColors.subtitle')}
                        </p>
                        <div className="grid grid-cols-3 gap-3">
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
                    <div className="border-t border-border/20 pt-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-1">
                            {t('textColors.title')}
                        </p>
                        <p className="text-[9px] text-muted-foreground/60 mb-3">
                            {t('textColors.subtitle')}
                        </p>
                        <div className="grid grid-cols-2 gap-3">
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

                    {/* Image Upload */}
                    <div className="border-t border-border/20 pt-4">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                {t('images.label', { count: imageItems.length })}
                            </label>
                            {imageItems.length < 10 && (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 rounded-full hover:bg-primary/20 transition-colors cursor-pointer"
                                >
                                    <Plus className="size-3" />
                                    {t('images.button')}
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
                                        {t('images.placeholder.title')}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {t('images.placeholder.subtitle')}
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
                                                placeholder={t('images.item.titlePlaceholder', {
                                                    n: index + 1,
                                                })}
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
                                                placeholder={t('images.item.descPlaceholder', {
                                                    n: index + 1,
                                                })}
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
                        {t('footer.cancel')}
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
                        {isSubmitting ? t('footer.submitting') : t('footer.submit')}
                    </button>
                </div>
            </div>
        </div>
    );
}
