'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Send, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/utils/classnames';
import { useCreateComment } from '@/hooks/apis/brick.api';

interface CommentInputProps {
    brickId: string;
    parentId?: string;
    placeholder?: string;
    autoFocus?: boolean;
    onCancel?: () => void;
    onSuccess?: () => void;
}

const MAX_IMAGES = 3;
const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp';

export function CommentInput({
    brickId,
    parentId,
    placeholder = 'Write a comment...',
    autoFocus = false,
    onCancel,
    onSuccess,
}: CommentInputProps) {
    const [content, setContent] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const fileRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const createComment = useCreateComment();

    const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const remaining = MAX_IMAGES - images.length;
        const toAdd = files.slice(0, remaining);

        setImages((prev) => [...prev, ...toAdd]);
        const newPreviews = toAdd.map((f) => URL.createObjectURL(f));
        setPreviews((prev) => [...prev, ...newPreviews]);

        // Reset input
        if (fileRef.current) fileRef.current.value = '';
    };

    const handleRemoveImage = (index: number) => {
        URL.revokeObjectURL(previews[index]);
        setImages((prev) => prev.filter((_, i) => i !== index));
        setPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        const trimmed = content.trim();
        if (!trimmed) return;

        createComment.mutate(
            {
                brickId,
                content: trimmed,
                parentId,
                images: images.length > 0 ? images : undefined,
            },
            {
                onSuccess: () => {
                    setContent('');
                    setImages([]);
                    previews.forEach((p) => URL.revokeObjectURL(p));
                    setPreviews([]);
                    onSuccess?.();
                },
            },
        );
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const adjustHeight = () => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    };

    return (
        <div className="border-t border-primary/10 px-4 py-3">
            {/* Image previews */}
            {previews.length > 0 && (
                <div className="flex gap-2 mb-2 overflow-x-auto scrollbar-none">
                    {previews.map((src, i) => (
                        <div
                            key={src}
                            className="relative shrink-0 size-14 rounded-sm overflow-hidden border border-primary/20"
                        >
                            <Image
                                src={src}
                                alt={`Preview ${i + 1}`}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                            <button
                                type="button"
                                onClick={() => handleRemoveImage(i)}
                                className="absolute -top-0.5 -right-0.5 bg-background/80 rounded-full p-0.5 cursor-pointer"
                            >
                                <X className="size-3 text-destructive" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-end gap-2">
                {/* Image upload */}
                {!parentId && (
                    <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        disabled={images.length >= MAX_IMAGES}
                        className={cn(
                            'p-1.5 rounded transition-colors cursor-pointer shrink-0',
                            'text-muted-foreground/60 hover:text-primary',
                            'disabled:opacity-30 disabled:cursor-not-allowed',
                        )}
                    >
                        <ImagePlus className="size-4" />
                    </button>
                )}

                <input
                    ref={fileRef}
                    type="file"
                    accept={ACCEPTED_TYPES}
                    multiple
                    onChange={handleAddImages}
                    className="hidden"
                />

                {/* Text input */}
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => {
                        setContent(e.target.value);
                        adjustHeight();
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    rows={1}
                    className={cn(
                        'flex-1 resize-none bg-muted/50 border border-primary/10 rounded-lg',
                        'px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40',
                        'focus:outline-none focus:border-primary/30 transition-colors',
                        'scrollbar-hide',
                    )}
                />

                {/* Action buttons */}
                <div className="flex items-center gap-1 shrink-0">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="p-1.5 text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer"
                        >
                            <X className="size-4" />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!content.trim() || createComment.isPending}
                        className={cn(
                            'p-1.5 rounded transition-colors cursor-pointer',
                            'text-primary hover:text-primary/80',
                            'disabled:opacity-30 disabled:cursor-not-allowed',
                        )}
                    >
                        {createComment.isPending ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Send className="size-4" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
