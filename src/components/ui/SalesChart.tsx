import { useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import clsx from 'clsx'
import { formatCurrency } from '../../lib/calculations'

type Period = '24h' | '7d' | '30d' | '90d' | '1y'

interface ChartDataPoint {
  label: string
  gross: number
  net: number
  comms: number
  salary: number
}

interface SalesChartProps {
  data: ChartDataPoint[]
  period: Period
  onPeriodChange: (period: Period) => void
}

const periods: { key: Period; label: string }[] = [
  { key: '24h', label: '24H' },
  { key: '7d', label: '7D' },
  { key: '30d', label: '30D' },
  { key: '90d', label: '90D' },
  { key: '1y', label: '1Y' },
]

const tabConfig = {
  gross: { color: '#8B5CF6', label: 'Gross', gradientId: 'grossGrad' },
  net: { color: '#10B981', label: 'Net', gradientId: 'netGrad' },
  comms: { color: '#F43F5E', label: 'Comms', gradientId: 'commsGrad' },
  salary: { color: '#06B6D4', label: 'Salary', gradientId: 'salaryGrad' },
} as const

const periodLabels: Record<Period, string> = {
  '24h': 'Last 24 Hours',
  '7d': 'Last 7 Days',
  '30d': 'Last 30 Days',
  '90d': 'Last 90 Days',
  '1y': 'Last 12 Months',
}

interface TooltipPayload {
  name: string
  value: number
  color: string
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) {
  if (!active || !payload?.length) return null

  const total = payload.reduce((sum, p) => sum + p.value, 0)

  return (
    <div className="bg-[#0F0F1A]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl shadow-black/50 min-w-[160px]">
      <p className="text-white/60 text-xs font-medium mb-3 uppercase tracking-wide">{label}</p>
      <div className="space-y-2">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-white/60 text-xs">{entry.name}</span>
            </div>
            <span className="text-white text-xs font-semibold tabular-nums">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
        <span className="text-white/40 text-xs">Total</span>
        <span className="text-white text-sm font-bold tabular-nums">{formatCurrency(total)}</span>
      </div>
    </div>
  )
}

export function SalesChart({ data, period, onPeriodChange }: SalesChartProps) {
  const [activeTab, setActiveTab] = useState<keyof typeof tabConfig>('salary')

  const { color, gradientId } = tabConfig[activeTab]
  const total = data.reduce((sum, d) => sum + d[activeTab], 0)
  const maxVal = Math.max(...data.map(d => d[activeTab]), 1)
  const avgVal = total / Math.max(data.length, 1)

  // Mini sparkline data (last 7 points for trend)
  const sparkData = data.slice(-7)

  return (
    <div className="relative group">
      {/* Card */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#0F0F1A] rounded-2xl sm:rounded-3xl border border-white/5" />

      {/* Glow effect behind active data */}
      <div
        className="absolute -inset-px rounded-2xl sm:rounded-3xl opacity-20 blur-xl transition-colors duration-500"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}40, transparent 70%)` }}
      />

      <div className="relative bg-[#0F0F1A]/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/5 p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-semibold text-white">Revenue Overview</h3>
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: color }}
              />
            </div>
            <p className="text-xs text-white/40">{periodLabels[period]}</p>
          </div>

          {/* Period Selector - pill toggle */}
          <div className="flex items-center bg-white/5 rounded-xl p-1 gap-0.5 self-start">
            {periods.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => onPeriodChange(key)}
                className={clsx(
                  'px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all duration-200 whitespace-nowrap',
                  period === key
                    ? 'bg-white/10 text-white shadow-inner'
                    : 'text-white/40 hover:text-white/70'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
          {[
            { label: 'Total', value: total, color: 'text-white' },
            { label: 'Average', value: avgVal, color: 'text-white/60' },
            { label: 'Peak', value: maxVal, color: color },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="bg-white/5 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 text-center"
            >
              <p className="text-[10px] sm:text-xs text-white/40 uppercase tracking-wider mb-1">{label}</p>
              <p className={clsx('text-sm sm:text-lg md:text-xl font-bold tabular-nums truncate', color)}>
                {formatCurrency(value)}
              </p>
            </div>
          ))}
        </div>

        {/* Data Type Tabs */}
        <div className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {(Object.entries(tabConfig) as [keyof typeof tabConfig, typeof tabConfig[keyof typeof tabConfig]][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap shrink-0',
                activeTab === key
                  ? 'text-white'
                  : 'text-white/40 hover:text-white/70'
              )}
              style={activeTab === key ? { backgroundColor: cfg.color + '20' } : {}}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: activeTab === key ? cfg.color : 'currentColor' }}
              />
              {cfg.label}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="h-[180px] sm:h-[220px] md:h-[260px] w-full -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="rgba(255,255,255,0.03)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`}
                dx={-4}
                width={48}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: color,
                  strokeWidth: 1,
                  strokeDasharray: '4 4',
                  fill: color + '10',
                }}
              />
              <Area
                type="monotone"
                dataKey={activeTab}
                stroke={color}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{
                  r: 5,
                  fill: color,
                  stroke: '#0F0F1A',
                  strokeWidth: 2,
                }}
                animationDuration={1000}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Trend Bar - mini sparkline */}
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-white/30 uppercase tracking-wider">Trend</span>
            <span className="text-xs font-medium" style={{ color }}>
              {data.length >= 2
                ? (data[data.length - 1][activeTab] >= data[0][activeTab] ? '↑' : '↓') +
                  ' ' +
                  Math.abs(
                    ((data[data.length - 1][activeTab] - data[0][activeTab]) / Math.max(data[0][activeTab], 1)) * 100
                  ).toFixed(1) +
                  '%'
                : '—'}
            </span>
          </div>
          <div className="h-8 flex items-end gap-0.5">
            {sparkData.map((d, i) => {
              const h = Math.max((d[activeTab] / maxVal) * 100, 4)
              const isLast = i === sparkData.length - 1
              return (
                <div
                  key={i}
                  className="flex-1 rounded-sm transition-all duration-300"
                  style={{
                    height: `${h}%`,
                    backgroundColor: isLast ? color : color + '40',
                    opacity: isLast ? 1 : 0.4,
                  }}
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}