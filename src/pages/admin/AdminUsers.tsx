import { useEffect, useState } from 'react'
import { AppLayout } from '../../components/layout/AppLayout'
import { Modal, ConfirmModal } from '../../components/ui/Modal'
import { User as UserType } from '../../types'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { Trash2, UserCircle, Shield, Search, Edit3, Ban, CheckCircle, XCircle } from 'lucide-react'
import clsx from 'clsx'

export function AdminUsers() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showBanModal, setShowBanModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [editEmail, setEditEmail] = useState('')
  const [editRole, setEditRole] = useState<'user' | 'admin'>('user')
  const [newPassword, setNewPassword] = useState('')

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

  async function handleUpdateUser() {
    if (!selectedUser) return
    setActionLoading(true)

    try {
      const { error: emailError } = await supabase
        .from('users')
        .update({ email: editEmail, role: editRole, updated_at: new Date().toISOString() })
        .eq('id', selectedUser.id)

      if (emailError) throw emailError

      // If password provided, update auth
      if (newPassword.trim()) {
        const { error: authError } = await supabase.auth.admin.updateUserById(selectedUser.id, {
          password: newPassword,
        })
        if (authError) throw authError
      }

      setShowEditModal(false)
      setSelectedUser(null)
      setNewPassword('')
      fetchUsers()
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Failed to update user')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleBanUser() {
    if (!selectedUser) return
    setActionLoading(true)

    try {
      const { error } = await supabase
        .from('users')
        .update({ banned: !selectedUser.banned, updated_at: new Date().toISOString() })
        .eq('id', selectedUser.id)

      if (error) throw error
      setShowBanModal(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (error) {
      console.error('Error banning user:', error)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDeleteUser() {
    if (!selectedUser) return
    setActionLoading(true)

    try {
      // Delete user's sales first
      await supabase.from('sales').delete().eq('user_id', selectedUser.id)
      // Delete auth user
      await supabase.auth.admin.deleteUser(selectedUser.id)
      // Delete user profile
      const { error } = await supabase.from('users').delete().eq('id', selectedUser.id)
      if (error) throw error

      setShowDeleteModal(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Failed to delete user')
    } finally {
      setActionLoading(false)
    }
  }

  function openEditModal(user: UserType) {
    setSelectedUser(user)
    setEditEmail(user.email)
    setEditRole(user.role)
    setNewPassword('')
    setShowEditModal(true)
  }

  function openBanModal(user: UserType) {
    setSelectedUser(user)
    setShowBanModal(true)
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
              placeholder="Search by email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-dark-card border border-dark-border rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent-primary transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#8B8B9E] whitespace-nowrap bg-dark-card border border-dark-border rounded-xl px-4 py-2">
            <span>Total:</span>
            <span className="text-white font-semibold">{users.length}</span>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-dark-card border border-dark-border rounded-2xl sm:rounded-3xl overflow-hidden">
          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-5 gap-4 px-5 py-3 border-b border-white/5 text-[10px] text-white/30 uppercase tracking-widest">
            <div className="col-span-2">User</div>
            <div>Role</div>
            <div>Status</div>
            <div className="text-right">Actions</div>
          </div>

          {/* User Rows */}
          <div className="divide-y divide-white/5">
            {filteredUsers.map(user => {
              const isCurrentUser = user.id === currentUser?.id
              const isBanned = user.banned === true

              return (
                <div
                  key={user.id}
                  className={clsx(
                    'flex flex-col sm:grid sm:grid-cols-5 sm:items-center gap-3 sm:gap-4 p-4 sm:p-5 transition-all duration-200',
                    isCurrentUser && 'bg-accent-primary/5',
                    isBanned && 'opacity-60'
                  )}
                >
                  {/* User Info */}
                  <div className="flex items-start gap-3 sm:col-span-2">
                    <div className={clsx(
                      'w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0',
                      user.role === 'admin'
                        ? 'bg-accent-primary/20 text-accent-primary'
                        : 'bg-dark-elevated text-[#8B8B9E]'
                    )}>
                      {user.role === 'admin' ? (
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <UserCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium text-sm truncate">{user.email}</p>
                        {isCurrentUser && (
                          <span className="text-[10px] text-accent-primary shrink-0">You</span>
                        )}
                      </div>
                      <p className="text-[10px] sm:text-xs text-white/40 mt-0.5">
                        Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Role (desktop) */}
                  <div className="hidden sm:flex items-center">
                    <span className={clsx(
                      'px-2 py-1 rounded-full text-[10px] font-medium',
                      user.role === 'admin'
                        ? 'bg-accent-primary/20 text-accent-primary'
                        : 'bg-dark-elevated text-[#8B8B9E]'
                    )}>
                      {user.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </div>

                  {/* Status (desktop) */}
                  <div className="hidden sm:flex items-center">
                    {isBanned ? (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-danger/10 text-danger">
                        <XCircle className="w-3 h-3" />
                        Banned
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-success/10 text-success">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </span>
                    )}
                  </div>

                  {/* Actions (desktop) */}
                  <div className="hidden sm:flex items-center justify-end gap-2">
                    {!isCurrentUser && (
                      <>
                        <button
                          onClick={() => openBanModal(user)}
                          className={clsx(
                            'p-2 rounded-xl border transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center',
                            isBanned
                              ? 'border-success/30 text-success hover:bg-success/10'
                              : 'border-warning/30 text-warning hover:bg-warning/10'
                          )}
                          title={isBanned ? 'Unban user' : 'Ban user'}
                        >
                          {isBanned ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 rounded-xl border border-dark-border text-[#8B8B9E] hover:text-accent-primary hover:border-accent-primary/30 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(user)}
                          className="p-2 rounded-xl border border-dark-border text-[#8B8B9E] hover:text-danger hover:border-danger/30 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Mobile actions */}
                  <div className="sm:hidden flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(user)}
                      className="flex-1 p-2 rounded-xl border border-dark-border text-[#8B8B9E] hover:text-accent-primary transition-colors min-h-[40px] flex items-center justify-center gap-2 text-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => openBanModal(user)}
                      className={clsx(
                        'p-2 rounded-xl border min-h-[40px] flex items-center justify-center',
                        isBanned
                          ? 'border-success/30 text-success'
                          : 'border-warning/30 text-warning'
                      )}
                    >
                      {isBanned ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                    </button>
                    {!isCurrentUser && (
                      <button
                        onClick={() => openDeleteModal(user)}
                        className="p-2 rounded-xl border border-dark-border text-[#8B8B9E] hover:text-danger hover:border-danger/30 transition-colors min-h-[40px] flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Banned notice on mobile */}
                  {isBanned && (
                    <div className="sm:hidden flex items-center gap-2 text-xs text-danger">
                      <XCircle className="w-3.5 h-3.5" />
                      This user is banned
                    </div>
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
      </div>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedUser(null) }}
        title="Edit User"
      >
        <div className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">Email</label>
            <input
              type="email"
              value={editEmail}
              onChange={e => setEditEmail(e.target.value)}
              className="w-full h-11 px-4 bg-dark-elevated border border-dark-border rounded-xl text-sm text-white focus:outline-none focus:border-accent-primary transition-colors"
            />
          </div>

          {/* Role */}
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">Role</label>
            <select
              value={editRole}
              onChange={e => setEditRole(e.target.value as 'user' | 'admin')}
              className="w-full h-11 px-4 bg-dark-elevated border border-dark-border rounded-xl text-sm text-white focus:outline-none focus:border-accent-primary transition-colors appearance-none"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Password Reset */}
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Leave empty to keep current password"
              className="w-full h-11 px-4 bg-dark-elevated border border-dark-border rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent-primary transition-colors"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { setShowEditModal(false); setSelectedUser(null) }}
              className="flex-1 h-12 rounded-xl border border-dark-border text-[#8B8B9E] hover:bg-dark-elevated transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateUser}
              disabled={actionLoading}
              className="flex-1 h-12 rounded-xl bg-accent-primary text-white hover:brightness-110 transition-all disabled:opacity-50"
            >
              {actionLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Ban/Unban Modal */}
      <ConfirmModal
        isOpen={showBanModal}
        onClose={() => { setShowBanModal(false); setSelectedUser(null) }}
        onConfirm={handleBanUser}
        title={selectedUser?.banned ? 'Unban User' : 'Ban User'}
        message={
          selectedUser?.banned
            ? `Unban ${selectedUser?.email}? They will be able to log in again.`
            : `Ban ${selectedUser?.email}? They will not be able to log in until unbanned.`
        }
        confirmText={selectedUser?.banned ? 'Unban' : 'Ban User'}
        variant={selectedUser?.banned ? 'primary' : 'danger'}
        loading={actionLoading}
      />

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedUser(null) }}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete ${selectedUser?.email}? This will permanently delete their account and all sales data. This cannot be undone.`}
        confirmText="Delete User"
        variant="danger"
        loading={actionLoading}
      />
    </AppLayout>
  )
}
