import { motion } from 'framer-motion'

export function SakuraPetals({ count = 15 }) {
  const petals = Array.from({ length: count })

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {petals.map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * 100 + '%', 
            y: -20, 
            rotate: Math.random() * 360,
            opacity: 0 
          }}
          animate={{ 
            y: '110vh', 
            rotate: Math.random() * 720,
            opacity: [0, 0.8, 0.8, 0] 
          }}
          transition={{ 
            duration: 5 + Math.random() * 5, 
            repeat: Infinity, 
            delay: Math.random() * 10,
            ease: "linear"
          }}
          className="absolute w-3 h-3 bg-hagumi-sakura rounded-full blur-[1px]"
          style={{
            borderRadius: '100% 0% 100% 0% / 100% 0% 100% 0%'
          }}
        />
      ))}
    </div>
  )
}
