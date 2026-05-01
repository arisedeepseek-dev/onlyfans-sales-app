import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl border transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
      style={{
        backgroundColor: isDark ? '#13131A' : '#FFFFFF',
        borderColor: isDark ? '#1E1E2E' : '#E0E2F0',
        color: isDark ? '#8B8B9E' : '#4A4A6A',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = isDark ? '#6C5CE7' : '#6C5CE7'
        e.currentTarget.style.color = isDark ? '#FFFFFF' : '#6C5CE7'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isDark ? '#1E1E2E' : '#E0E2F0'
        e.currentTarget.style.color = isDark ? '#8B8B9E' : '#4A4A6A'
      }}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  )
}