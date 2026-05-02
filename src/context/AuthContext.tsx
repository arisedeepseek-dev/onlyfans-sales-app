import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, AuthContextType } from '../types'
import { supabase } from '../lib/supabase'
import { User as SupabaseAuthUser } from '@supabase/supabase-js'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await ensureUserProfile(session.user)
        await fetchUser(session.user.id, session.user)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await ensureUserProfile(session.user)
          await fetchUser(session.user.id, session.user)
        } else {
          setUser(null)
          setLoading(false)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function fetchUser(userId: string, authUser?: SupabaseAuthUser) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (!error && data) {
      setUser(data)
    } else {
      // Fallback to auth session user so routing still works even if profile read fails.
      if (authUser) {
        const now = new Date().toISOString()
        setUser({
          id: authUser.id,
          email: authUser.email ?? '',
          role: 'user',
          banned: false,
          theme: 'dark',
          created_at: now,
          updated_at: now
        })
      } else {
        setUser(null)
      }
    }
    setLoading(false)
  }

  async function ensureUserProfile(authUser: SupabaseAuthUser) {
    const { error } = await supabase
      .from('users')
      .upsert(
        {
          id: authUser.id,
          email: authUser.email ?? '',
          role: 'user',
          banned: false,
          theme: 'dark'
        },
        { onConflict: 'id' }
      )

    if (error) {
      console.error('Failed to ensure user profile:', error.message)
    }
  }

  async function signIn(email: string, password: string) {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setLoading(false)
        return { error: error.message }
      }
      // onAuthStateChange will handle updating user state
      return { error: null }
    } catch (err) {
      setLoading(false)
      return { error: 'An unexpected error occurred' }
    }
  }

  async function signUp(email: string, password: string) {
    try {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        return { error: error.message }
      }
      return { error: null }
    } catch (err) {
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
    const { error } = await supabase
      .from('users')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', user.id)
    if (error) throw error
    setUser(prev => prev ? { ...prev, ...data } : null)
  }

  const isAdmin = user?.role === 'admin'
  const isBanned = user?.banned === true

  // Block banned users from signing in
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
