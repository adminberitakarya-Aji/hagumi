import { motion } from 'framer-motion'
import { cn } from '@/lib/designTokens'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

const sizes = {
  sm: 'w-6 h-6 border-2',
  md: 'w-10 h-10 border-3',
  lg: 'w-16 h-16 border-4',
}

export function Loading({ size = 'md', text, className }: LoadingProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <motion.div
        className={cn(
          'rounded-full border-white/20 border-t-hagumi-pink',
          sizes[size]
        )}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      />
      {text && (
        <p className="text-white/50 text-sm animate-glow-pulse">{text}</p>
      )}
    </div>
  )
}

export function LoadingSkeleton({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 rounded-full bg-white/5 animate-pulse"
          style={{ width: `${60 + Math.random() * 40}%` }}
        />
      ))}
    </div>
  )
}

export function PageLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0a0a1a]">
      <div className="flex flex-col items-center gap-6">
        <motion.div
          className="w-20 h-20 rounded-full border-4 border-white/10 border-t-hagumi-pink"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
        />
        <div className="flex flex-col items-center gap-2">
          <motion.p
            className="text-2xl font-black text-gradient"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            Hagumi
          </motion.p>
          <p className="text-white/30 text-xs">Loading...</p>
        </div>
      </div>
    </div>
  )
}