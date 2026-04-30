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
  gross_sales: number
  hourly_rate: number
  comms_base: number
  hours_worked: number
  net_sales: number
  salary: number
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface PeriodStats {
  gross: number
  net: number
  comms: number
  hourlyEarnings: number
  salary: number
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