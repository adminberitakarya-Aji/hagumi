import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/designTokens'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
  showCloseButton?: boolean
  closeOnOverlay?: boolean
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
  showCloseButton = true,
  closeOnOverlay = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Trap focus inside modal
  useEffect(() => {
    if (!isOpen) return
    const previouslyFocused = document.activeElement as HTMLElement

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    // Focus first focusable element
    setTimeout(() => {
      const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      firstFocusable?.focus()
    }, 100)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus()
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeOnOverlay ? onClose : undefined}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-label={title || 'Dialog'}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'relative w-full max-w-md glass rounded-2xl p-6 shadow-2xl',
              'max-h-[85vh] overflow-y-auto no-scrollbar',
              className
            )}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">{title}</h2>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-white/50 hover:text-white transition-all"
                    aria-label="Close modal"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}