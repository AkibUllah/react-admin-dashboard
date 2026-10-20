import { describe, expect, it, vi } from 'vitest';
import { useAuthStore } from './auth';
import { resolveTheme, useUiStore } from './ui';
import { toast, useToastStore } from './toast';
import { signFakeJwt } from '@/mocks/token';
import type { User } from '@/api/types';

const user: User = { id: 'u_1', name: 'Akib Jafor', email: 'admin@shopbd.test', role: 'admin', phone: '+8801712000001' };

describe('auth store', () => {
  it('stores a session and reports authentication based on token expiry', () => {
    expect(useAuthStore.getState().isAuthenticated()).toBe(false);
    useAuthStore.getState().setSession(signFakeJwt(user), user);
    expect(useAuthStore.getState().isAuthenticated()).toBe(true);
    expect(useAuthStore.getState().user?.email).toBe('admin@shopbd.test');
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().isAuthenticated()).toBe(false);
  });

  it('treats an expired token as signed out', () => {
    const expired = signFakeJwt(user, 60, Date.now() - 120_000);
    useAuthStore.getState().setSession(expired, user);
    expect(useAuthStore.getState().isAuthenticated()).toBe(false);
  });

  it('persists the session to localStorage', () => {
    useAuthStore.getState().setSession(signFakeJwt(user), user);
    const raw = localStorage.getItem('shopbd-auth');
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw as string).state.user.name).toBe('Akib Jafor');
  });
});

describe('ui store', () => {
  it('resolves the system theme from the OS preference', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });

  it('toggles and closes the sidebar', () => {
    useUiStore.getState().toggleSidebar();
    expect(useUiStore.getState().sidebarOpen).toBe(true);
    useUiStore.getState().closeSidebar();
    expect(useUiStore.getState().sidebarOpen).toBe(false);
    useUiStore.getState().setTheme('dark');
    expect(useUiStore.getState().theme).toBe('dark');
  });
});

describe('toast store', () => {
  it('pushes, caps at five and dismisses', () => {
    for (let i = 0; i < 7; i += 1) toast.info(`Toast ${i}`);
    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(5);
    expect(toasts[0]?.title).toBe('Toast 2');
    const id = toasts[0]?.id as number;
    useToastStore.getState().dismiss(id);
    expect(useToastStore.getState().toasts.some((t) => t.id === id)).toBe(false);
  });

  it('auto-dismisses after the duration', () => {
    vi.useFakeTimers();
    useToastStore.getState().push({ title: 'Saved', variant: 'success', duration: 1000 });
    expect(useToastStore.getState().toasts).toHaveLength(1);
    vi.advanceTimersByTime(1001);
    expect(useToastStore.getState().toasts).toHaveLength(0);
    vi.useRealTimers();
  });
});
