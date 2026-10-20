export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
  enableMocks: (import.meta.env.VITE_ENABLE_MOCKS ?? 'true') !== 'false',
  appName: import.meta.env.VITE_APP_NAME ?? 'ShopBD Admin',
} as const;
