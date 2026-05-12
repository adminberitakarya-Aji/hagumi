import { motion } from 'framer-motion'
import type { PetStats } from '@/types'

interface Props {
  stats: PetStats
}

import { CurrencyDisplay } from './CurrencyDisplay'

export function StatusBar({ stats }: Props) {
  const bars = [
    { label: '🍖 Hunger', value: stats.hunger, color: 'bg-orange-400' },
    { label: '😊 Mood',   value: stats.mood,   color: 'bg-hagumi-pink' },
    { label: '⚡ Energy', value: stats.energy, color: 'bg-yellow-400' },
  ]

  return (
    <div className="absolute top-6 left-6 right-6 z-20 flex justify-between items-start">
      <div className="flex flex-col gap-3 w-48">
        {bars.map((bar) => (
          <div key={bar.label} className="w-full">
            <div className="flex justify-between text-[10px] font-bold text-white/70 mb-1 uppercase tracking-tighter">
              <span>{bar.label}</span>
              <span>{Math.round(bar.value)}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${bar.value}%` }}
                className={`h-full ${bar.color} rounded-full`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 items-end">
        <CurrencyDisplay value={200} />
        <CurrencyDisplay value={50} icon="💎" color="text-cyan-400" />
      </div>
    </div>
  )
}
