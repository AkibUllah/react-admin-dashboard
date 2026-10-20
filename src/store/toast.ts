import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
  /** Milliseconds before auto-dismiss. 0 keeps it until dismissed. */
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  push: (toast: ToastInput) => number;
  dismiss: (id: number) => void;
  clear: () => void;
}

let nextId = 1;
const timers = new Map<number, ReturnType<typeof setTimeout>>();

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  push: ({ title, description, variant = 'info', duration = 4000 }) => {
    const id = nextId++;
    const toast: Toast = description === undefined ? { id, title, variant } : { id, title, description, variant };
    set((s) => ({ toasts: [...s.toasts, toast].slice(-5) }));
    if (duration > 0) {
      timers.set(id, setTimeout(() => get().dismiss(id), duration));
    }
    return id;
  },
  dismiss: (id) => {
    const timer = timers.get(id);
    if (timer) clearTimeout(timer);
    timers.delete(id);
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
  clear: () => {
    timers.forEach((t) => clearTimeout(t));
    timers.clear();
    set({ toasts: [] });
  },
}));

/** Imperative helpers so non-React code (mutations, API client) can notify. */
export const toast = {
  success: (title: string, description?: string) => useToastStore.getState().push({ title, variant: 'success', ...(description ? { description } : {}) }),
  error: (title: string, description?: string) => useToastStore.getState().push({ title, variant: 'error', duration: 6000, ...(description ? { description } : {}) }),
  info: (title: string, description?: string) => useToastStore.getState().push({ title, variant: 'info', ...(description ? { description } : {}) }),
};
