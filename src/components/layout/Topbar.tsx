import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useUiStore } from '@/store/ui';
import { initials } from '@/lib/format';
import { Button } from '../ui/Button';
import { toast } from '@/store/toast';

export function Topbar() {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  const handleLogout = () => {
    logout();
    toast.info('Signed out');
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 sm:px-6">
      <Button variant="ghost" size="sm" className="px-2 lg:hidden" onClick={toggleSidebar} aria-label="Open navigation">
        <Menu className="h-5 w-5" aria-hidden="true" />
      </Button>
      <div className="flex-1" />
      <Button variant="ghost" size="sm" className="px-2" onClick={() => setTheme(isDark ? 'light' : 'dark')} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} title={`Theme: ${theme}`}>
        {isDark ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
      </Button>
      {user && (
        <div className="flex items-center gap-3 border-l border-slate-200 pl-3 dark:border-slate-800">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-800 dark:bg-brand-900/60 dark:text-brand-100" aria-hidden="true">
            {initials(user.name)}
          </span>
          <div className="hidden text-sm sm:block">
            <p className="font-medium leading-tight text-slate-900 dark:text-slate-50">{user.name}</p>
            <p className="text-xs capitalize text-slate-500 dark:text-slate-400">{user.role}</p>
          </div>
          <Button variant="ghost" size="sm" className="px-2" onClick={handleLogout} aria-label="Sign out">
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      )}
    </header>
  );
}
