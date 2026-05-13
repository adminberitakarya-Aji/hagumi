import { useMemo } from 'react'
import { motion } from 'framer-motion'

export function SakuraPetals({ count = 15 }) {
  /* eslint-disable react-hooks/purity */
  const petalsData = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      initialX: Math.random() * 100 + '%',
      initialRotate: Math.random() * 360,
      animateRotate: Math.random() * 720,
      duration: 5 + Math.random() * 5,
      delay: Math.random() * 10,
    }))
  }, [count])
  /* eslint-enable react-hooks/purity */

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {petalsData.map((data, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: data.initialX, 
            y: -20, 
            rotate: data.initialRotate,
            opacity: 0 
          }}
          animate={{ 
            y: '110vh', 
            rotate: data.animateRotate,
            opacity: [0, 0.8, 0.8, 0] 
          }}
          transition={{ 
            duration: data.duration, 
            repeat: Infinity, 
            delay: data.delay,
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
