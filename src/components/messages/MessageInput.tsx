'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
    Camera,
    FileUp,
    Loader2,
    Mic,
    MicOff,
    Paperclip,
    Play,
    Send,
    Smile,
    Square,
    Trash2,
    X,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { EmojiStyle, Theme } from 'emoji-picker-react';
import type { EmojiClickData } from 'emoji-picker-react';
import { cn } from '@/utils/classnames';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

const MAX_IMAGES = 3;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface MessageInputProps {
    onSend: (data: { content?: string; images?: File[]; voice?: File; file?: File }) => void;
    onTyping?: () => void;
    onStopTyping?: () => void;
    disabled?: boolean;
    isSending?: boolean;
}

export function MessageInput({
    onSend,
    onTyping,
    onStopTyping,
    disabled,
    isSending,
}: MessageInputProps) {
    const [content, setContent] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [attachedFile, setAttachedFile] = useState<File | null>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isTypingRef = useRef(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const voice = useVoiceRecorder();

    // Close emoji picker on outside click
    useEffect(() => {
        if (!showEmojiPicker) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showEmojiPicker]);

    // Cleanup image previews on unmount
    useEffect(() => {
        return () => {
            imagePreviews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [imagePreviews]);

    // Auto-resize textarea
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }, [content]);

    // ─── Typing indicators ──────────────────────────────────

    const handleTyping = useCallback(() => {
        if (!isTypingRef.current) {
            isTypingRef.current = true;
            onTyping?.();
        }
        // Reset stop-typing timer
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            isTypingRef.current = false;
            onStopTyping?.();
        }, 2000);
    }, [onTyping, onStopTyping]);

    // ─── Submit ─────────────────────────────────────────────

    const handleSubmit = () => {
        const trimmed = content.trim();
        if (!trimmed && images.length === 0 && !attachedFile && !voice.audioFile) return;

        onSend({
            content: trimmed || undefined,
            images: images.length > 0 ? images : undefined,
            file: attachedFile || undefined,
            voice: voice.audioFile || undefined,
        });

        // Reset state
        setContent('');
        setImages([]);
        imagePreviews.forEach((url) => URL.revokeObjectURL(url));
        setImagePreviews([]);
        setAttachedFile(null);

        // Stop typing
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        if (isTypingRef.current) {
            isTypingRef.current = false;
            onStopTyping?.();
        }

        // Re-focus
        textareaRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    // ─── Emoji ──────────────────────────────────────────────

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setContent((prev) => prev + emojiData.emoji);
        textareaRef.current?.focus();
    };

    // ─── Image upload ───────────────────────────────────────

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validFiles = files
            .filter((f) => f.type.startsWith('image/') && f.size <= MAX_IMAGE_SIZE)
            .slice(0, MAX_IMAGES - images.length);

        if (validFiles.length > 0) {
            setImages((prev) => [...prev, ...validFiles]);
            setImagePreviews((prev) => [...prev, ...validFiles.map((f) => URL.createObjectURL(f))]);
            // Clear file attachment if images are added
            setAttachedFile(null);
        }
        // Reset input
        if (imageInputRef.current) imageInputRef.current.value = '';
    };

    const removeImage = (index: number) => {
        URL.revokeObjectURL(imagePreviews[index]);
        setImages((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    // ─── File upload ────────────────────────────────────────

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.size <= MAX_FILE_SIZE) {
            setAttachedFile(file);
            // Clear images if file is attached
            imagePreviews.forEach((url) => URL.revokeObjectURL(url));
            setImages([]);
            setImagePreviews([]);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ─── Voice playback ─────────────────────────────────────

    const togglePlayback = useCallback(() => {
        if (!voice.audioBlob) return;

        if (isPlaying && audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
            setIsPlaying(false);
            return;
        }

        const audio = new Audio(URL.createObjectURL(voice.audioBlob));
        audioRef.current = audio;
        audio.onended = () => {
            setIsPlaying(false);
            audioRef.current = null;
        };
        audio.play();
        setIsPlaying(true);
    }, [voice.audioBlob, isPlaying]);

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const hasAttachment = images.length > 0 || attachedFile || voice.audioFile;

    return (
        <div className="relative p-4 bg-background/80 backdrop-blur-md border-t border-border">
            {/* Emoji Picker */}
            {showEmojiPicker && (
                <div ref={emojiPickerRef} className="absolute bottom-full left-4 mb-2 z-50">
                    <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        theme={Theme.DARK}
                        emojiStyle={EmojiStyle.APPLE}
                        lazyLoadEmojis
                        width={350}
                        height={400}
                    />
                </div>
            )}

            {/* Voice recording overlay */}
            {voice.isRecording && (
                <div className="flex items-center gap-3 mb-3 px-3 py-2 bg-destructive/10 border border-destructive/30 rounded-sm animate-pulse">
                    <div className="size-2 rounded-full bg-destructive animate-pulse" />
                    <span className="text-xs font-bold text-destructive uppercase tracking-widest">
                        Recording {formatDuration(voice.duration)}
                    </span>
                    <div className="flex-1" />
                    <button
                        type="button"
                        onClick={voice.cancelRecording}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                        <Trash2 className="size-4" />
                    </button>
                    <button
                        type="button"
                        onClick={voice.stopRecording}
                        className="size-7 flex items-center justify-center bg-destructive text-destructive-foreground rounded-sm hover:bg-destructive/80 transition-colors"
                    >
                        <Square className="size-3" />
                    </button>
                </div>
            )}

            {/* Voice preview (after recording, before send) */}
            {!voice.isRecording && voice.audioFile && (
                <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-muted border border-border rounded-sm">
                    <button
                        type="button"
                        onClick={togglePlayback}
                        className="size-7 flex items-center justify-center bg-primary text-primary-foreground rounded-sm shrink-0"
                    >
                        {isPlaying ? <Square className="size-3" /> : <Play className="size-3" />}
                    </button>
                    <div className="flex-1">
                        <div className="h-1 bg-primary/20 rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    'h-full bg-primary rounded-full transition-all',
                                    isPlaying ? 'animate-pulse w-full' : 'w-0',
                                )}
                            />
                        </div>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                        {formatDuration(voice.duration)}
                    </span>
                    <button
                        type="button"
                        onClick={() => {
                            voice.clearRecording();
                            setIsPlaying(false);
                            if (audioRef.current) {
                                audioRef.current.pause();
                                audioRef.current = null;
                            }
                        }}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <X className="size-3" />
                    </button>
                </div>
            )}

            {/* Image previews */}
            {imagePreviews.length > 0 && (
                <div className="flex gap-2 mb-3">
                    {imagePreviews.map((url, i) => (
                        <div
                            key={url}
                            className="relative size-16 rounded-sm overflow-hidden border border-border group"
                        >
                            <Image
                                src={url}
                                alt={`Upload ${i + 1}`}
                                fill
                                className="object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => removeImage(i)}
                                className="absolute top-0 right-0 size-5 flex items-center justify-center bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="size-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* File attachment preview */}
            {attachedFile && (
                <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-muted border border-border rounded-sm">
                    <FileUp className="size-4 text-primary/60 shrink-0" />
                    <span className="text-xs font-bold truncate flex-1">{attachedFile.name}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                        {(attachedFile.size / 1024).toFixed(1)} KB
                    </span>
                    <button
                        type="button"
                        onClick={() => setAttachedFile(null)}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <X className="size-3" />
                    </button>
                </div>
            )}

            {/* Hidden file inputs */}
            <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageSelect}
            />
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />

            <div className="flex items-center gap-3 bg-muted border border-border rounded p-2 focus-within:border-primary transition-all">
                {/* Image upload */}
                <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={disabled || images.length >= MAX_IMAGES || !!attachedFile}
                    className={cn(
                        'size-9 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors shrink-0',
                        (images.length >= MAX_IMAGES || !!attachedFile) &&
                            'opacity-30 cursor-not-allowed',
                    )}
                >
                    <Camera className="size-5" />
                </button>

                {/* File upload */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || images.length > 0}
                    className={cn(
                        'size-9 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors shrink-0',
                        images.length > 0 && 'opacity-30 cursor-not-allowed',
                    )}
                >
                    <Paperclip className="size-5" />
                </button>

                {/* Emoji */}
                <button
                    type="button"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                    className={cn(
                        'size-9 flex items-center justify-center transition-colors shrink-0',
                        showEmojiPicker
                            ? 'text-primary'
                            : 'text-muted-foreground hover:text-primary',
                    )}
                >
                    <Smile className="size-5" />
                </button>

                {/* Voice */}
                {voice.isSupported && (
                    <button
                        type="button"
                        onClick={voice.isRecording ? voice.stopRecording : voice.startRecording}
                        disabled={disabled || images.length > 0 || !!attachedFile}
                        className={cn(
                            'size-9 flex items-center justify-center transition-colors shrink-0',
                            voice.isRecording
                                ? 'text-destructive animate-pulse'
                                : 'text-muted-foreground hover:text-primary',
                            (images.length > 0 || !!attachedFile) &&
                                'opacity-30 cursor-not-allowed',
                        )}
                    >
                        {voice.isRecording ? (
                            <MicOff className="size-5" />
                        ) : (
                            <Mic className="size-5" />
                        )}
                    </button>
                )}

                {/* Textarea */}
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => {
                        setContent(e.target.value);
                        handleTyping();
                    }}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    rows={1}
                    className="flex-1 bg-transparent border-none text-sm focus:ring-0 placeholder:text-muted-foreground font-bold tracking-tight outline-none resize-none max-h-30"
                    placeholder="TRANSMIT SECURE DATA..."
                />

                {/* Send */}
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={disabled || isSending || (!content.trim() && !hasAttachment)}
                    className={cn(
                        'bg-primary text-primary-foreground px-4 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white transition-colors shrink-0',
                        (disabled || isSending || (!content.trim() && !hasAttachment)) &&
                            'opacity-40 cursor-not-allowed',
                    )}
                >
                    {isSending ? (
                        <>
                            <Loader2 className="size-3 animate-spin" />
                            SENDING
                        </>
                    ) : (
                        <>
                            SEND
                            <Send className="size-3" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
