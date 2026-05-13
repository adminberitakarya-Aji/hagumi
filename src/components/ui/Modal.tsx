import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface Props {
  title: string
  onClose: () => void
  children: ReactNode
}

export function Modal({ title, onClose, children }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md bg-hagumi-night border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
      >
        <header className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
          <h3 className="font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white">✕</button>
        </header>
        <div className="p-6">
          {children}
        </div>
      </motion.div>
    </div>
  )
}
