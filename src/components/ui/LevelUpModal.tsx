import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LevelUpModalProps {
  isOpen: boolean;
  level: number;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ isOpen, level, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-hagumi-pink/20 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.5, y: 50, rotate: -10 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="bg-white rounded-[40px] p-10 flex flex-col items-center shadow-[0_20px_50px_rgba(236,72,153,0.3)] border-4 border-hagumi-pink/30"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute w-64 h-64 border-4 border-dashed border-hagumi-pink/20 rounded-full"
            />
            
            <p className="text-6xl mb-4">🏆</p>
            <h2 className="text-hagumi-pink font-black text-4xl mb-2 tracking-tighter uppercase">Level Up!</h2>
            <p className="text-gray-400 font-bold mb-8">Your pet reached level <span className="text-black">{level}</span></p>
            
            <div className="grid grid-cols-2 gap-4 w-full mb-10">
              <div className="bg-hagumi-pink/5 p-4 rounded-3xl text-center">
                <p className="text-[10px] text-hagumi-pink/50 font-bold uppercase">Reward</p>
                <p className="text-xl font-black">🪙 500</p>
              </div>
              <div className="bg-hagumi-pink/5 p-4 rounded-3xl text-center">
                <p className="text-[10px] text-hagumi-pink/50 font-bold uppercase">Unlock</p>
                <p className="text-xl font-black">🎁 Accessory</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="w-full bg-hagumi-pink text-white font-black py-4 rounded-2xl shadow-lg shadow-pink-500/30"
            >
              AWESOME!
            </motion.button>
          </motion.div>

          {/* Background Confetti simulation */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ top: -20, left: `${Math.random() * 100}%`, rotate: 0 }}
                animate={{ 
                  top: "120%", 
                  left: `${(Math.random() - 0.5) * 20 + i * 3.3}%`,
                  rotate: 360 
                }}
                transition={{ 
                  duration: Math.random() * 2 + 2, 
                  repeat: Infinity,
                  delay: Math.random() * 2 
                }}
                className={`absolute w-3 h-3 rounded-sm ${
                  ['bg-pink-400', 'bg-yellow-400', 'bg-cyan-400', 'bg-purple-400'][i % 4]
                }`}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
