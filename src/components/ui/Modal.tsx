import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      closeRef.current?.focus()
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
      }
      document.addEventListener('keydown', handleKey)
      document.body.style.overflow = 'hidden'
      return () => {
        document.removeEventListener('keydown', handleKey)
        document.body.style.overflow = ''
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="w-full max-w-md rounded-2xl bg-bg-elevated border border-surface/50 shadow-2xl animate-[modalIn_200ms_ease-out]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface/30">
          <h2 className="text-lg font-semibold text-text">{title}</h2>
          <button
            ref={closeRef}
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted hover:text-text hover:bg-surface transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  )
}
