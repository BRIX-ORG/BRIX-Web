'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface VoiceRecorderState {
    /** Whether the browser supports audio recording */
    isSupported: boolean;
    /** Whether microphone permission has been granted */
    isPermissionGranted: boolean;
    /** Whether currently recording */
    isRecording: boolean;
    /** Recording duration in seconds */
    duration: number;
    /** The recorded audio blob (after stop) */
    audioBlob: Blob | null;
    /** The recorded audio file ready for upload */
    audioFile: File | null;
}

export interface VoiceRecorderActions {
    /** Start recording. Requests mic permission if needed. */
    startRecording: () => Promise<void>;
    /** Stop recording and produce the audio blob/file. */
    stopRecording: () => void;
    /** Cancel recording and discard data. */
    cancelRecording: () => void;
    /** Clear the recorded audio so a new recording can be made. */
    clearRecording: () => void;
}

export type UseVoiceRecorderReturn = VoiceRecorderState & VoiceRecorderActions;

const MIME_TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];

function getSupportedMimeType(): string | undefined {
    if (typeof MediaRecorder === 'undefined') return undefined;
    return MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
}

function getFileExtension(mimeType: string): string {
    if (mimeType.includes('webm')) return 'webm';
    if (mimeType.includes('ogg')) return 'ogg';
    if (mimeType.includes('mp4')) return 'mp4';
    return 'webm';
}

export function useVoiceRecorder(): UseVoiceRecorderReturn {
    const [isSupported] = useState(() => {
        if (typeof window === 'undefined') return false;
        return !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';
    });

    const [isPermissionGranted, setIsPermissionGranted] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const startTimeRef = useRef<number>(0);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop());
            }
        };
    }, []);

    const stopStream = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const startRecording = useCallback(async () => {
        if (!isSupported) return;

        const mimeType = getSupportedMimeType();
        if (!mimeType) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100,
                },
            });

            streamRef.current = stream;
            setIsPermissionGranted(true);

            const recorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = recorder;
            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mimeType });
                const ext = getFileExtension(mimeType);
                const file = new File([blob], `voice-${Date.now()}.${ext}`, { type: mimeType });

                setAudioBlob(blob);
                setAudioFile(file);
                setIsRecording(false);
                stopStream();
            };

            // Start
            recorder.start(100); // collect data every 100ms for smoother experience
            setIsRecording(true);
            setAudioBlob(null);
            setAudioFile(null);
            setDuration(0);
            startTimeRef.current = Date.now();

            // Duration timer
            timerRef.current = setInterval(() => {
                setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
            }, 1000);
        } catch {
            setIsPermissionGranted(false);
        }
    }, [isSupported, stopStream]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    }, []);

    const cancelRecording = useCallback(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.ondataavailable = null;
            mediaRecorderRef.current.onstop = null;
            mediaRecorderRef.current.stop();
        }
        chunksRef.current = [];
        setIsRecording(false);
        setDuration(0);
        setAudioBlob(null);
        setAudioFile(null);
        stopStream();
    }, [stopStream]);

    const clearRecording = useCallback(() => {
        setAudioBlob(null);
        setAudioFile(null);
        setDuration(0);
    }, []);

    return {
        isSupported,
        isPermissionGranted,
        isRecording,
        duration,
        audioBlob,
        audioFile,
        startRecording,
        stopRecording,
        cancelRecording,
        clearRecording,
    };
}
