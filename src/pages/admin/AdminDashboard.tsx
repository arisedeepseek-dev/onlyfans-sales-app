import { useEffect, useState } from 'react'
import { AppLayout } from '../../components/layout/AppLayout'
import { Link } from 'react-router-dom'
import { Users, UserCheck, Shield, Settings, Database, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../lib/calculations'

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeToday: 0,
    totalSales: 0,
    totalGross: 0,
    adminCount: 0,
    userCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      const { count: adminCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin')

      const { data: salesData } = await supabase
        .from('sales')
        .select('gross_sales')

      const totalGross = (salesData || []).reduce((sum: number, s: { gross_sales: number }) => sum + Number(s.gross_sales), 0)
      const totalSales = (salesData || []).length

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const { data: todaySales } = await supabase
        .from('sales')
        .select('user_id')
        .gte('created_at', today.toISOString())

      const uniqueUsersToday = new Set((todaySales || []).map((s: { user_id: string }) => s.user_id))

      setStats({
        totalUsers: userCount || 0,
        activeToday: uniqueUsersToday.size,
        totalSales,
        totalGross,
        adminCount: adminCount || 0,
        userCount: (userCount || 0) - (adminCount || 0),
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
      <div className="space-y-5 sm:space-y-6 md:space-y-8 animate-fade-in">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-br from-accent-primary to-accent-secondary rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 sm:p-3 bg-white/10 rounded-xl sm:rounded-2xl">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Admin Panel</h1>
              <p className="text-white/70 text-sm sm:text-base">Manage your platform from here</p>
            </div>
          </div>
        </div>

        {/* User Stats - Admin focused */}
        <section>
          <h2 className="text-[10px] sm:text-xs font-medium text-white/30 uppercase tracking-widest mb-2 sm:mb-3">Platform Users</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <div className="bg-dark-card border border-dark-border rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 sm:p-3 bg-accent-primary/10 rounded-xl">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-accent-primary" />
                </div>
              </div>
              <p className="text-[10px] sm:text-xs text-white/40 mb-1">Total Users</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{stats.totalUsers}</p>
            </div>

            <div className="bg-dark-card border border-dark-border rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 sm:p-3 bg-success/10 rounded-xl">
                  <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                </div>
              </div>
              <p className="text-[10px] sm:text-xs text-white/40 mb-1">Active Today</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{stats.activeToday}</p>
            </div>

            <div className="bg-dark-card border border-dark-border rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 sm:p-3 bg-accent-primary/10 rounded-xl">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-accent-primary" />
                </div>
              </div>
              <p className="text-[10px] sm:text-xs text-white/40 mb-1">Admins</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-primary">{stats.adminCount}</p>
            </div>

            <div className="bg-dark-card border border-dark-border rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 sm:p-3 bg-dark-elevated rounded-xl">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#8B8B9E]" />
                </div>
              </div>
              <p className="text-[10px] sm:text-xs text-white/40 mb-1">Regular Users</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{stats.userCount}</p>
            </div>
          </div>
        </section>

        {/* Sales Overview - simple summary, not detailed */}
        <section>
          <h2 className="text-[10px] sm:text-xs font-medium text-white/30 uppercase tracking-widest mb-2 sm:mb-3">User Sales Summary</h2>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="bg-dark-card border border-dark-border rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-white/40 mb-1">Total Sales Entries</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{stats.totalSales}</p>
              </div>
              <div className="p-3 bg-dark-elevated rounded-xl">
                <Database className="w-5 h-5 text-[#8B8B9E]" />
              </div>
            </div>

            <div className="bg-dark-card border border-dark-border rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-white/40 mb-1">Total Gross Revenue</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{formatCurrency(stats.totalGross)}</p>
              </div>
              <div className="p-3 bg-dark-elevated rounded-xl">
                <Database className="w-5 h-5 text-[#8B8B9E]" />
              </div>
            </div>
          </div>
        </section>

        {/* Admin Actions */}
        <section>
          <h2 className="text-[10px] sm:text-xs font-medium text-white/30 uppercase tracking-widest mb-2 sm:mb-3">Manage Platform</h2>
          <div className="space-y-2 sm:space-y-3">
            <Link
              to="/admin/users"
              className="flex items-center justify-between p-4 sm:p-5 md:p-6 bg-dark-card border border-dark-border rounded-2xl sm:rounded-3xl hover:bg-dark-elevated transition-colors group"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3 bg-accent-primary/10 rounded-xl sm:rounded-2xl">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-accent-primary" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm sm:text-base">Manage Users</p>
                  <p className="text-xs sm:text-sm text-white/40 mt-0.5">View, edit, and delete user accounts</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-accent-primary transition-colors" />
            </Link>

            <Link
              to="/admin/settings"
              className="flex items-center justify-between p-4 sm:p-5 md:p-6 bg-dark-card border border-dark-border rounded-2xl sm:rounded-3xl hover:bg-dark-elevated transition-colors group"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3 bg-accent-primary/10 rounded-xl sm:rounded-2xl">
                  <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-accent-primary" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm sm:text-base">App Settings</p>
                  <p className="text-xs sm:text-sm text-white/40 mt-0.5">Configure app name, title, and credentials</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-accent-primary transition-colors" />
            </Link>
          </div>
        </section>

        {/* System Info */}
        <div className="bg-dark-card border border-dark-border rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6">
          <p className="text-[10px] sm:text-xs font-medium text-white/30 uppercase tracking-widest mb-3 sm:mb-4">System Info</p>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="p-3 sm:p-4 bg-dark-elevated rounded-xl">
              <p className="text-white/40 mb-1">Version</p>
              <p className="text-white font-medium">v1.0.0</p>
            </div>
            <div className="p-3 sm:p-4 bg-dark-elevated rounded-xl">
              <p className="text-white/40 mb-1">Backend</p>
              <p className="text-white font-medium">Supabase</p>
            </div>
            <div className="p-3 sm:p-4 bg-dark-elevated rounded-xl">
              <p className="text-white/40 mb-1">Framework</p>
              <p className="text-white font-medium">React + Vite</p>
            </div>
            <div className="p-3 sm:p-4 bg-dark-elevated rounded-xl">
              <p className="text-white/40 mb-1">Status</p>
              <p className="text-success font-medium">Operational</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}