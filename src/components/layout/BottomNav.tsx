import { motion } from 'framer-motion'

interface Props {
  onAction: (action: string) => void
}

export function BottomNav({ onAction }: Props) {
  const actions = [
    { id: 'feed', icon: '🍖', label: 'Feed' },
    { id: 'play', icon: '⚽', label: 'Play' },
    { id: 'chat', icon: '💬', label: 'Chat' },
    { id: 'rest', icon: '😴', label: 'Rest' },
  ]

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-3 px-4 py-3 glass rounded-3xl">
      {actions.map((action) => (
        <motion.button
          key={action.id}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onAction(action.id)}
          className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors"
        >
          <span className="text-2xl mb-1">{action.icon}</span>
          <span className="text-[10px] font-bold text-white/50">{action.label}</span>
        </motion.button>
      ))}
    </div>
  )
}
