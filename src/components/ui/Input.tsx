import { InputHTMLAttributes, forwardRef, useState } from 'react'
import clsx from 'clsx'
import { Eye, EyeOff } from 'lucide-react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'

    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-[#8B8B9E]">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B8B9E]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={isPassword && showPassword ? 'text' : type}
            className={clsx(
              'w-full h-12 sm:h-13 px-4 sm:px-5 rounded-xl bg-dark-card border border-dark-border text-white placeholder:text-[#8B8B9E] outline-none transition-all duration-200 text-base sm:text-base',
              'focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20',
              'dark:bg-dark-card dark:border-dark-border dark:text-white dark:placeholder:text-[#8B8B9E]',
              'light:bg-light-card light:border-light-border light:text-light-text',
              icon && 'pl-10 sm:pl-11',
              isPassword && 'pr-10',
              error && 'border-danger focus:border-danger focus:ring-danger/20',
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B8B9E] hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
        </div>
        {error && (
          <p className="text-sm text-danger">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'