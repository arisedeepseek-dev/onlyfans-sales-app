import { useEffect, useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { AuthLayout } from '../components/layout/AuthLayout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../context/AuthContext'

interface LoginForm {
  email: string
  password: string
}

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, user, isAdmin, loading: authLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>((location.state as { message?: string } | null)?.message ?? null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      navigate(isAdmin ? '/admin' : '/dashboard', { replace: true })
    }
  }, [user, isAdmin, navigate])

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    if (submitting) return
    setError(null)
    setMessage(null)
    setSubmitting(true)

    const result = await signIn(data.email, data.password)
    setSubmitting(false)

    if (result.error) {
      setError(result.error)
    }
    // Navigation happens via useEffect when user state updates
  }

  return (
    <AuthLayout title="Welcome Back">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
        {message && (
          <div className="p-3 rounded-xl bg-success/10 border border-success/20 text-success text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
            {error}
          </div>
        )}

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={<span>@</span>}
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          })}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 6, message: 'Password must be at least 6 characters' }
          })}
          error={errors.password?.message}
        />

        <Button
          type="submit"
          className="w-full min-h-[48px]"
          disabled={submitting || authLoading}
          loading={submitting}
        >
          {submitting ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <p className="text-center text-sm sm:text-base text-[#8B8B9E] mt-4 sm:mt-6">
        Don't have an account?{' '}
        <Link to="/signup" className="text-accent-primary hover:underline">Sign Up</Link>
      </p>
    </AuthLayout>
  )
}
