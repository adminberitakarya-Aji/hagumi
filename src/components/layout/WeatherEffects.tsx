import React from 'react';
import { motion } from 'framer-motion';

type WeatherType = 'rain' | 'snow' | 'clear';

interface WeatherProps {
  type: WeatherType;
}

export const WeatherEffects: React.FC<WeatherProps> = ({ type }) => {
  if (type === 'clear') return null;

  const count = type === 'rain' ? 40 : 30;
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[5]">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            top: -20, 
            left: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.5 + 0.2
          }}
          animate={{ 
            top: "110%",
            left: type === 'rain' ? undefined : `${(Math.random() - 0.5) * 10 + (i / count) * 100}%`
          }}
          transition={{ 
            duration: type === 'rain' ? 0.8 : Math.random() * 5 + 5,
            repeat: Infinity,
            delay: Math.random() * 5,
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
