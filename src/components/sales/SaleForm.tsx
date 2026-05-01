import { useForm } from 'react-hook-form'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Sale } from '../../types'

interface SaleFormData {
  gross_sales: number
  comms_percent: number
  hourly_rate: number
  hours_worked: number
}

interface SaleFormProps {
  onSubmit: (data: SaleFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
  initialData?: Sale
}

export function SaleForm({ onSubmit, onCancel, loading, initialData }: SaleFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<SaleFormData>({
    defaultValues: {
      gross_sales: initialData?.gross_sales || 0,
      comms_percent: initialData?.comms_percent ?? 10,
      hourly_rate: initialData?.hourly_rate || 0,
      hours_worked: initialData?.hours_worked || 0,
    }
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Gross Sales ($)"
        type="number"
        step="0.01"
        placeholder="500.00"
        icon={<span>$</span>}
        error={errors.gross_sales?.message}
        className="sm:text-base"
        {...register('gross_sales', {
          required: 'Gross sales is required',
          min: { value: 0, message: 'Must be a positive number' },
          valueAsNumber: true
        })}
      />

      <Input
        label="Commission %"
        type="number"
        step="0.1"
        placeholder="10"
        icon={<span>%</span>}
        className="sm:text-base"
        {...register('comms_percent', {
          valueAsNumber: true,
          min: { value: 0, message: 'Min 0%' },
          max: { value: 100, message: 'Max 100%' }
        })}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Hourly Rate ($)"
          type="number"
          step="0.01"
          placeholder="2.00"
          icon={<span>$</span>}
          className="sm:text-base"
          {...register('hourly_rate', { valueAsNumber: true })}
        />

        <Input
          label="Hours Worked"
          type="number"
          step="0.5"
          placeholder="8"
          className="sm:text-base"
          {...register('hours_worked', { valueAsNumber: true })}
        />
      </div>

      <div className="flex gap-3 sm:gap-4 pt-2 sm:pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="flex-1 min-h-[48px]"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="flex-1 min-h-[48px]"
          loading={loading}
        >
          {initialData ? 'Update' : 'Add Sale'}
        </Button>
      </div>
    </form>
  )
}