import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Login } from './pages/Login'
import { SignUp } from './pages/SignUp'
import { Dashboard } from './pages/user/Dashboard'
import { Sales } from './pages/user/Sales'
import { Profile } from './pages/user/Profile'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminUsers } from './pages/admin/AdminUsers'
import { AdminSettings } from './pages/admin/AdminSettings'

function ProtectedRoute({ children, adminOnly = false, userOnly = false }: { children: React.ReactNode; adminOnly?: boolean; userOnly?: boolean }) {
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

  // Admin trying to access user-only pages → go to admin
  if (userOnly && isAdmin) {
    return <Navigate to="/admin" replace />
  }

  // Non-admin trying to access admin pages → go to dashboard
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

      {/* User Routes — admin redirected away */}
      <Route
        path="/dashboard"
        element={<ProtectedRoute userOnly><Dashboard /></ProtectedRoute>}
      />
      <Route
        path="/sales"
        element={<ProtectedRoute userOnly><Sales /></ProtectedRoute>}
      />
      <Route
        path="/profile"
        element={<ProtectedRoute userOnly><Profile /></ProtectedRoute>}
      />

      {/* Admin Routes — non-admin redirected away */}
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
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}