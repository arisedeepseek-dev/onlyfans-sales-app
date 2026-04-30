import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Theme } from '../types'

export function useTheme() {
  const { user, updateUser } = useAuth()
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    if (user?.theme) {
      setTheme(user.theme)
    } else {
      const stored = localStorage.getItem('theme') as Theme | null
      if (stored) setTheme(stored)
    }
  }, [user?.theme])

  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.documentElement.classList.remove('dark', 'light')
    document.documentElement.classList.add(theme)
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