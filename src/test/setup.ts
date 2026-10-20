import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './server';
import { useAuthStore } from '@/store/auth';
import { useToastStore } from '@/store/toast';
import { useUiStore } from '@/store/ui';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  cleanup();
  server.resetHandlers();
  localStorage.clear();
  useAuthStore.setState({ token: null, user: null });
  useToastStore.getState().clear();
  useUiStore.setState({ theme: 'system', sidebarOpen: false });
});

afterAll(() => server.close());
