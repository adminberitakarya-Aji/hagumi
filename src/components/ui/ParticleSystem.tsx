import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  icon: string;
}

export const ParticleSystem = ({ trigger }: { trigger: number }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  const spawnParticles = useCallback(() => {
    const newParticles = [...Array(8)].map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 100, // Spread around center
      y: (Math.random() - 0.5) * 100,
      icon: ['❤️', '🍖', '✨', '🍎'][Math.floor(Math.random() * 4)],
    }));
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  useEffect(() => {
    if (trigger > 0) {
      spawnParticles();
    }
  }, [trigger, spawnParticles]);

  // Clean up particles
  useEffect(() => {
    const timer = setTimeout(() => {
      if (particles.length > 0) {
        setParticles([]);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [particles]);

  return (
    <div className="absolute inset-0 pointer-events-none z-[60] flex items-center justify-center">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
            animate={{ 
              opacity: 0, 
              scale: 1.5, 
              x: p.x * 2, 
              y: p.y * 2 - 100 // Float upwards
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute text-2xl"
          >
            {p.icon}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
