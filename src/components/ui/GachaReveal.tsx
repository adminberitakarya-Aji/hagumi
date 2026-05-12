import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GachaRevealProps {
  isOpen: boolean;
  item: { name: string; rarity: 'common' | 'rare' | 'epic' | 'legendary'; icon: string };
  onClose: () => void;
}

const rarityColors = {
  common: 'from-gray-400 to-gray-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-500 to-purple-800',
  legendary: 'from-yellow-300 via-orange-500 to-red-600',
};

export const GachaReveal: React.FC<GachaRevealProps> = ({ isOpen, item, onClose }) => {
  const particlesData = useMemo(() => {
    return Array.from({ length: 20 }).map(() => ({
      animateX: `${Math.random() * 100}%`,
      animateY: `${Math.random() * 100}%`,
      animateScale: Math.random() * 2,
      delay: Math.random() * 2,
    }))
  }, [])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl"
        >
          {/* Background Shine */}
          <motion.div
            animate={{ 
              scale: [1, 1.5, 1],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className={`absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 bg-gradient-to-r ${rarityColors[item.rarity]}`}
          />

          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 12, stiffness: 100 }}
            className="relative flex flex-col items-center"
          >
            {/* The Item Card */}
            <div className={`w-64 h-80 rounded-[32px] p-1 bg-gradient-to-b ${rarityColors[item.rarity]} shadow-[0_0_50px_rgba(255,255,255,0.2)]`}>
              <div className="w-full h-full bg-[#1a1a1a] rounded-[30px] flex flex-col items-center justify-center p-6 text-center">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-8xl mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                >
                  {item.icon}
                </motion.div>
                
                <h3 className="text-white font-black text-2xl mb-1 tracking-tight">
                  {item.name}
                </h3>
                <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full bg-white/10 ${
                  item.rarity === 'legendary' ? 'text-yellow-400' : 'text-white/60'
                }`}>
                  {item.rarity}
                </span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="mt-12 px-10 py-4 bg-white text-black font-black rounded-full shadow-xl hover:shadow-white/20 transition-all"
            >
              COLLECT ITEM
            </motion.button>
          </motion.div>

          {/* Sparkles Particle Effect Simulation */}
          <div className="absolute inset-0 pointer-events-none">
            {particlesData.map((data, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: "50%", 
                  y: "50%", 
                  scale: 0,
                  opacity: 1 
                }}
                animate={{ 
                  x: data.animateX, 
                  y: data.animateY,
                  scale: data.animateScale,
                  opacity: 0
                }}
                transition={{ duration: 2, repeat: Infinity, delay: data.delay }}
                className="absolute w-1 h-1 bg-white rounded-full"
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
