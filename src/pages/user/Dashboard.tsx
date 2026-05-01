import { useEffect, useState, useMemo } from 'react'
import { AppLayout } from '../../components/layout/AppLayout'
import { StatCard } from '../../components/ui/StatCard'
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
      labels = []
      for (let i = 23; i >= 0; i--) {
        const d = new Date(now)
        d.setHours(now.getHours() - i, 0, 0, 0)
        labels.push(d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))
      }
      dataMap = buildMap(labels, d => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))
    } else if (chartPeriod === '7d') {
      labels = []
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
      labels = []
      for (let i = 2; i >= 0; i--) {
        const d = new Date(now)
        d.setMonth(now.getMonth() - i)
        labels.push(d.toLocaleDateString('en-US', { month: 'short' }))
      }
      dataMap = buildMap(labels, d => d.toLocaleDateString('en-US', { month: 'short' }))
    } else if (chartPeriod === '1y') {
      labels = []
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
        <Link to="/sales" className="text-sm sm:text-base text-accent-primary font-medium">+ Add Sale</Link>
      }
    >
      <div className="space-y-6 sm:space-y-8 animate-fade-in">
        <section>
          <SalesChart data={chartData} period={chartPeriod} onPeriodChange={setChartPeriod} />
        </section>

        {/* Today's Stats */}
        <section>
          <h2 className="text-xs sm:text-sm md:text-base font-medium text-[#8B8B9E] mb-3 sm:mb-4">Today</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            <StatCard
              label="Gross Sales"
              value={formatCurrency(stats?.today.gross || 0)}
              icon={<DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />}
            />
            <StatCard
              label="Total Salary"
              value={formatCurrency(stats?.today.salary || 0)}
              icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />}
              accent
            />
          </div>
        </section>

        {/* Weekly Stats */}
        <section>
          <h2 className="text-xs sm:text-sm md:text-base font-medium text-[#8B8B9E] mb-3 sm:mb-4">This Week</h2>
          <div className="bg-dark-card border border-dark-border rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6">
            <div className="grid grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              <div>
                <p className="text-xs sm:text-sm text-[#8B8B9E] mb-1">Gross</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-white tabular-nums">
                  {formatCurrency(stats?.weekly.gross || 0)}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-[#8B8B9E] mb-1">Net (80%)</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-white tabular-nums">
                  {formatCurrency(stats?.weekly.net || 0)}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-[#8B8B9E] mb-1">Comms</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-danger tabular-nums">
                  -{formatCurrency(stats?.weekly.comms || 0)}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-[#8B8B9E] mb-1">Salary</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-success tabular-nums">
                  {formatCurrency(stats?.weekly.salary || 0)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Monthly Stats */}
        <section>
          <h2 className="text-xs sm:text-sm md:text-base font-medium text-[#8B8B9E] mb-3 sm:mb-4">This Month</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            <StatCard label="Gross Total" value={formatCurrency(stats?.monthly.gross || 0)} icon={<DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />} />
            <StatCard label="Net Salary" value={formatCurrency(stats?.monthly.salary || 0)} icon={<Calculator className="w-4 h-4 sm:w-5 sm:h-5" />} accent />
            <StatCard label="Net (after OF 20%)" value={formatCurrency(stats?.monthly.net || 0)} icon={<Clock className="w-4 h-4 sm:w-5 sm:h-5" />} />
            <StatCard label="Comms Cut" value={formatCurrency(stats?.monthly.comms || 0)} icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />} />
          </div>
        </section>

        {/* Yearly Overview */}
        <section>
          <h2 className="text-xs sm:text-sm md:text-base font-medium text-[#8B8B9E] mb-3 sm:mb-4">This Year</h2>
          <div className="bg-gradient-to-br from-accent-primary/20 to-accent-secondary/10 border border-accent-primary/30 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8">
            <div className="text-center mb-4 sm:mb-6">
              <p className="text-sm sm:text-base text-[#8B8B9E] mb-2">Total Salary</p>
              <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tabular-nums">
                {formatCurrency(stats?.yearly.salary || 0)}
              </p>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              <div className="bg-dark-bg/50 rounded-xl p-2 sm:p-3 md:p-4">
                <p className="text-xs sm:text-sm text-[#8B8B9E]">Gross</p>
                <p className="text-sm sm:text-base md:text-lg font-semibold text-white tabular-nums">{formatCurrency(stats?.yearly.gross || 0)}</p>
              </div>
              <div className="bg-dark-bg/50 rounded-xl p-2 sm:p-3 md:p-4">
                <p className="text-xs sm:text-sm text-[#8B8B9E]">Net (80%)</p>
                <p className="text-sm sm:text-base md:text-lg font-semibold text-white tabular-nums">{formatCurrency(stats?.yearly.net || 0)}</p>
              </div>
              <div className="bg-dark-bg/50 rounded-xl p-2 sm:p-3 md:p-4">
                <p className="text-xs sm:text-sm text-[#8B8B9E]">Comms</p>
                <p className="text-sm sm:text-base md:text-lg font-semibold text-danger tabular-nums">-{formatCurrency(stats?.yearly.comms || 0)}</p>
              </div>
              <div className="bg-dark-bg/50 rounded-xl p-2 sm:p-3 md:p-4">
                <p className="text-xs sm:text-sm text-[#8B8B9E]">Hourly</p>
                <p className="text-sm sm:text-base md:text-lg font-semibold text-success tabular-nums">+{formatCurrency(stats?.yearly.hourlyEarnings || 0)}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Sales */}
        {recentSales.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-xs sm:text-sm md:text-base font-medium text-[#8B8B9E]">Recent Sales</h2>
              <Link to="/sales" className="text-xs sm:text-sm text-accent-primary hover:underline">View All</Link>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {recentSales.map(sale => {
                const { comms, salary } = computeSaleValues(sale)
                return (
                  <div key={sale.id} className="bg-dark-card border border-dark-border rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-dark-elevated transition-colors cursor-pointer">
                    <div>
                      <p className="text-sm sm:text-base md:text-lg font-medium text-white tabular-nums">{formatCurrency(Number(sale.gross_sales))}</p>
                      <p className="text-xs sm:text-sm text-[#8B8B9E]">{new Date(sale.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs sm:text-sm text-[#8B8B9E]">Comms: {formatCurrency(comms)}</p>
                      <p className="text-sm sm:text-base md:text-lg font-semibold text-success tabular-nums">+{formatCurrency(salary)}</p>
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