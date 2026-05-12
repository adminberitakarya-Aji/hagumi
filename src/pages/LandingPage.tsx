import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { SceneBackground } from '@/components/layout/SceneBackground'
import { SakuraPetals } from '@/components/layout/SakuraPetals'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <SceneBackground />
      <SakuraPetals count={20} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-20 text-center px-6"
      >
        <p className="font-japanese text-white/70 text-xl mb-1 tracking-widest">育み</p>
        <h1 className="text-6xl md:text-8xl font-black text-white drop-shadow-2xl mb-4 font-japanese">
          HAGUMI
        </h1>
        <p className="text-lg text-white/90 font-medium mb-12 max-w-xs mx-auto drop-shadow-md">
          Nurture magical pets and find your lifelong friend in a world of wonder.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/auth')}
          className="bg-hagumi-pink hover:bg-pink-500 text-white font-bold text-lg px-12 py-5 rounded-full shadow-2xl transition-all"
          style={{ boxShadow: '0 10px 40px rgba(255,107,157,0.4)' }}
        >
          🌸 Start Adventure
        </motion.button>
      </motion.div>

      <div className="absolute bottom-8 text-white/30 text-xs font-medium z-20">
        v1.0.0 • Made with ❤️
      </div>
    </div>
  )
}
