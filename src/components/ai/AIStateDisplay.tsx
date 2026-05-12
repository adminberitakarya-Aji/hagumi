import { PetAIState, AIStateInfo } from '@/types/ai'
import { motion } from 'framer-motion'

interface AIStateDisplayProps {
  state: PetAIState
  stateInfo: AIStateInfo
  showDetails?: boolean
}

export function AIStateDisplay({ state, stateInfo, showDetails = false }: AIStateDisplayProps) {
  const getUrgencyColor = (priority: number) => {
    if (priority >= 90) return 'bg-red-500'
    if (priority >= 70) return 'bg-orange-500'
    if (priority >= 50) return 'bg-yellow-500'
    if (priority >= 30) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getUrgencyLabel = (priority: number) => {
    if (priority >= 90) return 'Critical'
    if (priority >= 70) return 'Urgent'
    if (priority >= 50) return 'Important'
    if (priority >= 30) return 'Normal'
    return 'Low'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass p-4 rounded-2xl space-y-3"
    >
      {/* State Header */}
      <div className="flex items-center gap-3">
        <div className="text-3xl">{stateInfo.emoji}</div>
        <div className="flex-1">
          <h3 className="font-bold text-white capitalize">{state.replace('_', ' ')}</h3>
          <p className="text-white/60 text-sm">{stateInfo.message}</p>
        </div>
        <div className={`px-2 py-1 rounded-full ${getUrgencyColor(stateInfo.priority)}`}>
          <span className="text-white text-xs font-bold">{getUrgencyLabel(stateInfo.priority)}</span>
        </div>
      </div>

      {/* Priority Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-white/60">Priority</span>
          <span className="text-white">{stateInfo.priority}/100</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stateInfo.priority}%` }}
            className={`h-full ${getUrgencyColor(stateInfo.priority)}`}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Details */}
      {showDetails && (
        <div className="space-y-2 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-sm">Animation</span>
            <span className="text-white text-sm font-mono">{stateInfo.animation}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-sm">Urgency Level</span>
            <span className="text-white text-sm">{getUrgencyLabel(stateInfo.priority)}</span>
          </div>
        </div>
      )}
    </motion.div>
  )
}