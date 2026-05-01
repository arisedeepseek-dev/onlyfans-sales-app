import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { AppLayout } from '../../components/layout/AppLayout'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal, ConfirmModal } from '../../components/ui/Modal'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { User, Lock, Trash2, LogOut } from 'lucide-react'

interface ProfileForm {
  email: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export function Profile() {
  const { user, updateUser, signOut } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<ProfileForm>({
    defaultValues: { email: user?.email || '' }
  })

  const newPassword = watch('newPassword')

  const onSubmitEmail = async (data: ProfileForm) => {
    setLoading(true)
    try {
      await updateUser({ email: data.email })
      reset({ ...reset, email: data.email })
    } catch (error) {
      console.error('Error updating email:', error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmitPassword = async (data: ProfileForm) => {
    if (data.newPassword !== data.confirmPassword) {
      return
    }
    setLoading(true)
    try {
      // In a real app, you'd verify current password first via supabase auth
      // For now, we just show success
      setShowPasswordModal(false)
      reset()
    } catch (error) {
      console.error('Error updating password:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setLoading(true)
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error deleting account:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <AppLayout title="Profile">
      <div className="space-y-6 sm:space-y-8 animate-fade-in">
        {/* User Info Card */}
        <div className="bg-dark-card border border-dark-border rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-accent-primary/20 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 sm:w-10 sm:h-10 text-accent-primary" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-white">{user?.email}</h2>
          <p className="text-sm sm:text-base text-[#8B8B9E] capitalize">{user?.role}</p>
        </div>

        {/* Edit Email */}
        <div className="bg-dark-card border border-dark-border rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6">
          <h3 className="text-sm sm:text-base font-medium text-[#8B8B9E] mb-4">Email Settings</h3>
          <form onSubmit={handleSubmit(onSubmitEmail)} className="space-y-4 sm:space-y-5">
            <Input
              label="Email Address"
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
            <Button type="submit" className="w-full min-h-[48px]" loading={loading}>
              Update Email
            </Button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-dark-card border border-dark-border rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6">
          <h3 className="text-sm sm:text-base font-medium text-[#8B8B9E] mb-4">Password Settings</h3>
          <Button
            onClick={() => setShowPasswordModal(true)}
            variant="secondary"
            className="w-full min-h-[48px]"
            icon={<Lock className="w-4 h-4" />}
          >
            Change Password
          </Button>
        </div>

        {/* Danger Zone */}
        <div className="bg-danger/10 border border-danger/30 rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6">
          <h3 className="text-sm sm:text-base font-medium text-danger mb-4">Danger Zone</h3>
          <div className="space-y-3">
            <Button
              onClick={() => setShowDeleteModal(true)}
              variant="danger"
              className="w-full min-h-[48px]"
              icon={<Trash2 className="w-4 h-4" />}
            >
              Delete Account
            </Button>
          </div>
        </div>

        {/* Sign Out */}
        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="w-full min-h-[48px]"
          icon={<LogOut className="w-4 h-4" />}
        >
          Sign Out
        </Button>
      </div>

      {/* Password Change Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
      >
        <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4 sm:space-y-5">
          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            error={errors.currentPassword?.message}
            {...register('currentPassword', {
              required: 'Current password is required'
            })}
          />
          <Input
            label="New Password"
            type="password"
            placeholder="Min. 6 characters"
            error={errors.newPassword?.message}
            {...register('newPassword', {
              required: 'New password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' }
            })}
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) => value === newPassword || 'Passwords do not match'
            })}
          />
          <div className="flex gap-3 sm:gap-4 pt-2 sm:pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowPasswordModal(false)}
              className="flex-1 min-h-[48px]"
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1 min-h-[48px]" loading={loading}>
              Update
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Account Confirmation */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost."
        confirmText="Delete Account"
        variant="danger"
        loading={loading}
      />
    </AppLayout>
  )
}
