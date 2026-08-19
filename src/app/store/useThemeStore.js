import { create } from 'zustand';
import { loadTheme, saveTheme } from '../../lib/storage.js';

function applyThemeClass(theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

const initialTheme = loadTheme();
applyThemeClass(initialTheme);

export const useThemeStore = create((set, get) => ({
  theme: initialTheme,
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    applyThemeClass(next);
    saveTheme(next);
    set({ theme: next });
  },
  setTheme: (theme) => {
    applyThemeClass(theme);
    saveTheme(theme);
    set({ theme });
  },
}));
