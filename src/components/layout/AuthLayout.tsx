import { ReactNode } from 'react'
import { ThemeToggle } from '../ui/ThemeToggle'

interface AuthLayoutProps {
  children: ReactNode
  title?: string
}

export function AuthLayout({ children, title = 'OnlyFans Sales' }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-dark-bg text-white flex flex-col">
      {/* Logo area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12">
        {/* Logo */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center mb-6 shadow-lg shadow-accent-primary/30">
          <span className="text-3xl font-bold text-white">$</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
        <p className="text-[#8B8B9E] text-center mb-8">Your sales, your numbers, your empire</p>

        {/* Form Card */}
        <div className="w-full max-w-sm bg-dark-card border border-dark-border rounded-2xl p-6">
          {children}
        </div>
      </div>

      {/* Theme toggle */}
      <div className="p-6 flex justify-center">
        <ThemeToggle />
      </div>
    </div>
  )
}