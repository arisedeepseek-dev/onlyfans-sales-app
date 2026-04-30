import { Sale, PeriodStats } from '../types'

export function calculateSalary(gross: number, comms: number, hourlyRate: number, hours: number): number {
  return gross - comms + (hourlyRate * hours)
}

export function calculatePeriodStats(sales: Sale[], startDate: Date, endDate: Date): PeriodStats {
  const periodSales = sales.filter(s => {
    const created = new Date(s.created_at)
    return created >= startDate && created <= endDate && !s.deleted_at
  })

  const gross = periodSales.reduce((sum, s) => sum + Number(s.gross_sales), 0)
  const comms = periodSales.reduce((sum, s) => sum + Number(s.comms_base), 0)
  const hourlyEarnings = periodSales.reduce((sum, s) => sum + (Number(s.hourly_rate) * Number(s.hours_worked)), 0)

  return {
    gross,
    net: gross, // In this app, net = gross (user inputs what they received)
    comms,
    hourlyEarnings,
    salary: calculateSalary(gross, comms, 0, 0) // Base salary without hourly
  }
}

export function getDateRange(period: 'today' | 'weekly' | 'biweekly' | 'monthly' | 'yearly'): { start: Date; end: Date } {
  const now = new Date()
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)

  switch (period) {
    case 'today': {
      const start = new Date(now)
      start.setHours(0, 0, 0, 0)
      return { start, end }
    }
    case 'weekly': {
      const start = new Date(now)
      start.setDate(now.getDate() - now.getDay())
      start.setHours(0, 0, 0, 0)
      return { start, end }
    }
    case 'biweekly': {
      const start = new Date(now)
      start.setDate(now.getDate() - now.getDay() - 14)
      start.setHours(0, 0, 0, 0)
      return { start, end }
    }
    case 'monthly': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      start.setHours(0, 0, 0, 0)
      return { start, end }
    }
    case 'yearly': {
      const start = new Date(now.getFullYear(), 0, 1)
      start.setHours(0, 0, 0, 0)
      return { start, end }
    }
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num)
}