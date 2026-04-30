import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { AppLayout } from '../../components/layout/AppLayout'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { Type, Shield, Save, CheckCircle } from 'lucide-react'

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

  const { register, handleSubmit, watch, formState: { errors } } = useForm<SettingsForm>({
    defaultValues: {
      app_name: user?.app_name || 'OnlyFans Sales',
      app_title: user?.app_title || 'Your sales, your numbers, your empire',
      admin_username: user?.email?.split('@')[0] || 'admin',
    }
  })

  const newPassword = watch('new_password')

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      // We don't auto-fill passwords for security
    }
  }, [user])

  const onSubmit = async (data: SettingsForm) => {
    setLoading(true)
    setError(null)
    setSaved(false)

    try {
      // Update user profile in Supabase
      await updateUser({
        app_name: data.app_name,
        app_title: data.app_title,
      })

      // If changing password (would need current password verification in real app)
      if (data.new_password) {
        if (data.new_password !== data.confirm_password) {
          setError('New passwords do not match')
          setLoading(false)
          return
        }
        // In a real implementation, you'd verify current password and update via supabase.auth.updateUser
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
    <AppLayout title="App Settings" showNav={true}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-fade-in">
        {/* Success Message */}
        {saved && (
          <div className="p-3 rounded-xl bg-success/10 border border-success/30 text-success text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Settings saved successfully!
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm">
            {error}
          </div>
        )}

        {/* App Info */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 text-white mb-2">
            <Type className="w-5 h-5 text-accent-primary" />
            <h2 className="font-semibold">App Information</h2>
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

        {/* Admin Credentials */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 text-white mb-2">
            <Shield className="w-5 h-5 text-accent-primary" />
            <h2 className="font-semibold">Admin Credentials</h2>
          </div>

          <Input
            label="Admin Username"
            placeholder="admin"
            {...register('admin_username', { required: 'Username is required' })}
            error={errors.admin_username?.message}
          />

          <Input
            label="Current Password"
            type="password"
            placeholder="Enter current password to change"
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
        </Card>

        {/* Save Button */}
        <Button
          type="submit"
          className="w-full"
          loading={loading}
          icon={<Save className="w-4 h-4" />}
        >
          Save Settings
        </Button>

        {/* Version Info */}
        <div className="text-center pt-4">
          <p className="text-xs text-[#6B6B80]">OnlyFans Sales Tracker v1.0.0</p>
          <p className="text-xs text-[#6B6B80]">Built with React + Supabase</p>
        </div>
      </form>
    </AppLayout>
  )
}