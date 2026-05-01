import { Sale } from '../../types'
import { formatCurrency } from '../../lib/calculations'
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
        const salary = Number(sale.gross_sales) - Number(sale.comms_base) + (Number(sale.hourly_rate) * Number(sale.hours_worked))

        return (
          <div
            key={sale.id}
            className={clsx(
              'bg-dark-card border border-dark-border rounded-2xl p-4 transition-all duration-200',
              'light:bg-light-card light:border-light-border'
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-2xl font-bold text-white tabular-nums">
                  {formatCurrency(Number(sale.gross_sales))}
                </p>
                <p className="text-sm text-[#8B8B9E]">
                  {new Date(sale.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => onEdit(sale)}
                  className="p-2 rounded-xl text-[#8B8B9E] hover:text-accent-primary hover:bg-accent-primary/10 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(sale)}
                  className="p-2 rounded-xl text-[#8B8B9E] hover:text-danger hover:bg-danger/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-dark-elevated rounded-xl p-3">
                <p className="text-xs text-[#8B8B9E] mb-1">Net</p>
                <p className="text-sm font-semibold text-white tabular-nums">
                  {formatCurrency(Number(sale.gross_sales))}
                </p>
              </div>
              <div className="bg-dark-elevated rounded-xl p-3">
                <p className="text-xs text-[#8B8B9E] mb-1">Comms</p>
                <p className="text-sm font-semibold text-danger tabular-nums">
                  -{formatCurrency(Number(sale.comms_base))}
                </p>
              </div>
              <div className="bg-dark-elevated rounded-xl p-3">
                <p className="text-xs text-[#8B8B9E] mb-1">Hourly</p>
                <p className="text-sm font-semibold text-success tabular-nums">
                  +{formatCurrency(Number(sale.hourly_rate) * Number(sale.hours_worked))}
                </p>
              </div>
            </div>

            {/* Salary */}
            <div className="mt-3 pt-3 border-t border-dark-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#8B8B9E]">Estimated Salary</span>
                <span className="text-lg font-bold text-success tabular-nums">
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