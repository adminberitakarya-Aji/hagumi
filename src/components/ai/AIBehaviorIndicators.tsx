import { PersonalityBehavior, AIAction } from '@/types/ai'
import { motion } from 'framer-motion'

interface AIBehaviorIndicatorsProps {
  personality: PersonalityBehavior
  currentAction?: AIAction | null
  showDetails?: boolean
}

export function AIBehaviorIndicators({ personality, currentAction, showDetails = false }: AIBehaviorIndicatorsProps) {
  const getTraitColor = (value: number) => {
    if (value >= 0.8) return 'bg-green-500'
    if (value >= 0.6) return 'bg-blue-500'
    if (value >= 0.4) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getTraitLabel = (value: number) => {
    if (value >= 0.8) return 'High'
    if (value >= 0.6) return 'Medium-High'
    if (value >= 0.4) return 'Medium'
    return 'Low'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-4 rounded-2xl space-y-4"
    >
      {/* Personality Header */}
      <div className="flex items-center gap-3">
        <div className="text-3xl">🎭</div>
        <div className="flex-1">
          <h3 className="font-bold text-white capitalize">{personality.personality}</h3>
          <p className="text-white/60 text-sm">Personality Traits</p>
        </div>
      </div>

      {/* Personality Traits */}
      <div className="space-y-3">
        {/* Reaction Speed */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-white/60">Reaction Speed</span>
            <span className="text-white">{getTraitLabel(personality.reactionSpeed)}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${personality.reactionSpeed * 100}%` }}
              className={`h-full ${getTraitColor(personality.reactionSpeed)}`}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Social Need */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-white/60">Social Need</span>
            <span className="text-white">{getTraitLabel(personality.socialNeed)}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${personality.socialNeed * 100}%` }}
              className={`h-full ${getTraitColor(personality.socialNeed)}`}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Playfulness */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-white/60">Playfulness</span>
            <span className="text-white">{getTraitLabel(personality.playfulness)}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${personality.playfulness * 100}%` }}
              className={`h-full ${getTraitColor(personality.playfulness)}`}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Independence */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-white/60">Independence</span>
            <span className="text-white">{getTraitLabel(personality.independence)}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${personality.independence * 100}%` }}
              className={`h-full ${getTraitColor(personality.independence)}`}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Action Preferences */}
      {showDetails && (
        <div className="pt-3 border-t border-white/10">
          <p className="text-white/60 text-sm font-medium mb-2">Preferred Actions</p>
          <div className="flex flex-wrap gap-2">
            {personality.actionPreferences.map((pref, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full bg-white/10 text-white text-xs capitalize"
              >
                {pref}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Current Action */}
      {currentAction && (
        <div className="pt-3 border-t border-white/10">
          <p className="text-white/60 text-sm font-medium mb-2">Current Action</p>
          <div className="flex items-center gap-3">
            <div className="text-2xl">⚡</div>
            <div className="flex-1">
              <p className="text-white font-medium">{currentAction.name}</p>
              <p className="text-white/40 text-xs capitalize">{currentAction.type}</p>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-xs">Duration</p>
              <p className="text-white text-sm">{currentAction.duration}s</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}