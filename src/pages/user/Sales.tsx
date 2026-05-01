import { useEffect, useState } from 'react'
import { AppLayout } from '../../components/layout/AppLayout'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { ConfirmModal } from '../../components/ui/Modal'
import { SaleList } from '../../components/sales/SaleList'
import { SaleForm } from '../../components/sales/SaleForm'
import { Sale } from '../../types'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { Plus, AlertCircle } from 'lucide-react'

interface SaleFormData {
  gross_sales: number
  comms_percent: number
  hourly_rate: number
  hours_worked: number
}

export function Sales() {
  const { user } = useAuth()
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSales()
  }, [user?.id])

  async function fetchSales() {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSales(data || [])
    } catch (err) {
      console.error('Error fetching sales:', err)
      setError('Failed to load sales')
    } finally {
      setLoading(false)
    }
  }

  async function handleAddSale(data: SaleFormData) {
    if (!user) return
    setSaving(true)
    setError(null)

    try {
      const payload = {
        user_id: user.id,
        gross_sales: Number(data.gross_sales),
        comms_percent: Number(data.comms_percent) || 10,
        hourly_rate: Number(data.hourly_rate) || 0,
        hours_worked: Number(data.hours_worked) || 0,
      }

      const { data: result, error: insertError } = await supabase
        .from('sales')
        .insert(payload)
        .select()
        .single()

      if (insertError) {
        console.error('Insert error:', insertError)
        setError(`Failed to add sale: ${insertError.message}`)
        return
      }

      setShowAddModal(false)
      setSales(prev => [result, ...prev])
    } catch (err: any) {
      console.error('Error adding sale:', err)
      setError(`Failed to add sale: ${err?.message || 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleEditSale(data: SaleFormData) {
    if (!selectedSale) return
    setSaving(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from('sales')
        .update({
          gross_sales: Number(data.gross_sales),
          comms_percent: Number(data.comms_percent) || 10,
          hourly_rate: Number(data.hourly_rate) || 0,
          hours_worked: Number(data.hours_worked) || 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedSale.id)

      if (updateError) {
        console.error('Update error:', updateError)
        setError(`Failed to update sale: ${updateError.message}`)
        return
      }

      setShowEditModal(false)
      setSelectedSale(null)
      fetchSales()
    } catch (err: any) {
      console.error('Error updating sale:', err)
      setError(`Failed to update sale: ${err?.message || 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteSale() {
    if (!selectedSale) return
    setDeleting(true)

    try {
      const { error: deleteError } = await supabase
        .from('sales')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', selectedSale.id)

      if (deleteError) throw deleteError
      setShowDeleteModal(false)
      setSelectedSale(null)
      fetchSales()
    } catch (err) {
      console.error('Error deleting sale:', err)
    } finally {
      setDeleting(false)
    }
  }

  function openEditModal(sale: Sale) {
    setSelectedSale(sale)
    setShowEditModal(true)
  }

  function openDeleteModal(sale: Sale) {
    setSelectedSale(sale)
    setShowDeleteModal(true)
  }

  function clearError() {
    setError(null)
  }

  if (loading) {
    return (
      <AppLayout title="Sales Tracker">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Sales Tracker">
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 p-3 sm:p-4 bg-danger/10 border border-danger/30 rounded-xl sm:rounded-2xl">
            <AlertCircle className="w-5 h-5 text-danger shrink-0" />
            <p className="text-sm sm:text-base text-danger flex-1">{error}</p>
            <button onClick={clearError} className="text-danger hover:text-white transition-colors">
              ×
            </button>
          </div>
        )}

        {/* Summary Header */}
        <div className="bg-dark-card border border-dark-border rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <p className="text-xs sm:text-sm md:text-base text-[#8B8B9E]">Total Entries</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{sales.length}</p>
            </div>
            <Button
              onClick={() => {
                setError(null)
                setShowAddModal(true)
              }}
              icon={<Plus className="w-4 h-4" />}
              size="sm"
              className="sm:self-auto self-end"
            >
              Add Sale
            </Button>
          </div>
        </div>

        {/* Sales List */}
        <SaleList sales={sales} onEdit={openEditModal} onDelete={openDeleteModal} />
      </div>

      {/* Add Sale Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Sale">
        <SaleForm
          onSubmit={handleAddSale}
          onCancel={() => setShowAddModal(false)}
          loading={saving}
        />
      </Modal>

      {/* Edit Sale Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedSale(null)
        }}
        title="Edit Sale"
      >
        <SaleForm
          onSubmit={handleEditSale}
          onCancel={() => {
            setShowEditModal(false)
            setSelectedSale(null)
          }}
          loading={saving}
          initialData={selectedSale || undefined}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedSale(null)
        }}
        onConfirm={handleDeleteSale}
        title="Delete Sale"
        message="Are you sure you want to delete this entry? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        loading={deleting}
      />
    </AppLayout>
  )
}