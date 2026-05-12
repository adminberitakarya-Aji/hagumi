import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CurrencyDisplayProps {
  value: number;
  icon?: string;
  color?: string;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ 
  value, 
  icon = "🪙", 
  color = "text-yellow-400" 
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isPopping, setIsPopping] = useState(false);

  const prevValueRef = useRef(value);

  useEffect(() => {
    if (value !== prevValueRef.current) {
      prevValueRef.current = value;
      setIsPopping(true);
      const timer = setTimeout(() => setIsPopping(false), 300);
      
      // Animated count up/down
      const step = Math.ceil(Math.abs(value - displayValue) / 10);
      const interval = setInterval(() => {
        setDisplayValue(prev => {
          if (prev < value) return Math.min(prev + step, value);
          if (prev > value) return Math.max(prev - step, value);
          clearInterval(interval);
          return prev;
        });
      }, 30);

      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [value, displayValue]);

  return (
    <motion.div
      animate={isPopping ? { scale: [1, 1.2, 1] } : {}}
      className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10"
    >
      <span className="text-xl">{icon}</span>
      <span className={`font-black text-lg ${color} tabular-nums`}>
        {displayValue.toLocaleString()}
      </span>
      
      <AnimatePresence>
        {isPopping && (
          <motion.span
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: -20, opacity: 0 }}
            exit={{ opacity: 0 }}
            className="absolute right-0 text-xs font-bold text-green-400"
          >
            {value > displayValue ? `+${value - displayValue}` : ''}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
