'use client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { SellerTimeseriesPoint } from 'shared-types';

const BRAND = 'hsl(16 88% 53%)'; // orange
const NAVY = 'hsl(225 47% 24%)';
const GRID = 'hsl(220 13% 91%)';

const fmtNpr = (v: number) => `Rs. ${Math.round(v).toLocaleString('en-IN')}`;
const fmtCompact = (v: number) =>
  v >= 1000 ? `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : String(v);

// Daily buckets → "5 Jun"; monthly buckets → "Jun 26".
const axisLabel = (date: string, monthly: boolean) => {
  const d = new Date(`${date}T00:00:00Z`);
  return monthly
    ? d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit', timeZone: 'UTC' })
    : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
};

interface ChartProps {
  data: SellerTimeseriesPoint[];
  monthly: boolean;
}

export function SalesChart({ data, monthly }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={BRAND} stopOpacity={0.35} />
            <stop offset="95%" stopColor={BRAND} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="earnFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={NAVY} stopOpacity={0.25} />
            <stop offset="95%" stopColor={NAVY} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(d) => axisLabel(d, monthly)}
          tick={{ fontSize: 11 }}
          minTickGap={24}
          tickLine={false}
          axisLine={{ stroke: GRID }}
        />
        <YAxis tickFormatter={fmtCompact} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={44} />
        <Tooltip
          formatter={(v: number, name) => [fmtNpr(v), name === 'sales' ? 'Sales' : 'Earnings']}
          labelFormatter={(d) => axisLabel(String(d), monthly)}
          contentStyle={{ borderRadius: 12, border: `1px solid ${GRID}`, fontSize: 13 }}
        />
        <Legend
          formatter={(v) => (v === 'sales' ? 'Sales' : 'Earnings')}
          iconType="circle"
          wrapperStyle={{ fontSize: 12 }}
        />
        <Area type="monotone" dataKey="sales" stroke={BRAND} strokeWidth={2} fill="url(#salesFill)" />
        <Area type="monotone" dataKey="earnings" stroke={NAVY} strokeWidth={2} fill="url(#earnFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function OrdersChart({ data, monthly }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(d) => axisLabel(d, monthly)}
          tick={{ fontSize: 11 }}
          minTickGap={24}
          tickLine={false}
          axisLine={{ stroke: GRID }}
        />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={28} />
        <Tooltip
          formatter={(v: number) => [v, 'Orders']}
          labelFormatter={(d) => axisLabel(String(d), monthly)}
          contentStyle={{ borderRadius: 12, border: `1px solid ${GRID}`, fontSize: 13 }}
          cursor={{ fill: 'hsl(16 88% 53% / 0.08)' }}
        />
        <Bar dataKey="orders" fill={BRAND} radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
