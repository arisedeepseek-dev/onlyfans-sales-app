import { useEffect, useState } from 'react'
import { AppLayout } from '../../components/layout/AppLayout'
import { ConfirmModal } from '../../components/ui/Modal'
import { User as UserType } from '../../types'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { Trash2, UserCircle, Shield, Search } from 'lucide-react'
import clsx from 'clsx'

export function AdminUsers() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteUser() {
    if (!selectedUser) return
    setDeleting(true)

    try {
      await supabase.from('sales').delete().eq('user_id', selectedUser.id)
      const { error } = await supabase.from('users').delete().eq('id', selectedUser.id)
      if (error) throw error
      setShowDeleteModal(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
    } finally {
      setDeleting(false)
    }
  }

  function openDeleteModal(user: UserType) {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <AppLayout title="Manage Users">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Manage Users">
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        {/* Search + Count */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-dark-card border border-dark-border rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent-primary transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-[#8B8B9E] whitespace-nowrap">
            <span>Total:</span>
            <span className="text-white font-medium">{users.length}</span>
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredUsers.map(user => {
            const isCurrentUser = user.id === currentUser?.id

            return (
              <div
                key={user.id}
                className={clsx(
                  'bg-dark-card border border-dark-border rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 transition-all duration-200',
                  isCurrentUser && 'border-accent-primary/30'
                )}
              >
                {/* Avatar + Info Row */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={clsx(
                    'w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0',
                    user.role === 'admin'
                      ? 'bg-accent-primary/20 text-accent-primary'
                      : 'bg-dark-elevated text-[#8B8B9E]'
                  )}>
                    {user.role === 'admin' ? (
                      <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
                    ) : (
                      <UserCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm sm:text-base truncate">{user.email}</p>
                    <p className="text-xs sm:text-sm text-[#8B8B9E] mt-0.5">
                      Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <span className={clsx(
                      'inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium',
                      user.role === 'admin'
                        ? 'bg-accent-primary/20 text-accent-primary'
                        : 'bg-dark-elevated text-[#8B8B9E]'
                    )}>
                      {user.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </div>
                </div>

                {/* Current user badge */}
                {isCurrentUser && (
                  <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-accent-primary">You (current session)</p>
                )}

                {/* Delete button */}
                {!isCurrentUser && (
                  <button
                    onClick={() => openDeleteModal(user)}
                    className="mt-3 sm:mt-4 w-full p-2.5 sm:p-3 rounded-xl text-[#8B8B9E] hover:text-danger hover:bg-danger/10 border border-dark-border hover:border-danger/30 transition-colors min-h-[44px] flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm">Delete User</span>
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-16">
            <UserCircle className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-[#8B8B9E] text-sm sm:text-base">
              {search ? 'No users match your search' : 'No users found'}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedUser(null)
        }}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete ${selectedUser?.email}? This will also delete all their sales data. This action cannot be undone.`}
        confirmText="Delete User"
        variant="danger"
        loading={deleting}
      />
    </AppLayout>
  )
}
