import { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
  title?: string
}

export function AuthLayout({ children, title = 'OnlyFans Sales' }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-dark-bg text-white flex flex-col">
      {/* Logo area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-8 sm:pt-12">
        {/* Logo */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center mb-4 sm:mb-6 shadow-lg shadow-accent-primary/30">
          <span className="text-2xl sm:text-3xl font-bold text-white">$</span>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">{title}</h1>
        <p className="text-[#8B8B9E] text-center mb-8">Your sales, your numbers, your empire</p>

        {/* Form Card */}
        <div className="w-full max-w-[420px] sm:max-w-[480px] md:max-w-[540px] bg-dark-card border border-dark-border rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8">
          {children}
        </div>
      </div>
    </div>
  )
}