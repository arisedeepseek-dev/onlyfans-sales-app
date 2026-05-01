import { Sale } from '../../types'
import { formatCurrency, computeSaleValues } from '../../lib/calculations'
import { Trash2, Edit2, Clock } from 'lucide-react'
import clsx from 'clsx'

interface SaleListProps {
  sales: Sale[]
  onEdit: (sale: Sale) => void
  onDelete: (sale: Sale) => void
}

export function SaleList({ sales, onEdit, onDelete }: SaleListProps) {
  if (sales.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-dark-elevated flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-[#8B8B9E]" />
        </div>
        <p className="text-[#8B8B9E]">No sales recorded yet</p>
        <p className="text-sm text-[#6B6B80]">Add your first sale to start tracking</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sales.map((sale) => {
        const { net, comms, salary } = computeSaleValues(sale)

        return (
          <div
            key={sale.id}
            className={clsx(
              'bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 transition-all duration-200',
              'light:bg-light-card light:border-light-border'
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white tabular-nums">
                  {formatCurrency(Number(sale.gross_sales))}
                </p>
                <p className="text-xs sm:text-sm text-[#8B8B9E]">
                  {new Date(sale.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="flex gap-1 sm:gap-2">
                <button
                  onClick={() => onEdit(sale)}
                  className="w-11 h-11 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-[#8B8B9E] hover:text-accent-primary hover:bg-accent-primary/10 transition-colors min-w-[44px] min-h-[44px]"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(sale)}
                  className="w-11 h-11 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-[#8B8B9E] hover:text-danger hover:bg-danger/10 transition-colors min-w-[44px] min-h-[44px]"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="bg-dark-elevated rounded-xl p-2 sm:p-3">
                <p className="text-xs text-[#8B8B9E] mb-1">Net (80%)</p>
                <p className="text-sm sm:text-base font-semibold text-white tabular-nums">
                  {formatCurrency(net)}
                </p>
              </div>
              <div className="bg-dark-elevated rounded-xl p-2 sm:p-3">
                <p className="text-xs text-[#8B8B9E] mb-1">Comms ({sale.comms_percent}%)</p>
                <p className="text-sm sm:text-base font-semibold text-danger tabular-nums">
                  -{formatCurrency(comms)}
                </p>
              </div>
              <div className="bg-dark-elevated rounded-xl p-2 sm:p-3">
                <p className="text-xs text-[#8B8B9E] mb-1">Hourly</p>
                <p className="text-sm sm:text-base font-semibold text-success tabular-nums">
                  +{formatCurrency(Number(sale.hourly_rate) * Number(sale.hours_worked))}
                </p>
              </div>
            </div>

            {/* Salary Breakdown */}
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-dark-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base text-[#8B8B9E]">Comms Only</span>
                <span className="text-sm sm:text-base font-semibold text-white tabular-nums">
                  {formatCurrency(comms)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base text-[#8B8B9E]">Hourly Earnings</span>
                <span className="text-sm sm:text-base font-semibold text-success tabular-nums">
                  +{formatCurrency(Number(sale.hourly_rate) * Number(sale.hours_worked))}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-dark-border">
                <span className="text-sm sm:text-base font-medium text-white">Total Salary</span>
                <span className="text-lg sm:text-xl font-bold text-success tabular-nums">
                  {formatCurrency(salary)}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}