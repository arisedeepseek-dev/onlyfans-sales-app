import { useEffect, useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
  const { signIn, user, isAdmin, loading: authLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const initialized = useRef(false)

  // Handle navigation once when user is confirmed
  useEffect(() => {
    // Only navigate after auth has finished loading AND we have a user
    if (authLoading || initialized.current) return
    if (user) {
      initialized.current = true
      navigate(isAdmin ? '/admin' : '/dashboard', { replace: true })
    }
  }, [user, isAdmin, authLoading, navigate])

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    if (submitting) return
    setError(null)
    setSubmitting(true)

    try {
      const result = await signIn(data.email, data.password)
      if (result.error) {
        setError(result.error)
      }
      // Navigation will happen via useEffect when user state updates
    } finally {
      setSubmitting(false)
    }
  }

  // Show loading spinner only on initial auth check, not during form submission
  if (authLoading && !submitting) {
    return (
      <AuthLayout title="Welcome Back">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Welcome Back">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
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
          disabled={submitting}
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
