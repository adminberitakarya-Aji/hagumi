import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

type WeatherType = 'rain' | 'snow' | 'clear';

interface WeatherProps {
  type: WeatherType;
}

export const WeatherEffects: React.FC<WeatherProps> = ({ type }) => {
  const count = type === 'rain' ? 40 : 30;

  /* eslint-disable react-hooks/purity */
  const particlesData = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      initialLeft: `${Math.random() * 100}%`,
      initialOpacity: Math.random() * 0.5 + 0.2,
      animateLeftOffset: (Math.random() - 0.5) * 10,
      duration: type === 'rain' ? 0.8 : Math.random() * 5 + 5,
      delay: Math.random() * 5,
    }))
  }, [count, type])
  /* eslint-enable react-hooks/purity */

  if (type === 'clear') return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[5]">
      {particlesData.map((data, i) => (
        <motion.div
          key={i}
          initial={{ 
            top: -20, 
            left: data.initialLeft,
            opacity: data.initialOpacity
          }}
          animate={{ 
            top: "110%",
            left: type === 'rain' ? undefined : `${data.animateLeftOffset + (i / count) * 100}%`
          }}
          transition={{ 
            duration: data.duration,
            repeat: Infinity,
            delay: data.delay,
            ease: "linear"
          }}
          className={`absolute ${
            type === 'rain' 
              ? 'w-[1px] h-4 bg-white/30' 
              : 'w-2 h-2 bg-white rounded-full blur-[1px]'
          }`}
        />
      ))}
      
      {/* Atmosphere overlay */}
      <div className={`absolute inset-0 transition-colors duration-1000 ${
        type === 'rain' ? 'bg-blue-900/10' : 'bg-white/5'
      }`} />
    </div>
  );
};
