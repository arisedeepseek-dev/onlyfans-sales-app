import { useEffect, useState } from 'react'
import { AppLayout } from '../../components/layout/AppLayout'
import { StatCard } from '../../components/ui/StatCard'
import { Sale, DashboardStats } from '../../types'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatCurrency, calculatePeriodStats, getDateRange } from '../../lib/calculations'
import { TrendingUp, DollarSign, Clock, Calculator } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentSales, setRecentSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [user?.id])

  async function fetchData() {
    if (!user) return

    try {
      // Fetch all sales for this user
      const { data: sales, error } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Calculate stats for each period
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
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

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
        <Link
          to="/sales"
          className="text-sm text-accent-primary font-medium"
        >
          + Add Sale
        </Link>
      }
    >
      <div className="space-y-6 animate-fade-in">
        {/* Today's Stats */}
        <section>
          <h2 className="text-sm font-medium text-[#8B8B9E] mb-3">Today</h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Gross Sales"
              value={formatCurrency(stats?.today.gross || 0)}
              icon={<DollarSign className="w-4 h-4" />}
            />
            <StatCard
              label="Net Salary"
              value={formatCurrency(
                (stats?.today.gross || 0) -
                (stats?.today.comms || 0) +
                (stats?.today.hourlyEarnings || 0)
              )}
              icon={<TrendingUp className="w-4 h-4" />}
              accent
            />
          </div>
        </section>

        {/* Weekly Stats */}
        <section>
          <h2 className="text-sm font-medium text-[#8B8B9E] mb-3">This Week</h2>
          <div className="bg-dark-card border border-dark-border rounded-2xl p-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-[#8B8B9E] mb-1">Gross</p>
                <p className="text-lg font-bold text-white tabular-nums">
                  {formatCurrency(stats?.weekly.gross || 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#8B8B9E] mb-1">Comms</p>
                <p className="text-lg font-bold text-danger tabular-nums">
                  -{formatCurrency(stats?.weekly.comms || 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#8B8B9E] mb-1">Salary</p>
                <p className="text-lg font-bold text-success tabular-nums">
                  {formatCurrency(
                    (stats?.weekly.gross || 0) -
                    (stats?.weekly.comms || 0) +
                    (stats?.weekly.hourlyEarnings || 0)
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Monthly Stats */}
        <section>
          <h2 className="text-sm font-medium text-[#8B8B9E] mb-3">This Month</h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Gross Total"
              value={formatCurrency(stats?.monthly.gross || 0)}
              icon={<DollarSign className="w-4 h-4" />}
            />
            <StatCard
              label="Net Salary"
              value={formatCurrency(
                (stats?.monthly.gross || 0) -
                (stats?.monthly.comms || 0) +
                (stats?.monthly.hourlyEarnings || 0)
              )}
              icon={<Calculator className="w-4 h-4" />}
              accent
            />
            <StatCard
              label="Commission Paid"
              value={formatCurrency(stats?.monthly.comms || 0)}
              icon={<Clock className="w-4 h-4" />}
            />
            <StatCard
              label="Hourly Earnings"
              value={formatCurrency(stats?.monthly.hourlyEarnings || 0)}
              icon={<TrendingUp className="w-4 h-4" />}
            />
          </div>
        </section>

        {/* Yearly Overview */}
        <section>
          <h2 className="text-sm font-medium text-[#8B8B9E] mb-3">This Year</h2>
          <div className="bg-gradient-to-br from-accent-primary/20 to-accent-secondary/10 border border-accent-primary/30 rounded-2xl p-5">
            <div className="text-center mb-4">
              <p className="text-sm text-[#8B8B9E] mb-1">Total Earnings</p>
              <p className="text-4xl font-bold text-white tabular-nums">
                {formatCurrency(
                  (stats?.yearly.gross || 0) -
                  (stats?.yearly.comms || 0) +
                  (stats?.yearly.hourlyEarnings || 0)
                )}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-dark-bg/50 rounded-xl p-3">
                <p className="text-xs text-[#8B8B9E]">Gross</p>
                <p className="text-sm font-semibold text-white tabular-nums">
                  {formatCurrency(stats?.yearly.gross || 0)}
                </p>
              </div>
              <div className="bg-dark-bg/50 rounded-xl p-3">
                <p className="text-xs text-[#8B8B9E]">Comms</p>
                <p className="text-sm font-semibold text-danger tabular-nums">
                  -{formatCurrency(stats?.yearly.comms || 0)}
                </p>
              </div>
              <div className="bg-dark-bg/50 rounded-xl p-3">
                <p className="text-xs text-[#8B8B9E]">Hourly</p>
                <p className="text-sm font-semibold text-success tabular-nums">
                  +{formatCurrency(stats?.yearly.hourlyEarnings || 0)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Sales */}
        {recentSales.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-[#8B8B9E]">Recent Sales</h2>
              <Link to="/sales" className="text-xs text-accent-primary">View All</Link>
            </div>
            <div className="space-y-2">
              {recentSales.map(sale => (
                <div key={sale.id} className="bg-dark-card border border-dark-border rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white tabular-nums">
                      {formatCurrency(Number(sale.gross_sales))}
                    </p>
                    <p className="text-xs text-[#8B8B9E]">
                      {new Date(sale.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-success tabular-nums">
                    {formatCurrency(
                      Number(sale.gross_sales) - Number(sale.comms_base) + (Number(sale.hourly_rate) * Number(sale.hours_worked))
                    )}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </AppLayout>
  )
}