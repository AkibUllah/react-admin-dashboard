import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
  /** Reset key: when it changes (e.g. route path), the boundary clears its error. */
  resetKey?: string;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // Hook for an error reporter (Sentry etc.). Console is enough for a demo build.
    console.error('Unhandled render error', error, info.componentStack);
  }

  override componentDidUpdate(prevProps: Props): void {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.reset();
    }
  }

  reset = (): void => this.setState({ error: null });

  override render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(error, this.reset);
    return (
      <div role="alert" className="mx-auto my-16 max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/40">
        <AlertTriangle className="mx-auto h-8 w-8 text-red-600 dark:text-red-400" aria-hidden="true" />
        <h2 className="mt-3 text-lg font-semibold text-slate-900 dark:text-slate-50">Something went wrong</h2>
        <p className="mt-1 break-words text-sm text-slate-600 dark:text-slate-300">{error.message}</p>
        <Button className="mt-4" onClick={this.reset}>
          Try again
        </Button>
      </div>
    );
  }
}
