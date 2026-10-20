/**
 * Formatting helpers for a Bangladeshi retail back office. Amounts are stored
 * in paisa (integer minor units) and only converted for display.
 */

const INDIAN_GROUPING = /\B(?=(\d{2})+(?!\d))/g;

export function groupIndian(integer: string): string {
  if (integer.length <= 3) return integer;
  const head = integer.slice(0, -3).replace(INDIAN_GROUPING, ',');
  return `${head},${integer.slice(-3)}`;
}

/** Format paisa as Taka with lakh/crore grouping: 12345678 -> "৳1,23,456.78". */
export function formatBDT(paisa: number, options: { decimals?: boolean } = {}): string {
  const decimals = options.decimals ?? true;
  const negative = paisa < 0;
  const abs = Math.abs(Math.round(paisa));
  const taka = Math.floor(abs / 100).toString();
  const fraction = (abs % 100).toString().padStart(2, '0');
  const body = decimals ? `${groupIndian(taka)}.${fraction}` : groupIndian(taka);
  return `${negative ? '-' : ''}৳${body}`;
}

/** Short form for KPI cards: 12_500_000_00 paisa -> "৳1.25 Cr". */
export function formatCompactBDT(paisa: number): string {
  const taka = paisa / 100;
  const abs = Math.abs(taka);
  const sign = taka < 0 ? '-' : '';
  if (abs >= 1e7) return `${sign}৳${trim(abs / 1e7)} Cr`;
  if (abs >= 1e5) return `${sign}৳${trim(abs / 1e5)} L`;
  if (abs >= 1e3) return `${sign}৳${trim(abs / 1e3)}k`;
  return `${sign}৳${trim(abs)}`;
}

function trim(n: number): string {
  return n.toFixed(2).replace(/\.?0+$/, '');
}

export function formatNumber(n: number): string {
  return groupIndian(Math.round(Math.abs(n)).toString()).replace(/^/, n < 0 ? '-' : '');
}

export function formatPercent(fraction: number, digits = 1): string {
  const value = fraction * 100;
  return `${value > 0 ? '+' : ''}${value.toFixed(digits)}%`;
}

const DATE_FMT = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Dhaka' });
const DATETIME_FMT = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Dhaka',
});

export function formatDate(iso: string): string {
  return DATE_FMT.format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return DATETIME_FMT.format(new Date(iso)).replace(',', '');
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
