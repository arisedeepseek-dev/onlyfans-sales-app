import { useEffect, useState } from 'react'
import { AppLayout } from '../../components/layout/AppLayout'
import { StatCard } from '../../components/ui/StatCard'
import { User, DollarSign, Activity, TrendingUp } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatCurrency } from '../../lib/calculations'

export function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSales: 0,
    totalGross: 0,
    activeToday: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      // Get total users
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      // Get total sales and gross
      const { data: salesData } = await supabase
        .from('sales')
        .select('gross_sales')

      const totalGross = (salesData || []).reduce((sum: number, s: { gross_sales: number }) => sum + Number(s.gross_sales), 0)
      const totalSales = (salesData || []).length

      // Get today's active users (users who added sales today)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const { data: todaySales } = await supabase
        .from('sales')
        .select('user_id')
        .gte('created_at', today.toISOString())

      const uniqueUsersToday = new Set((todaySales || []).map((s: { user_id: string }) => s.user_id))

      setStats({
        totalUsers: userCount || 0,
        totalSales,
        totalGross,
        activeToday: uniqueUsersToday.size
      })
    } catch (error) {
      console.error('Error fetching admin stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AppLayout title="Admin Overview">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Admin Overview">
      <div className="space-y-6 animate-fade-in">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-br from-accent-primary to-accent-secondary rounded-2xl p-6">
          <h1 className="text-2xl font-bold text-white mb-2">Welcome, Admin</h1>
          <p className="text-white/70">Here's your app overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Total Users"
            value={stats.totalUsers.toString()}
            icon={<User className="w-5 h-5" />}
            accent
          />
          <StatCard
            label="Active Today"
            value={stats.activeToday.toString()}
            icon={<Activity className="w-5 h-5" />}
          />
          <StatCard
            label="Total Sales"
            value={stats.totalSales.toString()}
            icon={<DollarSign className="w-5 h-5" />}
          />
          <StatCard
            label="Total Gross"
            value={formatCurrency(stats.totalGross)}
            icon={<TrendingUp className="w-5 h-5" />}
          />
        </div>

        {/* App Settings Quick Link */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-4">
          <h3 className="text-sm font-medium text-[#8B8B9E] mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <a
              href="/admin/users"
              className="flex items-center justify-between p-3 bg-dark-elevated rounded-xl hover:bg-dark-border transition-colors"
            >
              <span className="text-white">Manage Users</span>
              <span className="text-[#8B8B9E]">→</span>
            </a>
            <a
              href="/admin/settings"
              className="flex items-center justify-between p-3 bg-dark-elevated rounded-xl hover:bg-dark-border transition-colors"
            >
              <span className="text-white">App Settings</span>
              <span className="text-[#8B8B9E]">→</span>
            </a>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}