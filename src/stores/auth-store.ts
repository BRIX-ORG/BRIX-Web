import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
}

interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    user: User | null;
}

interface AuthActions {
    setAuth: (tokens: { accessToken: string; refreshToken: string }) => void;
    setUser: (user: User) => void;
    signOut: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            // Initial state
            accessToken: null,
            refreshToken: null,
            user: null,

            // Actions
            setAuth: (tokens) =>
                set({
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                }),

            setUser: (user) =>
                set({
                    user,
                }),

            signOut: () =>
                set({
                    accessToken: null,
                    refreshToken: null,
                    user: null,
                }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
        },
    ),
);

// Selectors for convenience
export const selectAccessToken = () => useAuthStore.getState().accessToken;
export const selectRefreshToken = () => useAuthStore.getState().refreshToken;
export const selectUser = () => useAuthStore.getState().user;
export const selectIsAuthenticated = () => !!useAuthStore.getState().accessToken;
