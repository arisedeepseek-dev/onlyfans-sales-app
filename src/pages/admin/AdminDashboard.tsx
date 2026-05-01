import { useEffect, useState } from 'react'
import { AppLayout } from '../../components/layout/AppLayout'
import { Link } from 'react-router-dom'
import { Users, UserCheck, TrendingUp, Shield, Settings, ChevronRight, Database } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../lib/calculations'

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeToday: 0,
    totalSales: 0,
    totalGross: 0,
    adminCount: 0,
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
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 bg-white/10 rounded-2xl sm:rounded-3xl">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">Admin Panel</h1>
              <p className="text-white/70 text-sm sm:text-base mt-1">Manage your platform from here</p>
            </div>
          </div>
        </div>

        {/* Platform Stats */}
        <section>
          <h2 className="text-[10px] sm:text-xs font-medium text-white/30 uppercase tracking-widest mb-2 sm:mb-3">Platform Stats</h2>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: <Users className="w-4 h-4" /> },
              { label: 'Active Today', value: stats.activeToday, icon: <UserCheck className="w-4 h-4" />, accent: true },
              { label: 'Total Sales', value: stats.totalSales, icon: <Database className="w-4 h-4" /> },
              { label: 'Gross Revenue', value: formatCurrency(stats.totalGross), icon: <TrendingUp className="w-4 h-4" /> },
            ].map(({ label, value, icon, accent }) => (
              <div
                key={label}
                className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 flex items-center gap-3"
              >
                <div className={`p-2 sm:p-2.5 rounded-lg shrink-0 ${accent ? 'bg-success/10 text-success' : 'bg-accent-primary/10 text-accent-primary'}`}>
                  {icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs text-white/40 mb-0.5 truncate">{label}</p>
                  <p className="text-base sm:text-lg md:text-xl font-bold text-white tabular-nums leading-none">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-[10px] sm:text-xs font-medium text-white/30 uppercase tracking-widest mb-2 sm:mb-3">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <Link
              to="/admin/users"
              className="flex items-center justify-between p-4 sm:p-5 md:p-6 bg-dark-card border border-dark-border rounded-2xl sm:rounded-3xl hover:bg-dark-elevated hover:border-accent-primary/30 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3 bg-accent-primary/10 rounded-xl sm:rounded-2xl">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-accent-primary" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm sm:text-base">Manage Users</p>
                  <p className="text-xs text-white/40 mt-0.5">View, edit, and delete accounts</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-accent-primary group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              to="/admin/settings"
              className="flex items-center justify-between p-4 sm:p-5 md:p-6 bg-dark-card border border-dark-border rounded-2xl sm:rounded-3xl hover:bg-dark-elevated hover:border-accent-primary/30 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3 bg-accent-primary/10 rounded-xl sm:rounded-2xl">
                  <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-accent-primary" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm sm:text-base">App Settings</p>
                  <p className="text-xs text-white/40 mt-0.5">Configure app and credentials</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-accent-primary group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </section>

        {/* System Status */}
        <section>
          <h2 className="text-[10px] sm:text-xs font-medium text-white/30 uppercase tracking-widest mb-2 sm:mb-3">System Status</h2>
          <div className="bg-dark-card border border-dark-border rounded-2xl sm:rounded-3xl overflow-hidden">
            {/* Hero Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:p-6 md:p-8 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
                <span className="text-white font-semibold text-sm sm:text-base">All Systems Operational</span>
              </div>
              <div className="text-xs sm:text-sm text-white/40">
                Last checked: just now
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-white/5">
              {[
                { label: 'Version', value: 'v1.0.0', color: 'text-white' },
                { label: 'Backend', value: 'Supabase', color: 'text-accent-primary' },
                { label: 'Framework', value: 'React + Vite', color: 'text-white' },
                { label: 'Status', value: 'Operational', color: 'text-success' },
              ].map(({ label, value, color }) => (
                <div key={label} className="p-3 sm:p-4 text-center">
                  <p className="text-[10px] sm:text-xs text-white/40 mb-1 uppercase tracking-wider">{label}</p>
                  <p className={`text-sm sm:text-base font-bold ${color}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </AppLayout>
  )
}