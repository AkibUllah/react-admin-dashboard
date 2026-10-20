import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="mx-auto my-16 max-w-md text-center">
      <p className="text-6xl font-semibold text-brand-600">404</p>
      <h1 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-50">Page not found</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">The page you are looking for does not exist or was moved.</p>
      <Link to="/" className="mt-6 inline-block">
        <Button>Back to dashboard</Button>
      </Link>
    </div>
  );
}
