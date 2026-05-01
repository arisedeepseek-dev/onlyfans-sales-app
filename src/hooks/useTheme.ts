import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Theme } from '../types'

export function useTheme() {
  const { user, updateUser } = useAuth()
  const [theme, setTheme] = useState<Theme>('dark')

  // Sync theme state with user preference / localStorage on mount
  useEffect(() => {
    if (user?.theme) {
      setTheme(user.theme)
    } else {
      const stored = localStorage.getItem('theme') as Theme | null
      if (stored) setTheme(stored)
    }
  }, [user?.theme])

  // Apply theme class to <html> and update body classes
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark', 'light')
    root.classList.add(theme)
    localStorage.setItem('theme', theme)

    // Also update body classes dynamically so Tailwind utilities respond correctly
    if (theme === 'dark') {
      document.body.classList.add('dark')
      document.body.classList.remove('light')
    } else {
      document.body.classList.add('light')
      document.body.classList.remove('dark')
    }
  }, [theme])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    if (user) {
      updateUser({ theme: newTheme }).catch(console.error)
    }
  }

  return { theme, toggleTheme, setTheme }
}