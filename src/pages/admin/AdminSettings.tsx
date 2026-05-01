import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { AppLayout } from '../../components/layout/AppLayout'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { useAuth } from '../../context/AuthContext'
import { Type, Shield, Save, CheckCircle, AlertCircle, Info } from 'lucide-react'

interface SettingsForm {
  app_name: string
  app_title: string
  admin_username: string
  current_password: string
  new_password: string
  confirm_password: string
}

export function AdminSettings() {
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<SettingsForm>({
    defaultValues: {
      app_name: user?.app_name || 'OnlyFans Sales',
      app_title: user?.app_title || 'Your sales, your numbers, your empire',
      admin_username: user?.email?.split('@')[0] || 'admin',
    }
  })

  const newPassword = watch('new_password')

  useEffect(() => {
    if (user) {
      reset({
        app_name: user.app_name || 'OnlyFans Sales',
        app_title: user.app_title || 'Your sales, your numbers, your empire',
        admin_username: user.email?.split('@')[0] || 'admin',
      })
    }
  }, [user])

  const onSubmit = async (data: SettingsForm) => {
    setLoading(true)
    setError(null)
    setSaved(false)

    try {
      await updateUser({
        app_name: data.app_name,
        app_title: data.app_title,
      })

      if (data.new_password) {
        if (data.new_password !== data.confirm_password) {
          setError('New passwords do not match')
          setLoading(false)
          return
        }
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError('Failed to save settings')
      console.error('Error saving settings:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout title="App Settings">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6 md:space-y-8 animate-fade-in">
        {/* Success Message */}
        {saved && (
          <div className="flex items-center gap-2 p-3 sm:p-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            Settings saved successfully!
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 sm:p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* App Info Card */}
        <Card className="space-y-4 sm:space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <Type className="w-4 h-4 sm:w-5 sm:h-5 text-accent-primary" />
            <h2 className="font-semibold text-white text-sm sm:text-base">App Information</h2>
          </div>

          <Input
            label="App Name"
            placeholder="My Sales App"
            {...register('app_name', { required: 'App name is required' })}
            error={errors.app_name?.message}
          />

          <Input
            label="App Title / Tagline"
            placeholder="Your sales, your numbers, your empire"
            {...register('app_title', { required: 'App title is required' })}
            error={errors.app_title?.message}
          />
        </Card>

        {/* Admin Credentials Card */}
        <Card className="space-y-4 sm:space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-accent-primary" />
            <h2 className="font-semibold text-white text-sm sm:text-base">Admin Account</h2>
          </div>

          <Input
            label="Username"
            placeholder="admin"
            {...register('admin_username', { required: 'Username is required' })}
            error={errors.admin_username?.message}
          />

          <div className="p-3 sm:p-4 rounded-xl bg-dark-elevated border border-white/5">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-[#8B8B9E] mt-0.5 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-[#8B8B9E]">
                Email: <span className="text-white">{user?.email}</span>
              </p>
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 sm:pt-5">
            <p className="text-xs sm:text-sm text-white/40 mb-3 sm:mb-4">Change Password</p>
            <div className="space-y-3 sm:space-y-4">
              <Input
                label="Current Password"
                type="password"
                placeholder="Enter current password"
                {...register('current_password')}
              />

              <Input
                label="New Password"
                type="password"
                placeholder="Leave empty to keep current"
                {...register('new_password', {
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
                error={errors.new_password?.message}
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Re-enter new password"
                {...register('confirm_password', {
                  validate: (value) => !newPassword || value === newPassword || 'Passwords do not match'
                })}
                error={errors.confirm_password?.message}
              />
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <Button
          type="submit"
          className="w-full min-h-[48px]"
          loading={loading}
          icon={<Save className="w-4 h-4" />}
        >
          Save Settings
        </Button>

        {/* Version Info */}
        <div className="text-center pt-2 sm:pt-4">
          <p className="text-xs sm:text-sm text-[#6B6B80]">OnlyFans Sales Tracker v1.0.0</p>
          <p className="text-xs sm:text-sm text-[#6B6B80]">React + Supabase</p>
        </div>
      </form>
    </AppLayout>
  )
}
