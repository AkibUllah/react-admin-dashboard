import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { env } from './lib/env';
import './index.css';

async function enableMocks(): Promise<void> {
  if (!env.enableMocks) return;
  const { worker } = await import('./mocks/browser');
  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet: true,
    // The worker file is copied from public/ next to index.html, so it follows the build base path.
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
  });
}

enableMocks().then(() => {
  const root = document.getElementById('root');
  if (!root) throw new Error('Root element #root not found');
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
