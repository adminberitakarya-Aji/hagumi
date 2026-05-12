import { motion } from 'framer-motion'
import type { Pet } from '@/types'

interface Props {
  pet: Pet
  onTap?: () => void
}

export function PetCharacter({ pet, onTap }: Props) {
  return (
    <motion.div 
      onClick={onTap}
      whileTap={{ scale: 0.95 }}
      className="relative cursor-pointer"
    >
      <svg width="200" height="200" viewBox="0 0 200 200">
        <defs>
          <radialGradient id="pet-gradient" cx="30%" cy="30%">
            <stop offset="0%" stopColor="white" stopOpacity="0.4" />
            <stop offset="100%" stopColor={pet.genetics.color} />
          </radialGradient>
        </defs>

        {/* Body */}
        <motion.ellipse 
          cx="100" cy="110" rx="60" ry="70" 
          fill="url(#pet-gradient)"
          animate={{
            scaleY: [1, 1.05, 1],
            y: [0, -5, 0]
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut"
          }}
        />

        {/* Eyes */}
        <circle cx="80" cy="95" r="5" fill="#2c3e50" />
        <circle cx="120" cy="95" r="5" fill="#2c3e50" />

        {/* Blush */}
        <circle cx="70" cy="105" r="6" fill="#ff6b9d" opacity="0.3" />
        <circle cx="130" cy="105" r="6" fill="#ff6b9d" opacity="0.3" />

        {/* Mouth */}
        <path d="M 90 115 Q 100 125 110 115" stroke="#2c3e50" strokeWidth="2" fill="none" />
      </svg>
      
      {/* Name tag */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 glass px-4 py-1 rounded-full whitespace-nowrap">
        <span className="text-xs font-bold text-white">{pet.name}</span>
      </div>
    </motion.div>
  )
}
