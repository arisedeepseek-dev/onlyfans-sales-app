import { ReactNode } from 'react'
import { BottomNav } from './BottomNav'
import { ThemeToggle } from '../ui/ThemeToggle'

interface AppLayoutProps {
  children: ReactNode
  title?: string
  showNav?: boolean
  rightAction?: ReactNode
}

export function AppLayout({ children, title, showNav = true, rightAction }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-dark-bg text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-dark-bg/80 backdrop-blur-lg border-b border-dark-border">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-lg font-semibold">{title || 'Dashboard'}</h1>
          <div className="flex items-center gap-2">
            {rightAction}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-4 pb-safe">
        {children}
      </main>

      {/* Bottom Navigation */}
      {showNav && <BottomNav />}
    </div>
  )
}