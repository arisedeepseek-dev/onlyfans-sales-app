import { ButtonHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: ReactNode
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl sm:rounded-2xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100'

  const variants = {
    primary: 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white shadow-lg shadow-accent-primary/20',
    secondary: 'border-2 border-accent-primary text-accent-primary bg-transparent',
    danger: 'bg-danger text-white shadow-lg shadow-danger/20',
    ghost: 'text-accent-primary hover:bg-accent-primary/10'
  }

  const sizes = {
    sm: 'h-9 sm:h-10 px-3 text-sm gap-1.5 min-h-[36px] sm:min-h-[40px]',
    md: 'h-12 sm:h-13 px-4 sm:px-5 text-base sm:text-lg gap-2 min-h-[48px]',
    lg: 'h-14 sm:h-15 px-6 sm:px-8 text-lg sm:text-xl gap-2.5 min-h-[56px]'
  }

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : icon ? (
        <span className="flex items-center gap-2">
          {icon}
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  )
}