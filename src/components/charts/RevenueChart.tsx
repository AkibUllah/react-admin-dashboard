import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { RevenuePoint } from '@/api/types';
import { formatBDT, formatCompactBDT } from '@/lib/format';

const SHORT_DATE = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  return (
    <div className="h-72 w-full" role="img" aria-label="Daily revenue for the last 30 days">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2f855a" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#2f855a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) => SHORT_DATE.format(new Date(value))}
            tick={{ fontSize: 12 }}
            stroke="currentColor"
            className="text-slate-400"
            minTickGap={24}
            tickLine={false}
            axisLine={false}
          />
          <YAxis tickFormatter={(value: number) => formatCompactBDT(value)} tick={{ fontSize: 12 }} stroke="currentColor" className="text-slate-400" width={64} tickLine={false} axisLine={false} />
          <Tooltip
            formatter={(value: number, name: string) => [name === 'revenue' ? formatBDT(value) : value, name === 'revenue' ? 'Revenue' : 'Orders']}
            labelFormatter={(label: string) => SHORT_DATE.format(new Date(label))}
          />
          <Area type="monotone" dataKey="revenue" stroke="#2f855a" strokeWidth={2} fill="url(#revenueFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
