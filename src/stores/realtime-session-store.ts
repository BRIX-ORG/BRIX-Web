import { create } from 'zustand';

export type RealtimeSessionStatus =
    | 'idle'
    | 'requesting'
    | 'active'
    | 'capturing'
    | 'uploading'
    | 'success'
    | 'expired'
    | 'error';

/**
 * How long (in seconds) the user has to take the photo once the session starts.
 * The remaining time (expiresIn − CAPTURE_PHASE_SECONDS) is for filling the form.
 */
export const CAPTURE_PHASE_SECONDS = 30;

interface RealtimeSessionState {
    // Session data from API
    sessionId: string | null;
    qrToken: string | null;
    expiresIn: number;

    // Countdown — ticks the full session TTL (90s from BE)
    countdown: number;
    countdownInterval: ReturnType<typeof setInterval> | null;

    // Status
    status: RealtimeSessionStatus;
    error: string | null;

    // Captured image blob
    capturedBlob: Blob | null;
    capturedPreview: string | null;
}

interface RealtimeSessionActions {
    /** Set session data from API response and start countdown */
    startSession: (sessionId: string, qrToken: string, expiresIn: number) => void;

    /** Tick countdown by 1 second */
    tick: () => void;

    /** Mark session as expired */
    expire: () => void;

    /** Set status to requesting (creating session) */
    setRequesting: () => void;

    /** Set status to capturing (photo taken, form phase begins) */
    setCapturing: () => void;

    /** Store captured image blob and preview URL */
    setCapturedImage: (blob: Blob, previewUrl: string) => void;

    /** Set status to uploading */
    setUploading: () => void;

    /** Set status to success */
    setSuccess: () => void;

    /** Set error */
    setError: (error: string) => void;

    /** Clear captured image and return to idle state */
    retakePhoto: () => void;

    /** Full reset to idle state */
    reset: () => void;
}

type RealtimeSessionStore = RealtimeSessionState & RealtimeSessionActions;

const initialState: RealtimeSessionState = {
    sessionId: null,
    qrToken: null,
    expiresIn: 90,
    countdown: 0,
    countdownInterval: null,
    status: 'idle',
    error: null,
    capturedBlob: null,
    capturedPreview: null,
};

export const useRealtimeSessionStore = create<RealtimeSessionStore>((set, get) => ({
    ...initialState,

    startSession: (sessionId, qrToken, expiresIn) => {
        // Clear any previous interval
        const prev = get().countdownInterval;
        if (prev) clearInterval(prev);

        // Start countdown interval — ticks the full session TTL
        const interval = setInterval(() => {
            const state = get();
            if (state.countdown <= 1) {
                state.expire();
            } else {
                const next = state.countdown - 1;
                // During capture phase, auto-expire if capture-phase window elapses
                if (state.status === 'active' && next <= state.expiresIn - CAPTURE_PHASE_SECONDS) {
                    state.expire();
                } else {
                    set({ countdown: next });
                }
            }
        }, 1000);

        set({
            sessionId,
            qrToken,
            expiresIn,
            countdown: expiresIn,
            countdownInterval: interval,
            status: 'active',
            error: null,
            capturedBlob: null,
            capturedPreview: null,
        });
    },

    tick: () => {
        const state = get();
        if (state.countdown <= 1) {
            state.expire();
        } else {
            set({ countdown: state.countdown - 1 });
        }
    },

    expire: () => {
        const interval = get().countdownInterval;
        if (interval) clearInterval(interval);

        set({
            status: 'expired',
            countdownInterval: null,
        });
    },

    setRequesting: () => set({ status: 'requesting', error: null }),

    setCapturing: () => {
        // Do NOT stop the countdown — it keeps ticking for the form phase
        set({ status: 'capturing' });
    },

    setCapturedImage: (blob, previewUrl) =>
        set({
            capturedBlob: blob,
            capturedPreview: previewUrl,
            status: 'capturing',
        }),

    setUploading: () => set({ status: 'uploading' }),

    setSuccess: () => {
        const interval = get().countdownInterval;
        if (interval) clearInterval(interval);

        set({
            status: 'success',
            countdownInterval: null,
        });
    },

    setError: (error) => {
        const interval = get().countdownInterval;
        if (interval) clearInterval(interval);

        set({
            status: 'error',
            error,
            countdownInterval: null,
        });
    },

    retakePhoto: () => {
        const prev = get().capturedPreview;
        if (prev) URL.revokeObjectURL(prev);

        // Reset to idle — the session has been used, need a new one
        const interval = get().countdownInterval;
        if (interval) clearInterval(interval);

        set({
            capturedBlob: null,
            capturedPreview: null,
            countdownInterval: null,
            status: 'idle',
        });
    },

    reset: () => {
        const state = get();
        if (state.countdownInterval) clearInterval(state.countdownInterval);
        if (state.capturedPreview) URL.revokeObjectURL(state.capturedPreview);

        set({ ...initialState });
    },
}));

// Selectors
export const selectIsSessionActive = () => {
    const { status, countdown } = useRealtimeSessionStore.getState();
    return status === 'active' && countdown > 0;
};

export const selectCanCapture = () => {
    const { status, countdown } = useRealtimeSessionStore.getState();
    return status === 'active' && countdown > 0;
};
