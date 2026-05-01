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
    <div className="min-h-screen dark:bg-dark-bg bg-light-bg dark:text-white text-light-text transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-40 dark:bg-dark-bg/80 bg-light-card/80 backdrop-blur-lg dark:border-dark-border border-light-border border-b">
        <div className="flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6 md:px-8 lg:px-12">
          <h1 className="text-base sm:text-lg md:text-xl font-semibold truncate dark:text-white text-light-text">{title || 'Dashboard'}</h1>
          <div className="flex items-center gap-2 shrink-0">
            {rightAction}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 sm:px-6 md:px-8 lg:px-12 py-4 sm:py-6 md:py-8 pb-24 sm:pb-28 md:pb-32 max-w-7xl mx-auto dark:text-white text-light-text">
        {children}
      </main>

      {/* Bottom Navigation - always show padding on all screen sizes */}
      {showNav && <BottomNav />}
    </div>
  )
}