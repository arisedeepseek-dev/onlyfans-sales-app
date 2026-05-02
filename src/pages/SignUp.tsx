import { useEffect, useState } from 'react'
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
  const { signUp, user, isAdmin } = useAuth()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      navigate(isAdmin ? '/admin' : '/dashboard', { replace: true })
    }
  }, [user, isAdmin, navigate])

  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignUpForm>()
  const password = watch('password')

  const onSubmit = async (data: SignUpForm) => {
    if (submitting) return
    setSubmitting(true)
    const result = await signUp(data.email, data.password)
    setSubmitting(false)

    if (result.error) {
      alert(result.error)
      return
    }

    navigate('/login', {
      replace: true,
      state: {
        message: 'Account created successfully. Please sign in.'
      }
    })
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

        <Button type="submit" className="w-full min-h-[48px]" disabled={submitting} loading={submitting}>
          {submitting ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      <p className="text-center text-sm sm:text-base text-[#8B8B9E] mt-4 sm:mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-accent-primary hover:underline">Sign In</Link>
      </p>
    </AuthLayout>
  )
}
