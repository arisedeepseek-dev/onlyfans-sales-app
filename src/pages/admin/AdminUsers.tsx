import { useEffect, useState } from 'react'
import { AppLayout } from '../../components/layout/AppLayout'
import { ConfirmModal } from '../../components/ui/Modal'
import { User as UserType } from '../../types'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { Trash2, UserCircle, Shield } from 'lucide-react'
import clsx from 'clsx'

export function AdminUsers() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [deleting, setDeleting] = useState(false)

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
      // Delete user's sales first (cascade)
      await supabase.from('sales').delete().eq('user_id', selectedUser.id)

      // Then delete user
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
        <div className="bg-dark-card border border-dark-border rounded-2xl sm:rounded-3xl p-4 sm:p-5">
          <p className="text-sm sm:text-base text-[#8B8B9E]">
            Total Users: <span className="text-white font-medium">{users.length}</span>
          </p>
        </div>

        {/* Users List - responsive table-like layout */}
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <div className="space-y-3 sm:space-y-4 min-w-[320px]">
            {users.map(user => {
              const isCurrentUser = user.id === currentUser?.id

              return (
                <div
                  key={user.id}
                  className={clsx(
                    'bg-dark-card border border-dark-border rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 transition-all duration-200',
                    isCurrentUser && 'border-accent-primary/30'
                  )}
                >
                  <div className="flex items-start justify-between">
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
                      <div>
                        <p className="text-white font-medium text-sm sm:text-base">{user.email}</p>
                        <p className="text-xs sm:text-sm text-[#8B8B9E]">
                          Joined {new Date(user.created_at).toLocaleDateString()}
                        </p>
                        <span className={clsx(
                          'inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium',
                          user.role === 'admin'
                            ? 'bg-accent-primary/20 text-accent-primary'
                            : 'bg-dark-elevated text-[#8B8B9E]'
                        )}>
                          {user.role}
                        </span>
                      </div>
                    </div>

                    {!isCurrentUser && (
                      <button
                        onClick={() => openDeleteModal(user)}
                        className="p-2 sm:p-3 rounded-xl text-[#8B8B9E] hover:text-danger hover:bg-danger/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    )}
                  </div>

                  {isCurrentUser && (
                    <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-accent-primary">You (current session)</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <UserCircle className="w-16 h-16 text-[#8B8B9E] mx-auto mb-4" />
            <p className="text-[#8B8B9E]">No users found</p>
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
