import { useState } from 'react'
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
  const { signIn } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    setError(null)
    setLoading(true)
    try {
      const result = await signIn(data.email, data.password)
      if (result.error) {
        setError(result.error)
      } else {
        navigate('/dashboard')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Welcome Back">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

        {error && (
          <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" loading={loading}>
          Sign In
        </Button>
      </form>

      <p className="text-center text-sm text-[#8B8B9E] mt-4">
        Don't have an account?{' '}
        <Link to="/signup" className="text-accent-primary hover:underline">Sign Up</Link>
      </p>
    </AuthLayout>
  )
}