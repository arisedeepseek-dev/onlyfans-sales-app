import { ReactNode, useEffect } from 'react'
import clsx from 'clsx'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div
        className={clsx(
          'relative w-full max-w-md sm:max-w-lg lg:max-w-xl bg-dark-card border border-dark-border',
          'rounded-t-2xl sm:rounded-2xl lg:rounded-3xl',
          'flex flex-col max-h-[85vh] sm:max-h-[90vh] mb-16 sm:mb-0',
          'animate-slide-up',
          'light:bg-light-card light:border-light-border'
        )}
      >
        {/* Header - sticky top */}
        {title && (
          <div className="flex items-center justify-between px-5 sm:px-6 lg:px-8 pt-5 sm:pt-6 pb-4 border-b border-dark-border shrink-0">
            <h2 className="text-lg sm:text-xl font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-dark-elevated text-[#8B8B9E] hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 lg:px-8 py-4 sm:py-6">
          {children}
        </div>
      </div>
    </div>
  )
}

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary'
  loading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-sm sm:text-base text-[#8B8B9E] mb-6">{message}</p>
      <div className="flex gap-3 sm:gap-4">
        <button
          onClick={onClose}
          disabled={loading}
          className="flex-1 h-12 sm:h-13 rounded-xl border border-dark-border text-[#8B8B9E] hover:bg-dark-elevated transition-colors min-h-[48px]"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={clsx(
            'flex-1 h-12 sm:h-13 rounded-xl font-medium transition-all min-h-[48px]',
            variant === 'danger'
              ? 'bg-danger text-white hover:brightness-110'
              : 'bg-accent-primary text-white hover:brightness-110'
          )}
        >
          {loading ? 'Loading...' : confirmText}
        </button>
      </div>
    </Modal>
  )
}
