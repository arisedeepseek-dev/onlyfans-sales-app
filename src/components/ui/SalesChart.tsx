import { useState } from 'react'
import {
  BarChart,
  Bar,
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

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-dark-elevated border border-dark-border rounded-xl p-3 shadow-xl">
      <p className="text-xs sm:text-sm text-[#8B8B9E] mb-2 font-medium">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-xs sm:text-sm">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-[#8B8B9E]">{entry.name}:</span>
          <span className="font-semibold text-white tabular-nums">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

export function SalesChart({ data, period, onPeriodChange }: SalesChartProps) {
  const [activeTab, setActiveTab] = useState<'gross' | 'net' | 'comms' | 'salary'>('gross')

  const tabConfig = {
    gross: { color: '#6C5CE7', label: 'Gross' },
    net: { color: '#00D68F', label: 'Net (80%)' },
    comms: { color: '#FF4D6A', label: 'Comms' },
    salary: { color: '#A29BFE', label: 'Salary' },
  }

  const periodLabel = {
    '24h': 'Last 24 hours',
    '7d': 'Last 7 days',
    '30d': 'Last 30 days',
    '90d': 'Last 90 days',
    '1y': 'Last 12 months',
  }[period]

  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white">Revenue Overview</h3>
          <p className="text-xs sm:text-sm text-[#8B8B9E] mt-1">{periodLabel}</p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1 bg-dark-elevated p-1 rounded-xl sm:rounded-2xl">
          {periods.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onPeriodChange(key)}
              className={clsx(
                'px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200',
                period === key
                  ? 'bg-accent-primary text-white shadow-md'
                  : 'text-[#8B8B9E] hover:text-white hover:bg-dark-border'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Data Type Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-6">
        {(Object.keys(tabConfig) as Array<keyof typeof tabConfig>).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200',
              activeTab === tab
                ? 'text-white'
                : 'text-[#8B8B9E] hover:text-white hover:bg-dark-elevated border border-transparent'
            )}
            style={activeTab === tab ? { backgroundColor: tabConfig[tab].color + '30', borderColor: tabConfig[tab].color + '50' } : {}}
          >
            {tabConfig[tab].label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-[200px] sm:h-[280px] md:h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" vertical={false} />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8B8B9E', fontSize: 10 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8B8B9E', fontSize: 10 }}
              tickFormatter={(value) => value >= 1000 ? `$${(value / 1000).toFixed(0)}k` : `$${value}`}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(108, 92, 231, 0.1)' }} />
            <Bar
              dataKey={activeTab}
              fill={tabConfig[activeTab].color}
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Summary */}
      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-dark-border grid grid-cols-4 gap-3 sm:gap-4">
        <div className="text-center">
          <p className="text-xs sm:text-sm text-[#8B8B9E] mb-1">Gross</p>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-white tabular-nums">
            {formatCurrency(data.reduce((sum, d) => sum + d.gross, 0))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs sm:text-sm text-[#8B8B9E] mb-1">Net (80%)</p>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-success tabular-nums">
            {formatCurrency(data.reduce((sum, d) => sum + d.net, 0))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs sm:text-sm text-[#8B8B9E] mb-1">Comms</p>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-danger tabular-nums">
            {formatCurrency(data.reduce((sum, d) => sum + d.comms, 0))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs sm:text-sm text-[#8B8B9E] mb-1">Salary</p>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-accent-primary tabular-nums">
            {formatCurrency(data.reduce((sum, d) => sum + d.salary, 0))}
          </p>
        </div>
      </div>
    </div>
  )
}