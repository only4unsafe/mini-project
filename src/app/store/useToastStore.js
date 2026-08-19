import { create } from 'zustand';
import { createId } from '../../lib/id.js';

export const useToastStore = create((set, get) => ({
  toasts: [],
  push(message, variant = 'default') {
    const id = createId('toast');
    set({ toasts: [...get().toasts, { id, message, variant }] });
    setTimeout(() => get().dismiss(id), 3200);
  },
  dismiss(id) {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },
}));

export function toast(message, variant) {
  useToastStore.getState().push(message, variant);
}
