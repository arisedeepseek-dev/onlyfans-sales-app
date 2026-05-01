import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react'
import { User, AuthContextType } from '../types'
import { supabase } from '../lib/supabase'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const authResolveRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setUser(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function fetchUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setUser(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setUser(null)
    } finally {
      setLoading(false)
      if (authResolveRef.current) {
        authResolveRef.current()
        authResolveRef.current = null
      }
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
      // Wait for onAuthStateChange + fetchUserProfile to complete
      await new Promise<void>((resolve) => {
        authResolveRef.current = resolve
      })
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
      // Wait for onAuthStateChange + fetchUserProfile to complete
      await new Promise<void>((resolve) => {
        authResolveRef.current = resolve
      })
      return { error: null }
    } catch (err) {
      setLoading(false)
      return { error: 'An unexpected error occurred' }
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
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