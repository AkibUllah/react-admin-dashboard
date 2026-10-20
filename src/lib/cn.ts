import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';

/** Tiny wrapper so call sites read `cn(...)` and the dependency is swappable. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
