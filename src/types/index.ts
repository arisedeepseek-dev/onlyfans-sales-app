export type Role = 'user' | 'admin'
export type Theme = 'dark' | 'light'

export interface User {
  id: string
  email: string
  role: Role
  app_name?: string
  app_title?: string
  theme: Theme
  created_at: string
  updated_at: string
}

export interface Sale {
  id: string
  user_id: string
  gross_sales: number       // original sale amount (e.g., $500 PPV)
  comms_percent: number    // creator's commission percentage (e.g., 10 = 10%)
  hourly_rate: number      // pay per hour
  hours_worked: number     // hours worked
  created_at: string
  updated_at: string
  deleted_at?: string | null

  // Computed getters (calculated on the fly, not stored)
  net_sales?: number       // gross * 0.80 (after OF 20% platform fee)
  comms?: number           // net * comms_percent (creator's cut)
  salary?: number          // comms + (hourly_rate * hours_worked)
}

export interface PeriodStats {
  gross: number      // total gross sales
  net: number        // gross * 0.80 (after OF 20% platform fee)
  comms: number      // sum of (net * comms_percent) for all sales
  hourlyEarnings: number  // sum of (hourly_rate * hours_worked)
  salary: number     // comms + hourlyEarnings
}

export interface DashboardStats {
  today: PeriodStats
  weekly: PeriodStats
  biweekly: PeriodStats
  monthly: PeriodStats
  yearly: PeriodStats
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  updateUser: (data: Partial<User>) => Promise<void>
  isAdmin: boolean
}