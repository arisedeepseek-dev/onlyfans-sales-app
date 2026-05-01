import { Sale, PeriodStats } from '../types'

// OF platform fee is 20%, so net = gross * 0.80
export function calculateNet(gross: number): number {
  return gross * 0.80
}

// Creator's commission from net (e.g., commsPercent=10 means 10% of net)
export function calculateCommission(net: number, commsPercent: number): number {
  return net * (commsPercent / 100)
}

// Total salary: creator's commission + hourly earnings
export function calculateSalary(comms: number, hourlyRate: number, hours: number): number {
  return comms + (hourlyRate * hours)
}

// Compute all derived values for a single sale
export function computeSaleValues(sale: Sale): { net: number; comms: number; salary: number } {
  const net = calculateNet(Number(sale.gross_sales))
  const comms = calculateCommission(net, Number(sale.comms_percent))
  const salary = calculateSalary(comms, Number(sale.hourly_rate), Number(sale.hours_worked))
  return { net, comms, salary }
}

export function calculatePeriodStats(
  sales: Sale[],
  startDate: Date,
  endDate: Date
): PeriodStats {
  const periodSales = sales.filter(s => {
    const created = new Date(s.created_at)
    return created >= startDate && created <= endDate && !s.deleted_at
  })

  let gross = 0
  let net = 0
  let comms = 0
  let hourlyEarnings = 0

  periodSales.forEach(sale => {
    const grossAmount = Number(sale.gross_sales)
    const hourlyRate = Number(sale.hourly_rate)
    const hoursWorked = Number(sale.hours_worked)

    const netAmount = calculateNet(grossAmount)
    const commsAmount = calculateCommission(netAmount, Number(sale.comms_percent))

    gross += grossAmount
    net += netAmount
    comms += commsAmount
    hourlyEarnings += hourlyRate * hoursWorked
  })

  return {
    gross,
    net,
    comms,
    hourlyEarnings,
    salary: comms + hourlyEarnings,
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