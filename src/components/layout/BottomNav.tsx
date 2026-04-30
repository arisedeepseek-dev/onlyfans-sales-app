import { useLocation, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { LayoutDashboard, DollarSign, User, Settings, Users } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

type NavItem = {
  label: string
  icon: React.ReactNode
  path: string
  adminOnly?: boolean
}

const userNavItems: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard' },
  { label: 'Sales', icon: <DollarSign className="w-5 h-5" />, path: '/sales' },
  { label: 'Profile', icon: <User className="w-5 h-5" />, path: '/profile' },
]

const adminNavItems: NavItem[] = [
  { label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" />, path: '/admin' },
  { label: 'Users', icon: <Users className="w-5 h-5" />, path: '/admin/users' },
  { label: 'Settings', icon: <Settings className="w-5 h-5" />, path: '/admin/settings' },
]

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()

  const navItems = isAdmin ? adminNavItems : userNavItems

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark-card border-t border-dark-border pb-safe">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path === '/dashboard' && location.pathname === '/') ||
            (item.path.startsWith('/admin') && location.pathname.startsWith('/admin'))

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={clsx(
                'flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200',
                isActive
                  ? 'text-accent-primary'
                  : 'text-[#8B8B9E] hover:text-white'
              )}
            >
              {item.icon}
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}