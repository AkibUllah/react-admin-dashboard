import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { renderWithProviders } from '@/test/utils';
import { useAuthStore } from '@/store/auth';

function renderLogin() {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<h1>Dashboard home</h1>} />
    </Routes>,
    { route: '/login' },
  );
}

describe('LoginPage', () => {
  it('shows validation errors before calling the API', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.clear(screen.getByLabelText('Email'));
    await user.clear(screen.getByLabelText('Password'));
    await user.type(screen.getByLabelText('Password'), '123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    expect(useAuthStore.getState().token).toBeNull();
  });

  it('rejects wrong credentials with the server message', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.clear(screen.getByLabelText('Password'));
    await user.type(screen.getByLabelText('Password'), 'wrong-password');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password');
  });

  it('signs in with the demo account and redirects', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText('Dashboard home')).toBeInTheDocument();
    await waitFor(() => expect(useAuthStore.getState().isAuthenticated()).toBe(true));
    expect(useAuthStore.getState().user?.role).toBe('admin');
  });
});
