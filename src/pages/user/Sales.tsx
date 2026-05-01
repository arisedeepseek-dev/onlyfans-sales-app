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
import { Plus } from 'lucide-react'

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
    } catch (error) {
      console.error('Error fetching sales:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddSale(data: SaleFormData) {
    if (!user) return
    setSaving(true)

    try {
      const { error } = await supabase.from('sales').insert({
        user_id: user.id,
        gross_sales: data.gross_sales,
        comms_percent: data.comms_percent ?? 10,
        hourly_rate: data.hourly_rate || 0,
        hours_worked: data.hours_worked || 0,
      })

      if (error) throw error
      setShowAddModal(false)
      fetchSales()
    } catch (error) {
      console.error('Error adding sale:', error)
    } finally {
      setSaving(false)
    }
  }

  async function handleEditSale(data: SaleFormData) {
    if (!selectedSale) return
    setSaving(true)

    try {
      const { error } = await supabase
        .from('sales')
        .update({
          gross_sales: data.gross_sales,
          comms_percent: data.comms_percent ?? 10,
          hourly_rate: data.hourly_rate || 0,
          hours_worked: data.hours_worked || 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedSale.id)

      if (error) throw error
      setShowEditModal(false)
      setSelectedSale(null)
      fetchSales()
    } catch (error) {
      console.error('Error updating sale:', error)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteSale() {
    if (!selectedSale) return
    setDeleting(true)

    try {
      const { error } = await supabase
        .from('sales')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', selectedSale.id)

      if (error) throw error
      setShowDeleteModal(false)
      setSelectedSale(null)
      fetchSales()
    } catch (error) {
      console.error('Error deleting sale:', error)
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
        {/* Summary Header */}
        <div className="bg-dark-card border border-dark-border rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <p className="text-xs sm:text-sm md:text-base text-[#8B8B9E]">Total Entries</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{sales.length}</p>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              icon={<Plus className="w-4 h-4" />}
              size="sm"
              className="sm:self-auto self-end"
            >
              Add Sale
            </Button>
          </div>
        </div>

        {/* Sales List */}
        <SaleList
          sales={sales}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
        />
      </div>

      {/* Add Sale Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Sale"
      >
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