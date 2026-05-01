import { useLocation, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { LayoutDashboard, DollarSign, User, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

type NavItem = {
  label: string
  icon: React.ReactNode
  path: string
  adminOnly?: boolean
}

const userNavItems: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6" />, path: '/dashboard' },
  { label: 'Sales', icon: <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />, path: '/sales' },
  { label: 'Profile', icon: <User className="w-5 h-5 sm:w-6 sm:h-6" />, path: '/profile' },
]

const adminNavItems: NavItem[] = [
  { label: 'Overview', icon: <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6" />, path: '/admin' },
  { label: 'Settings', icon: <Settings className="w-5 h-5 sm:w-6 sm:h-6" />, path: '/admin/settings' },
]

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAdmin, signOut } = useAuth()

  const navItems = isAdmin ? adminNavItems : userNavItems

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark-card border-t border-dark-border pb-safe z-50">
      <div className="flex items-center justify-around h-16 sm:h-18 max-w-md mx-auto px-2 sm:px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path === '/dashboard' && location.pathname === '/') ||
            (item.path.startsWith('/admin') && location.pathname.startsWith('/admin'))


          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={clsx(
                'flex flex-col items-center justify-center gap-1 px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 min-w-[60px] sm:min-w-[72px]',
                isActive
                  ? 'text-accent-primary'
                  : 'text-[#8B8B9E] hover:text-white sm:hover:bg-dark-elevated'
              )}
            >
              {item.icon}
              <span className="text-xs sm:text-sm font-medium">{item.label}</span>
            </button>
          )
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center gap-1 px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 text-[#8B8B9E] hover:text-danger hover:bg-danger/10 min-w-[60px] sm:min-w-[72px]"
        >
          <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-xs sm:text-sm font-medium">Logout</span>
        </button>
      </div>
    </nav>
  )
}
