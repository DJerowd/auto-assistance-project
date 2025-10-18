import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface UiState {
  theme: Theme;
  isMenuOpen: boolean;
  toggleTheme: () => void;
  toggleMenu: () => void;
  closeMenu: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: 'light',
      isMenuOpen: false,
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'light' ? 'dark' : 'light',
      })),
      toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
      closeMenu: () => set({ isMenuOpen: false }),
    }),
    {
      name: 'ui-storage', 
      partialize: (state) => ({ theme: state.theme }), 
    }
  )
);