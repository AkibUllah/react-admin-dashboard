import { setupServer } from 'msw/node';
import { createHandlers } from '@/mocks/handlers';
import { createDatabase } from '@/mocks/db';

/** Fresh deterministic database per test file, no artificial latency. */
export const testDb = createDatabase(42, new Date('2026-03-15T06:00:00Z'));
export const server = setupServer(...createHandlers({ latency: [0, 0], db: testDb }));
