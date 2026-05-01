import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { AuthLayout } from '../components/layout/AuthLayout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../context/AuthContext'

interface SignUpForm {
  email: string
  password: string
  confirmPassword: string
}

export function SignUp() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignUpForm>()
  const password = watch('password')

  const onSubmit = async (data: SignUpForm) => {
    setError(null)
    setLoading(true)
    try {
      const result = await signUp(data.email, data.password)
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
    <AuthLayout title="Create Account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
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
          placeholder="Min. 6 characters"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 6, message: 'Password must be at least 6 characters' }
          })}
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (value) => value === password || 'Passwords do not match'
          })}
        />

        {error && (
          <div className="p-3 sm:p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm sm:text-base">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full min-h-[48px]" loading={loading}>
          Create Account
        </Button>
      </form>

      <p className="text-center text-sm sm:text-base text-[#8B8B9E] mt-4 sm:mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-accent-primary hover:underline">Sign In</Link>
      </p>
    </AuthLayout>
  )
}
