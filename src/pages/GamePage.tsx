import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePetStore } from '@/stores/petStore'
import { usePetLifecycle } from '@/hooks/usePetLifecycle'
import { useTimeOfDay } from '@/hooks/useTimeOfDay'
import { useWebSocket } from '@/hooks/useWebSocket'
import { SceneBackground } from '@/components/layout/SceneBackground'
import { SakuraPetals } from '@/components/layout/SakuraPetals'
import { StatusBar } from '@/components/ui/StatusBar'
import { PetCharacter } from '@/components/pet/PetCharacter'
import { BottomNav } from '@/components/layout/BottomNav'
import { SideNav } from '@/components/layout/SideNav'
import { ChatModal } from '@/components/chat/ChatModal'
import { GamesModal } from '@/components/ui/GamesModal'
import { motion, AnimatePresence } from 'framer-motion'

import { ParticleSystem } from '@/components/ui/ParticleSystem'
import { LevelUpModal } from '@/components/ui/LevelUpModal'
import { WeatherEffects } from '@/components/layout/WeatherEffects'

export default function GamePage() {
  const navigate = useNavigate()
  const { pet, updateStats } = usePetStore()
  const { timeOfDay } = useTimeOfDay()
  const { sendAction } = useWebSocket()
  
  const [modal, setModal] = useState<'chat' | 'games' | 'levelup' | null>(null)
  const [redirecting, setRedirecting] = useState(false)
  const [particleTrigger, setParticleTrigger] = useState(0)
  const [weather, setWeather] = useState<'clear' | 'rain' | 'snow'>('clear')
  
  // Activate lifecycle engine
  usePetLifecycle()

  useEffect(() => {
    if (!pet && !redirecting) {
      setTimeout(() => {
        setRedirecting(true)
        navigate('/egg-select')
      }, 0)
    }
  }, [pet, navigate, redirecting])

  if (!pet) return null

  // Shake logic: Shake the screen if pet is very hungry or unhappy
  const isStressed = pet.stats.hunger < 20 || pet.stats.mood < 20
  const shakeAnimation = isStressed ? {
    x: [0, -5, 5, -5, 5, 0],
    transition: { duration: 0.4, repeat: Infinity, repeatDelay: 2 }
  } : {}

  const handleAction = (actionId: string) => {
    switch (actionId) {
      case 'feed':
        sendAction('feed')
        setParticleTrigger(prev => prev + 1)
        break
      case 'play':
        setModal('games')
        break
      case 'rest':
        sendAction('rest')
        break
      case 'chat':
        setModal('chat')
        break
      default:
        console.log('Action:', actionId)
    }
  }

  const handlePlayGame = (reward: number) => {
    sendAction('play')
    updateStats({ mood: pet.stats.mood + reward })
    setModal(null)
  }

  return (
    <motion.div 
      animate={shakeAnimation}
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
    >
      <SceneBackground />
      <SakuraPetals count={timeOfDay === 'night' ? 5 : 15} />
      <WeatherEffects type={weather} />
      
      <StatusBar stats={pet.stats} />
      <SideNav />
      
      {/* Age badge & Weather Toggle */}
      <div className="absolute top-6 right-6 z-20 flex flex-col gap-2">
        <div 
          className="glass px-4 py-2 rounded-2xl text-center cursor-pointer hover:bg-white/10 transition-all"
          onClick={() => setModal('levelup')}
        >
          <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-1">Stage</p>
          <p className="text-sm font-black text-white">{pet.stage.toUpperCase()}</p>
          <p className="text-[10px] text-white/40 mt-1">Day {pet.dayAge}</p>
        </div>

        <button 
          onClick={() => setWeather(prev => prev === 'clear' ? 'rain' : prev === 'rain' ? 'snow' : 'clear')}
          className="glass px-3 py-1 rounded-xl text-[10px] font-bold text-white/60 hover:text-white transition-colors"
        >
          ☁️ {weather.toUpperCase()}
        </button>
      </div>

      <div className="z-20 relative">
        <ParticleSystem trigger={particleTrigger} />
        <PetCharacter pet={pet} onTap={() => handleAction('play')} />
      </div>

      <BottomNav onAction={handleAction} />

      <AnimatePresence>
        {modal === 'chat' && <ChatModal pet={pet} onClose={() => setModal(null)} />}
        {modal === 'games' && <GamesModal onPlay={handlePlayGame} onClose={() => setModal(null)} />}
        {modal === 'levelup' && <LevelUpModal isOpen={true} level={5} onClose={() => setModal(null)} />}
      </AnimatePresence>
      
      {/* Death Screen */}
      {pet.stage === 'dead' && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-10 text-center">
          <p className="text-6xl mb-6">🕊️</p>
          <h2 className="text-3xl font-black text-white mb-2">{pet.name} has passed away...</h2>
          <p className="text-white/60 mb-8">Memories will last forever.</p>
          <button 
            onClick={() => { sessionStorage.clear(); location.reload() }}
            className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-2xl font-bold transition-all"
          >
            Start New Legacy
          </button>
        </div>
      )}
    </motion.div>
  )
}
