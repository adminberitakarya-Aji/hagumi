import React from 'react';
import { motion } from 'framer-motion';

export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ 
        type: "spring",
        stiffness: 260,
        damping: 20 
      }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};
