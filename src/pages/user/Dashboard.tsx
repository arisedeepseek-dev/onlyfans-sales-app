import { useEffect, useState, useMemo } from 'react'
import { AppLayout } from '../../components/layout/AppLayout'
import { Sale, DashboardStats } from '../../types'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatCurrency, calculatePeriodStats, getDateRange, computeSaleValues } from '../../lib/calculations'
import { TrendingUp, DollarSign, Clock, Calculator } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SalesChart } from '../../components/ui/SalesChart'

type ChartPeriod = '24h' | '7d' | '30d' | '90d' | '1y'
type ChartDataPoint = { label: string; gross: number; net: number; comms: number; salary: number }



export function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentSales, setRecentSales] = useState<Sale[]>([])
  const [allSales, setAllSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('7d')

  useEffect(() => {
    fetchData()
  }, [user?.id])

  async function fetchData() {
    if (!user) return
    try {
      const { data: sales, error } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error

      const periods: Array<'today' | 'weekly' | 'biweekly' | 'monthly' | 'yearly'> = ['today', 'weekly', 'biweekly', 'monthly', 'yearly']
      const newStats: DashboardStats = {
        today: { gross: 0, net: 0, comms: 0, hourlyEarnings: 0, salary: 0 },
        weekly: { gross: 0, net: 0, comms: 0, hourlyEarnings: 0, salary: 0 },
        biweekly: { gross: 0, net: 0, comms: 0, hourlyEarnings: 0, salary: 0 },
        monthly: { gross: 0, net: 0, comms: 0, hourlyEarnings: 0, salary: 0 },
        yearly: { gross: 0, net: 0, comms: 0, hourlyEarnings: 0, salary: 0 },
      }

      periods.forEach(period => {
        const { start, end } = getDateRange(period)
        newStats[period] = calculatePeriodStats(sales || [], start, end)
      })

      setStats(newStats)
      setRecentSales((sales || []).slice(0, 5))
      setAllSales(sales || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const chartData = useMemo((): ChartDataPoint[] => {
    if (!allSales.length) return []

    const now = new Date()

    const buildMap = (
      keys: string[],
      getKey: (d: Date) => string
    ): Record<string, { gross: number; net: number; comms: number; salary: number }> => {
      const map: Record<string, { gross: number; net: number; comms: number; salary: number }> = {}
      keys.forEach(k => { map[k] = { gross: 0, net: 0, comms: 0, salary: 0 } })
      allSales.forEach(sale => {
        const saleDate = new Date(sale.created_at)
        const key = getKey(saleDate)
        if (map[key]) {
          const { net, comms, salary } = computeSaleValues(sale)
          map[key].gross += Number(sale.gross_sales)
          map[key].net += net
          map[key].comms += comms
          map[key].salary += salary
        }
      })
      return map
    }

    let labels: string[] = []
    let dataMap: Record<string, { gross: number; net: number; comms: number; salary: number }> = {}

    if (chartPeriod === '24h') {
      for (let i = 23; i >= 0; i--) {
        const d = new Date(now)
        d.setHours(now.getHours() - i, 0, 0, 0)
        labels.push(d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))
      }
      dataMap = buildMap(labels, d => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))
    } else if (chartPeriod === '7d') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(now.getDate() - i)
        labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }))
      }
      dataMap = buildMap(labels, d => d.toLocaleDateString('en-US', { weekday: 'short' }))
    } else if (chartPeriod === '30d') {
      labels = ['W1', 'W2', 'W3', 'W4']
      dataMap = buildMap(labels, d => {
        const week = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24 * 7))
        return `W${Math.min(4, Math.max(1, 4 - week))}`
      })
    } else if (chartPeriod === '90d') {
      for (let i = 2; i >= 0; i--) {
        const d = new Date(now)
        d.setMonth(now.getMonth() - i)
        labels.push(d.toLocaleDateString('en-US', { month: 'short' }))
      }
      dataMap = buildMap(labels, d => d.toLocaleDateString('en-US', { month: 'short' }))
    } else if (chartPeriod === '1y') {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now)
        d.setMonth(now.getMonth() - i)
        labels.push(d.toLocaleDateString('en-US', { month: 'short' }))
      }
      dataMap = buildMap(labels, d => d.toLocaleDateString('en-US', { month: 'short' }))
    }

    return labels.map(label => ({
      label,
      gross: dataMap[label]?.gross || 0,
      net: dataMap[label]?.net || 0,
      comms: dataMap[label]?.comms || 0,
      salary: dataMap[label]?.salary || 0,
    }))
  }, [allSales, chartPeriod])

  if (loading) {
    return (
      <AppLayout title="Dashboard">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      title={`Hello, ${user?.email?.split('@')[0] || 'User'}`}
      rightAction={
        <Link to="/sales" className="text-xs sm:text-sm text-accent-primary font-medium whitespace-nowrap">+ Add Sale</Link>
      }
    >
      <div className="space-y-5 sm:space-y-6 md:space-y-8 animate-fade-in">
        {/* Chart */}
        <section>
          <SalesChart data={chartData} period={chartPeriod} onPeriodChange={setChartPeriod} />
        </section>

        {/* Period Stats Grid */}
        {[
          {
            title: 'Today',
            cols: 2,
            items: [
              { label: 'Gross', value: formatCurrency(stats?.today.gross || 0), icon: <DollarSign className="w-4 h-4" /> },
              { label: 'Salary', value: formatCurrency(stats?.today.salary || 0), icon: <TrendingUp className="w-4 h-4" />, accent: true },
            ]
          },
          {
            title: 'This Week',
            cols: 4,
            items: [
              { label: 'Gross', value: formatCurrency(stats?.weekly.gross || 0) },
              { label: 'Net', value: formatCurrency(stats?.weekly.net || 0) },
              { label: 'Comms', value: `-${formatCurrency(stats?.weekly.comms || 0)}`, danger: true },
              { label: 'Salary', value: formatCurrency(stats?.weekly.salary || 0), accent: true },
            ]
          },
          {
            title: 'This Month',
            cols: 2,
            items: [
              { label: 'Gross Total', value: formatCurrency(stats?.monthly.gross || 0), icon: <DollarSign className="w-4 h-4" /> },
              { label: 'Net Salary', value: formatCurrency(stats?.monthly.salary || 0), icon: <Calculator className="w-4 h-4" />, accent: true },
              { label: 'Net (80%)', value: formatCurrency(stats?.monthly.net || 0), icon: <Clock className="w-4 h-4" /> },
              { label: 'Comms', value: formatCurrency(stats?.monthly.comms || 0), icon: <TrendingUp className="w-4 h-4" /> },
            ]
          },
        ].map(({ title, cols, items }: { title: string; cols: number; items: { label: string; value: string; icon?: React.ReactNode; accent?: boolean; danger?: boolean }[] }) => (
          <section key={title}>
            <h2 className="text-[10px] sm:text-xs font-medium text-white/30 uppercase tracking-widest mb-2 sm:mb-3">{title}</h2>
            <div className={`grid grid-cols-${cols} gap-2 sm:gap-3`}
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
              {items.map(({ label, value, icon, accent, danger }) => (
                <div
                  key={label}
                  className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-white/40 mb-0.5 sm:mb-1 truncate">{label}</p>
                    <p className={`text-sm sm:text-base md:text-lg lg:text-xl font-bold tabular-nums truncate ${accent ? 'text-success' : danger ? 'text-danger' : 'text-white'}`}>
                      {value}
                    </p>
                  </div>
                  {icon && (
                    <div className={`p-1.5 sm:p-2 rounded-lg shrink-0 ${accent ? 'bg-success/10 text-success' : 'bg-dark-elevated text-white/40'}`}>
                      {icon}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* This Year - Full Width Card */}
        <section>
          <h2 className="text-[10px] sm:text-xs font-medium text-white/30 uppercase tracking-widest mb-2 sm:mb-3">This Year</h2>
          <div className="bg-gradient-to-br from-accent-primary/15 via-accent-primary/10 to-accent-secondary/5 border border-accent-primary/20 rounded-2xl sm:rounded-3xl overflow-hidden">
            {/* Hero Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:p-6 md:p-8 border-b border-white/5">
              <div className="text-center sm:text-left">
                <p className="text-xs sm:text-sm text-white/40 mb-1">Total Salary</p>
                <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tabular-nums tracking-tight">
                  {formatCurrency(stats?.yearly.salary || 0)}
                </p>
              </div>
              <div className="flex gap-2 sm:gap-3">
                {[
                  { label: 'Gross', value: formatCurrency(stats?.yearly.gross || 0), color: 'text-white' },
                  { label: 'Net', value: formatCurrency(stats?.yearly.net || 0), color: 'text-success' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-white/5 rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-center">
                    <p className="text-[10px] sm:text-xs text-white/40 mb-0.5">{label}</p>
                    <p className={`text-sm sm:text-base md:text-lg font-bold ${color} tabular-nums`}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sub Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-white/5">
              {[
                { label: 'Comms', value: `-${formatCurrency(stats?.yearly.comms || 0)}`, color: 'text-danger' },
                { label: 'Hourly', value: `+${formatCurrency(stats?.yearly.hourlyEarnings || 0)}`, color: 'text-success' },
                { label: 'Gross', value: formatCurrency(stats?.yearly.gross || 0), color: 'text-white/70' },
                { label: 'Net 80%', value: formatCurrency(stats?.yearly.net || 0), color: 'text-white/70' },
              ].map(({ label, value, color }) => (
                <div key={label} className="p-3 sm:p-4 text-center">
                  <p className="text-[10px] sm:text-xs text-white/40 mb-0.5 sm:mb-1">{label}</p>
                  <p className={`text-sm sm:text-base md:text-lg font-bold ${color} tabular-nums`}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Sales */}
        {recentSales.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h2 className="text-[10px] sm:text-xs font-medium text-white/30 uppercase tracking-widest">Recent Sales</h2>
              <Link to="/sales" className="text-xs sm:text-sm text-accent-primary hover:underline">View All</Link>
            </div>
            <div className="bg-dark-card border border-dark-border rounded-2xl sm:rounded-3xl overflow-hidden divide-y divide-white/5">
              {recentSales.map(sale => {
                const { salary } = computeSaleValues(sale)
                return (
                  <div key={sale.id} className="flex items-center justify-between p-3 sm:p-4 md:p-5 hover:bg-dark-elevated/50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base md:text-lg font-semibold text-white tabular-nums truncate">
                        {formatCurrency(Number(sale.gross_sales))}
                      </p>
                      <p className="text-[10px] sm:text-xs text-white/40 mt-0.5">
                        {new Date(sale.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="text-[10px] sm:text-xs text-white/40">Salary</p>
                      <p className="text-sm sm:text-base font-semibold text-success tabular-nums">
                        +{formatCurrency(salary)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </AppLayout>
  )
}