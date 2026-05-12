import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { EGG_TYPES } from '@/types/data'
import { usePetStore } from '@/stores/petStore'
import { v4 as uuidv4 } from 'uuid'
import { SceneBackground } from '@/components/layout/SceneBackground'

export default function HatchPage() {
  const navigate = useNavigate()
  const { setPet } = usePetStore()
  const eggId = sessionStorage.getItem('selected_egg_id')
  const egg = EGG_TYPES.find(e => e.id === eggId) || EGG_TYPES[0]

  const [warmth, setWarmth] = useState(0)
  const [hatching, setHatching] = useState(false)

  const handleWarm = () => {
    if (warmth >= 100) return
    setWarmth(prev => Math.min(100, prev + 10))
  }

  const handleHatch = () => {
    setHatching(true)
    setTimeout(() => {
      const newPet = {
        id: uuidv4(),
        userId: 'guest', // default for now
        name: 'Hagumi',
        gender: 'male' as const,
        stage: 'baby' as const,
        genetics: {
          color: egg.color,
          colorName: egg.name,
          personality: egg.personality,
          baseHungerRate: 1.0,
          baseMoodRate: 1.0,
          baseEnergyRate: 1.0,
          growthSpeed: 1.0,
        },
        stats: { hunger: 100, mood: 100, energy: 100, health: 100, growth: 0 },
        dayAge: 0,
        totalInteractions: 0,
        lastFed: new Date().toISOString(),
        lastPlayed: new Date().toISOString(),
        lastRested: new Date().toISOString(),
        lastCleaned: new Date().toISOString(),
        bornAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setPet(newPet)
      navigate('/game')
    }, 2000)
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-6">
      <SceneBackground />

      <div className="z-20 w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold text-white mb-8">Warm the Egg</h2>
        
        <div className="relative mb-12">
          <motion.div
            animate={warmth > 0 && warmth < 100 ? { rotate: [0, -2, 2, -2, 0] } : {}}
            transition={{ repeat: Infinity, duration: 0.5 }}
            onClick={handleWarm}
            className="cursor-pointer"
          >
            <div 
              className="w-32 h-40 rounded-full mx-auto shadow-2xl relative overflow-hidden"
              style={{ background: `radial-gradient(circle at 30% 30%, white, ${egg.color})` }}
            >
              {/* Cracking effect when full */}
              {warmth === 100 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-1 bg-white/30 rotate-45" />
                  <div className="w-full h-1 bg-white/30 -rotate-45" />
                </div>
              )}
            </div>
          </motion.div>

          {/* Progress ring */}
          <div className="absolute inset-0 -m-4">
             <svg className="w-full h-full -rotate-90">
               <circle 
                cx="50%" cy="50%" r="48%" 
                fill="none" stroke="white" strokeOpacity="0.1" strokeWidth="4" 
               />
               <motion.circle 
                cx="50%" cy="50%" r="48%" 
                fill="none" stroke={egg.color} strokeWidth="4" 
                strokeDasharray="100 100"
                animate={{ strokeDashoffset: 100 - warmth }}
               />
             </svg>
          </div>
        </div>

        <p className="text-white/60 text-sm mb-12">
          {warmth < 100 ? 'Tap the egg to give it warmth.' : 'It\'s moving! Ready to hatch!'}
        </p>

        <AnimatePresence>
          {warmth === 100 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleHatch}
              disabled={hatching}
              className="w-full bg-hagumi-pink text-white font-bold py-4 rounded-2xl shadow-xl"
            >
              {hatching ? '✨ Hatching...' : 'Hatch Pet! 🎉'}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
