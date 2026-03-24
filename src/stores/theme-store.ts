import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';
export type Language = 'ENG' | 'VI';

interface ThemeState {
    theme: Theme;
    language: Language;
}

interface ThemeActions {
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    setLanguage: (lang: Language) => void;
}

type ThemeStore = ThemeState & ThemeActions;

export const useThemeStore = create<ThemeStore>()(
    persist(
        (set) => ({
            theme: 'dark', // Default is dark
            language: 'ENG', // Default is ENG based on user requirements

            setTheme: (theme) => set({ theme }),
            toggleTheme: () =>
                set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
            setLanguage: (language) => set({ language }),
        }),
        {
            name: 'brix-preferences',
        },
    ),
);
