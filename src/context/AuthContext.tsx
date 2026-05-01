import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react'
import { User, AuthContextType } from '../types'
import { supabase } from '../lib/supabase'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const initializedRef = useRef(false)

  useEffect(() => {
    // Prevent double initialization
    if (initializedRef.current) return
    initializedRef.current = true

    let cancelled = false

    async function init() {
      try {
        // 1. Check existing session
        const { data: { session } } = await supabase.auth.getSession()

        if (!cancelled && session?.user) {
          // 2. Fetch user profile if session exists
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (!cancelled) {
            if (error) {
              console.error('Profile fetch error:', error)
              setUser(null)
            } else {
              setUser(data)
            }
          }
        } else if (!cancelled) {
          setUser(null)
        }
      } catch (err) {
        console.error('Auth init error:', err)
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    init()

    // Listen for future auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        // Skip the first redundant SIGHUP event that Supabase fires
        if (cancelled || !initializedRef.current) return

        if (session?.user) {
          try {
            const { data, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()

            if (!cancelled) {
              if (error) {
                setUser(null)
              } else {
                setUser(data)
              }
            }
          } catch {
            if (!cancelled) setUser(null)
          }
        } else {
          if (!cancelled) setUser(null)
        }
      }
    )

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  async function signIn(email: string, password: string) {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setLoading(false)
        return { error: error.message }
      }
      // Wait for loading to be resolved by onAuthStateChange
      return { error: null }
    } catch (err) {
      setLoading(false)
      return { error: 'An unexpected error occurred' }
    }
  }

  async function signUp(email: string, password: string) {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setLoading(false)
        return { error: error.message }
      }
      return { error: null }
    } catch (err) {
      setLoading(false)
      return { error: 'An unexpected error occurred' }
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setLoading(false)
  }

  async function updateUser(data: Partial<User>) {
    if (!user) return
    try {
      const { error } = await supabase
        .from('users')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', user.id)
      if (error) throw error
      setUser(prev => prev ? { ...prev, ...data } : null)
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}