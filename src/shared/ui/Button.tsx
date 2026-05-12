import { motion } from 'framer-motion'
import { cn } from '@/lib/designTokens'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'glass'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  className?: string
  type?: 'button' | 'submit'
  ariaLabel?: string
}

const variants = {
  primary: 'bg-hagumi-pink hover:bg-pink-500 text-white font-bold shadow-lg',
  secondary: 'bg-white/10 hover:bg-white/20 text-white font-semibold',
  ghost: 'bg-transparent hover:bg-white/5 text-white/70 hover:text-white',
  danger: 'bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold border border-red-500/20',
  glass: 'glass hover:glass-hover text-white font-semibold',
}

const sizes = {
  sm: 'px-4 py-2 text-xs rounded-xl',
  md: 'px-6 py-3 text-sm rounded-2xl',
  lg: 'px-8 py-4 text-base rounded-2xl',
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className,
  type = 'button',
  ariaLabel,
}: ButtonProps) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.03 } : undefined}
      whileTap={!disabled ? { scale: 0.97 } : undefined}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hagumi-pink/50',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </motion.button>
  )
}