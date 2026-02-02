import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type RecoveryStep = 'email' | 'otp' | 'reset' | null;

interface AuthState {
    // Recovery flow state
    recoveryEmail: string | null;
    resetToken: string | null;
    recoveryStep: RecoveryStep;
}

interface AuthActions {
    setRecoveryEmail: (email: string) => void;
    setResetToken: (token: string) => void;
    setRecoveryStep: (step: RecoveryStep) => void;
    clearRecovery: () => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
    recoveryEmail: null,
    resetToken: null,
    recoveryStep: null,
};

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            ...initialState,

            setRecoveryEmail: (email) =>
                set({
                    recoveryEmail: email,
                    recoveryStep: 'otp',
                }),

            setResetToken: (token) =>
                set({
                    resetToken: token,
                    recoveryStep: 'reset',
                }),

            setRecoveryStep: (step) =>
                set({
                    recoveryStep: step,
                }),

            clearRecovery: () =>
                set({
                    ...initialState,
                }),
        }),
        {
            name: 'brix-auth-storage',
            // Only persist recovery data temporarily
            partialize: (state) => ({
                recoveryEmail: state.recoveryEmail,
                resetToken: state.resetToken,
                recoveryStep: state.recoveryStep,
            }),
        },
    ),
);

// Selectors for convenience
export const selectRecoveryEmail = () => useAuthStore.getState().recoveryEmail;
export const selectResetToken = () => useAuthStore.getState().resetToken;
export const selectRecoveryStep = () => useAuthStore.getState().recoveryStep;
