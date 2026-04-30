import { ReactNode } from 'react'
import clsx from 'clsx'

interface CardProps {
  children: ReactNode
  className?: string
  glow?: boolean
  onClick?: () => void
}

export function Card({ children, className, glow = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-dark-card border border-dark-border rounded-2xl p-4 transition-all duration-200',
        'dark:bg-dark-card dark:border-dark-border',
        'light:bg-light-card light:border-light-border',
        glow && 'stat-glow cursor-pointer',
        onClick && 'active:scale-[0.98]',
        className
      )}
    >
      {children}
    </div>
  )
}