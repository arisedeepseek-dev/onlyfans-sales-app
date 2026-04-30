import { ReactNode } from 'react'
import clsx from 'clsx'

interface StatCardProps {
  label: string
  value: string
  icon?: ReactNode
  trend?: { value: string; positive: boolean }
  className?: string
  accent?: boolean
}

export function StatCard({ label, value, icon, trend, className, accent = false }: StatCardProps) {
  return (
    <div
      className={clsx(
        'bg-dark-card border border-dark-border rounded-2xl p-4 transition-all duration-200',
        'light:bg-light-card light:border-light-border',
        accent && 'border-accent-primary/30 bg-accent-primary/5',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#8B8B9E] mb-1">{label}</p>
          <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
          {trend && (
            <p className={clsx(
              'text-xs mt-1',
              trend.positive ? 'text-success' : 'text-danger'
            )}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        {icon && (
          <div className={clsx(
            'p-2 rounded-xl',
            accent ? 'bg-accent-primary/20 text-accent-primary' : 'bg-dark-elevated text-[#8B8B9E]'
          )}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}