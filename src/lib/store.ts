import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
    apiKey: string;
    setApiKey: (key: string) => void;
    clearApiKey: () => void;

    activeView: 'landing' | 'profile' | 'optimize' | 'settings' | 'history' | 'coverletter';
    setActiveView: (view: AppState['activeView']) => void;

    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            apiKey: '',
            setApiKey: (key) => set({ apiKey: key }),
            clearApiKey: () => set({ apiKey: '' }),

            activeView: 'landing',
            setActiveView: (view) => set({ activeView: view }),

            theme: 'light',
            toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
        }),
        {
            name: 'resumebuddy-settings',
            partialize: (state) => ({ apiKey: state.apiKey, theme: state.theme }),
        }
    )
);
