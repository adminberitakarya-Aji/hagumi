import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { EGG_TYPES } from '@/types/data'
import { SceneBackground } from '@/components/layout/SceneBackground'

export default function EggSelectPage() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<string | null>(null)

  const handleSelect = (id: string) => {
    setSelected(id)
    sessionStorage.setItem('selected_egg_id', id)
  }

  return (
    <div className="relative w-full h-full flex flex-col p-6 overflow-y-auto no-scrollbar">
      <SceneBackground />
      
      <div className="z-20 max-w-lg mx-auto w-full">
        <header className="mb-8 text-center">
          <h2 className="text-3xl font-black text-white mb-2">Choose Your Egg</h2>
          <p className="text-white/60 text-sm">Every egg holds a unique magical spirit.</p>
        </header>

        <div className="grid grid-cols-2 gap-4 mb-10">
          {EGG_TYPES.map((egg) => (
            <motion.button
              key={egg.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelect(egg.id)}
              className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center ${
                selected === egg.id 
                ? 'bg-white/20 border-hagumi-pink shadow-lg' 
                : 'bg-white/5 border-white/10'
              }`}
            >
              <div 
                className="w-16 h-20 rounded-full mb-4 shadow-inner"
                style={{ background: `radial-gradient(circle at 30% 30%, white, ${egg.color})` }}
              />
              <span className="font-bold text-white">{egg.name}</span>
              <span className="text-[10px] text-white/40 uppercase tracking-widest">{egg.rarity}</span>
            </motion.button>
          ))}
        </div>

        <motion.button
          disabled={!selected}
          onClick={() => navigate('/hatch')}
          className="w-full bg-hagumi-pink disabled:opacity-30 text-white font-bold py-4 rounded-2xl shadow-xl transition-all"
        >
          Confirm Selection ✨
        </motion.button>
      </div>
    </div>
  )
}
