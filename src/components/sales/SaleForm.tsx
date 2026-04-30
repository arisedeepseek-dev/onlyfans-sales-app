import { useForm } from 'react-hook-form'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Sale } from '../../types'

interface SaleFormData {
  gross_sales: number
  hourly_rate: number
  comms_base: number
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
      hourly_rate: initialData?.hourly_rate || 0,
      comms_base: initialData?.comms_base || 0,
      hours_worked: initialData?.hours_worked || 0,
    }
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Gross Sales ($)"
        type="number"
        step="0.01"
        placeholder="0.00"
        icon={<span>$</span>}
        error={errors.gross_sales?.message}
        {...register('gross_sales', {
          required: 'Gross sales is required',
          min: { value: 0, message: 'Must be a positive number' },
          valueAsNumber: true
        })}
      />

      <Input
        label="Hourly Rate ($)"
        type="number"
        step="0.01"
        placeholder="0.00"
        icon={<span>$</span>}
        {...register('hourly_rate', { valueAsNumber: true })}
      />

      <Input
        label="Commission Base ($)"
        type="number"
        step="0.01"
        placeholder="0.00"
        icon={<span>$</span>}
        {...register('comms_base', { valueAsNumber: true })}
      />

      <Input
        label="Hours Worked"
        type="number"
        step="0.5"
        placeholder="0"
        {...register('hours_worked', { valueAsNumber: true })}
      />

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="flex-1"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
          loading={loading}
        >
          {initialData ? 'Update' : 'Add Sale'}
        </Button>
      </div>
    </form>
  )
}