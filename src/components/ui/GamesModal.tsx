import { Modal } from './Modal'
import { motion } from 'framer-motion'

interface Props {
  onClose: () => void
  onPlay: (reward: number) => void
}

export function GamesModal({ onClose, onPlay }: Props) {
  const games = [
    { id: 'ball', name: 'Catch the Ball', icon: '⚽', reward: 10 },
    { id: 'hide', name: 'Hide & Seek', icon: '🫣', reward: 15 },
    { id: 'dance', name: 'Dance Party', icon: '💃', reward: 20 },
  ]

  return (
    <Modal title="Mini Games" onClose={onClose}>
      <div className="flex flex-col gap-3">
        {games.map((game) => (
          <motion.button
            key={game.id}
            whileTap={{ scale: 0.97 }}
            onClick={() => onPlay(game.reward)}
            className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-left"
          >
            <span className="text-3xl">{game.icon}</span>
            <div className="flex-1">
              <p className="font-bold text-white text-sm">{game.name}</p>
              <p className="text-[10px] text-white/40">Earn +{game.reward} happiness</p>
            </div>
            <span className="text-hagumi-pink text-xl">▶</span>
          </motion.button>
        ))}
      </div>
    </Modal>
  )
}
