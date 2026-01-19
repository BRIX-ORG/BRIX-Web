import { create } from 'zustand';

interface UIState {
    isLoading: boolean;
    loadingMessage?: string;
    isSidebarCollapsed: boolean;
}

interface UIActions {
    setLoading: (isLoading: boolean, message?: string) => void;
    showLoading: (message?: string) => void;
    hideLoading: () => void;
    toggleSidebarCollapsed: () => void;
}

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>((set) => ({
    // Initial state
    isLoading: false,
    loadingMessage: undefined,
    isSidebarCollapsed: false,

    // Actions
    setLoading: (isLoading, message) =>
        set({
            isLoading,
            loadingMessage: message,
        }),

    showLoading: (message) =>
        set({
            isLoading: true,
            loadingMessage: message || 'Đang xử lý...',
        }),

    hideLoading: () =>
        set({
            isLoading: false,
            loadingMessage: undefined,
        }),

    toggleSidebarCollapsed: () =>
        set((state) => ({
            isSidebarCollapsed: !state.isSidebarCollapsed,
        })),
}));

// Selectors for convenience
export const selectIsLoading = () => useUIStore.getState().isLoading;
export const selectLoadingMessage = () => useUIStore.getState().loadingMessage;
export const selectIsSidebarCollapsed = () => useUIStore.getState().isSidebarCollapsed;
