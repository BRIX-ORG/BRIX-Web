'use client';

import { useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { cn } from '@/utils/classnames';
import type { MessageVoice } from '@/types/message.types';

interface VoicePlayerProps {
    voice: MessageVoice;
    isMe: boolean;
}

export function VoicePlayer({ voice, isMe }: VoicePlayerProps) {
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const togglePlayback = () => {
        if (playing && audioRef.current) {
            audioRef.current.pause();
            setPlaying(false);
            return;
        }

        if (audioRef.current) {
            audioRef.current.play();
            setPlaying(true);
            return;
        }

        const audio = new Audio(voice.url);
        audioRef.current = audio;

        audio.addEventListener('timeupdate', () => {
            if (audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
                setCurrentTime(Math.floor(audio.currentTime));
            }
        });

        audio.addEventListener('ended', () => {
            setPlaying(false);
            setProgress(0);
            setCurrentTime(0);
            audioRef.current = null;
        });

        audio.play();
        setPlaying(true);
    };

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div
            className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-sm mb-1 min-w-48',
                isMe ? 'bg-primary/5 border border-primary/30' : 'bg-muted/80 border border-border',
            )}
        >
            <button
                type="button"
                onClick={togglePlayback}
                className="size-8 flex items-center justify-center bg-primary text-primary-foreground rounded-full shrink-0 hover:brightness-110 transition-all"
            >
                {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5 ml-0.5" />}
            </button>
            <div className="flex-1 flex flex-col gap-1">
                <div className="h-1 bg-muted-foreground/20 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary rounded-full transition-all duration-200"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">
                    {playing
                        ? formatDuration(currentTime)
                        : formatDuration(Math.round(voice.duration))}
                </span>
            </div>
        </div>
    );
}
