import { useEffect, useState } from 'react'
import { AppLayout } from '../../components/layout/AppLayout'
import { StatCard } from '../../components/ui/StatCard'
import { User, DollarSign, TrendingUp, Users } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../lib/calculations'
import { Link } from 'react-router-dom'
import { SalesChart } from '../../components/ui/SalesChart'

type ChartPeriod = '24h' | '7d' | '30d' | '90d' | '1y'
type ChartDataPoint = { label: string; gross: number; net: number; comms: number; salary: number }

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSales: 0,
    totalGross: 0,
    totalNet: 0,
    totalComms: 0,
    totalSalary: 0,
    activeToday: 0,
  })
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('7d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      const { data: salesData } = await supabase
        .from('sales')
        .select('*')

      const totalGross = (salesData || []).reduce((sum: number, s: { gross_sales: number }) => sum + Number(s.gross_sales), 0)
      const totalNet = totalGross * 0.8
      const totalComms = (salesData || []).reduce((sum: number, s: { gross_sales: number; comms_percent: number }) => {
        return sum + (Number(s.gross_sales) * 0.8 * (Number(s.comms_percent) / 100)), 0
      })
      const totalSalary = (salesData || []).reduce((sum: number, s: { gross_sales: number; comms_percent: number; hourly_rate: number; hours_worked: number }) => {
        const net = Number(s.gross_sales) * 0.8
        const comms = net * (Number(s.comms_percent) / 100)
        const hourly = Number(s.hourly_rate || 0) * Number(s.hours_worked || 0)
        return sum + comms + hourly
      }, 0)

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
        totalSales,
        totalGross,
        totalNet,
        totalComms,
        totalSalary,
        activeToday: uniqueUsersToday.size,
      })

      // Build chart data
      const chartDataMap = buildChartData(salesData || [], chartPeriod)
      setChartData(chartDataMap)
    } catch (error) {
      console.error('Error fetching admin stats:', error)
    } finally {
      setLoading(false)
    }
  }

  function buildChartData(sales: any[], period: ChartPeriod): ChartDataPoint[] {
    if (!sales.length) return []

    const now = new Date()
    let labels: string[] = []
    const dataMap: Record<string, { gross: number; net: number; comms: number; salary: number }> = {}

    if (period === '24h') {
      for (let i = 23; i >= 0; i--) {
        const d = new Date(now)
        d.setHours(now.getHours() - i, 0, 0, 0)
        labels.push(d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))
      }
      labels.forEach(l => { dataMap[l] = { gross: 0, net: 0, comms: 0, salary: 0 } })
      sales.forEach(s => {
        const d = new Date(s.created_at)
        const key = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        if (dataMap[key] !== undefined) {
          const net = Number(s.gross_sales) * 0.8
          const comms = net * (Number(s.comms_percent) / 100)
          const salary = comms + (Number(s.hourly_rate || 0) * Number(s.hours_worked || 0))
          dataMap[key].gross += Number(s.gross_sales)
          dataMap[key].net += net
          dataMap[key].comms += comms
          dataMap[key].salary += salary
        }
      })
    } else if (period === '7d') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(now.getDate() - i)
        const label = d.toLocaleDateString('en-US', { weekday: 'short' })
        labels.push(label)
        dataMap[label] = { gross: 0, net: 0, comms: 0, salary: 0 }
      }
      sales.forEach(s => {
        const d = new Date(s.created_at)
        const key = d.toLocaleDateString('en-US', { weekday: 'short' })
        if (dataMap[key] !== undefined) {
          const net = Number(s.gross_sales) * 0.8
          const comms = net * (Number(s.comms_percent) / 100)
          const salary = comms + (Number(s.hourly_rate || 0) * Number(s.hours_worked || 0))
          dataMap[key].gross += Number(s.gross_sales)
          dataMap[key].net += net
          dataMap[key].comms += comms
          dataMap[key].salary += salary
        }
      })
    } else if (period === '30d') {
      labels = ['W1', 'W2', 'W3', 'W4']
      labels.forEach(l => { dataMap[l] = { gross: 0, net: 0, comms: 0, salary: 0 } })
      sales.forEach(s => {
        const d = new Date(s.created_at)
        const daysAgo = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
        const week = Math.floor(daysAgo / 7)
        const key = `W${Math.min(4, Math.max(1, 4 - week))}`
        if (dataMap[key] !== undefined) {
          const net = Number(s.gross_sales) * 0.8
          const comms = net * (Number(s.comms_percent) / 100)
          const salary = comms + (Number(s.hourly_rate || 0) * Number(s.hours_worked || 0))
          dataMap[key].gross += Number(s.gross_sales)
          dataMap[key].net += net
          dataMap[key].comms += comms
          dataMap[key].salary += salary
        }
      })
    } else if (period === '90d') {
      for (let i = 2; i >= 0; i--) {
        const d = new Date(now)
        d.setMonth(now.getMonth() - i)
        const label = d.toLocaleDateString('en-US', { month: 'short' })
        labels.push(label)
        dataMap[label] = { gross: 0, net: 0, comms: 0, salary: 0 }
      }
      sales.forEach(s => {
        const d = new Date(s.created_at)
        const key = d.toLocaleDateString('en-US', { month: 'short' })
        if (dataMap[key] !== undefined) {
          const net = Number(s.gross_sales) * 0.8
          const comms = net * (Number(s.comms_percent) / 100)
          const salary = comms + (Number(s.hourly_rate || 0) * Number(s.hours_worked || 0))
          dataMap[key].gross += Number(s.gross_sales)
          dataMap[key].net += net
          dataMap[key].comms += comms
          dataMap[key].salary += salary
        }
      })
    } else if (period === '1y') {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now)
        d.setMonth(now.getMonth() - i)
        const label = d.toLocaleDateString('en-US', { month: 'short' })
        labels.push(label)
        dataMap[label] = { gross: 0, net: 0, comms: 0, salary: 0 }
      }
      sales.forEach(s => {
        const d = new Date(s.created_at)
        const key = d.toLocaleDateString('en-US', { month: 'short' })
        if (dataMap[key] !== undefined) {
          const net = Number(s.gross_sales) * 0.8
          const comms = net * (Number(s.comms_percent) / 100)
          const salary = comms + (Number(s.hourly_rate || 0) * Number(s.hours_worked || 0))
          dataMap[key].gross += Number(s.gross_sales)
          dataMap[key].net += net
          dataMap[key].comms += comms
          dataMap[key].salary += salary
        }
      })
    }

    return labels.map(label => ({
      label,
      gross: dataMap[label]?.gross || 0,
      net: dataMap[label]?.net || 0,
      comms: dataMap[label]?.comms || 0,
      salary: dataMap[label]?.salary || 0,
    }))
  }

  function handlePeriodChange(p: ChartPeriod) {
    setChartPeriod(p)
    // Refetch chart with new period
    supabase.from('sales').select('*').then(({ data: salesData }) => {
      setChartData(buildChartData(salesData || [], p))
    })
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
    <AppLayout
      title="Admin Overview"
      rightAction={
        <Link to="/admin/users" className="text-xs sm:text-sm text-accent-primary font-medium whitespace-nowrap">Manage Users</Link>
      }
    >
      <div className="space-y-5 sm:space-y-6 md:space-y-8 animate-fade-in">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-br from-accent-primary to-accent-secondary rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">Welcome, Admin</h1>
          <p className="text-white/70 text-sm sm:text-base">Here's your app overview</p>
        </div>

        {/* Users & Activity Row */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <StatCard
            label="Total Users"
            value={stats.totalUsers.toString()}
            icon={<Users className="w-4 h-4 sm:w-5 sm:h-5" />}
          />
          <StatCard
            label="Active Today"
            value={stats.activeToday.toString()}
            icon={<User className="w-4 h-4 sm:w-5 sm:h-5" />}
            accent
          />
        </div>

        {/* Sales Stats Row */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          <StatCard
            label="Sales"
            value={stats.totalSales.toString()}
            icon={<DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />}
          />
          <StatCard
            label="Gross"
            value={formatCurrency(stats.totalGross)}
            icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />}
          />
          <StatCard
            label="Net 80%"
            value={formatCurrency(stats.totalNet)}
          />
          <StatCard
            label="Salary"
            value={formatCurrency(stats.totalSalary)}
            accent
          />
        </div>

        {/* Chart */}
        {stats.totalSales > 0 && (
          <section>
            <SalesChart
              data={chartData}
              period={chartPeriod}
              onPeriodChange={handlePeriodChange}
            />
          </section>
        )}

        {/* Quick Actions */}
        <div className="bg-dark-card border border-dark-border rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6">
          <h3 className="text-[10px] sm:text-xs font-medium text-white/30 uppercase tracking-widest mb-3 sm:mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <Link
              to="/admin/users"
              className="flex items-center justify-between p-3 sm:p-4 md:p-5 bg-dark-elevated rounded-xl sm:rounded-2xl hover:bg-dark-border transition-colors"
            >
              <span className="text-white text-sm sm:text-base">Manage Users</span>
              <span className="text-[#8B8B9E]">→</span>
            </Link>
            <Link
              to="/admin/settings"
              className="flex items-center justify-between p-3 sm:p-4 md:p-5 bg-dark-elevated rounded-xl sm:rounded-2xl hover:bg-dark-border transition-colors"
            >
              <span className="text-white text-sm sm:text-base">App Settings</span>
              <span className="text-[#8B8B9E]">→</span>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
