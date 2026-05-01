import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react'
import { User, AuthContextType } from '../types'
import { supabase } from '../lib/supabase'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const initializedRef = useRef(false)

  useEffect(() => {
    // Guard against double-init (React StrictMode can trigger this)
    if (initializedRef.current) return
    initializedRef.current = true

    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (!error && data) {
          setUser(data)
        }
      }
      setLoading(false)
    }

    loadUser()

    // 2. Listen for auth changes going forward
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (!error && data) {
            setUser(data)
          }
        } else {
          setUser(null)
        }
      }
    )

    return () => {
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
      setLoading(false)
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
      setLoading(false)
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

  // Block banned users from signing in
  const isAdmin = user?.role === 'admin'
  const isBanned = user?.banned === true

  // If user is banned, force sign out
  useEffect(() => {
    if (isBanned) {
      signOut()
    }
  }, [isBanned])

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