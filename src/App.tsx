import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Login } from './pages/Login'
import { SignUp } from './pages/SignUp'
import { Dashboard } from './pages/user/Dashboard'
import { Sales } from './pages/user/Sales'
import { Profile } from './pages/user/Profile'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminUsers } from './pages/admin/AdminUsers'
import { AdminSettings } from './pages/admin/AdminSettings'
import { Theme } from './types'

// Sync theme class to <html>/<body> before first paint to avoid flash
function ThemeSync() {
  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null
    const theme = stored || 'dark'
    document.documentElement.classList.remove('dark', 'light')
    document.documentElement.classList.add(theme)
    document.body.classList.remove('dark', 'light')
    document.body.classList.add(theme)
  }, [])
  return null
}

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { user, loading, isAdmin } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  const { user, isAdmin } = useAuth()

  return (
    <Routes>
      {/* Auth Routes */}
      <Route
        path="/login"
        element={user ? <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace /> : <SignUp />}
      />

      {/* User Routes */}
      <Route
        path="/dashboard"
        element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
      />
      <Route
        path="/sales"
        element={<ProtectedRoute><Sales /></ProtectedRoute>}
      />
      <Route
        path="/profile"
        element={<ProtectedRoute><Profile /></ProtectedRoute>}
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>}
      />
      <Route
        path="/admin/users"
        element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>}
      />
      <Route
        path="/admin/settings"
        element={<ProtectedRoute adminOnly><AdminSettings /></ProtectedRoute>}
      />

      {/* Default redirect */}
      <Route
        path="/"
        element={<Navigate to={user ? (isAdmin ? '/admin' : '/dashboard') : '/login'} replace />}
      />

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeSync />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}