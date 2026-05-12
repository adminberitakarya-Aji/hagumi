import { AIEmotion } from '@/types/ai'
import { motion } from 'framer-motion'

interface AIEmotionDisplayProps {
  emotion: AIEmotion
  showDetails?: boolean
}

export function AIEmotionDisplay({ emotion, showDetails = false }: AIEmotionDisplayProps) {
  const getEmotionEmoji = (primary: string) => {
    const emojis: Record<string, string> = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      excited: '🎉',
      tired: '😴',
      hungry: '🍖',
      playful: '🎾',
      affectionate: '💕',
      lonely: '🥺',
      sick: '🤒',
      bored: '😐',
      neutral: '😐',
      proud: '😊',
      scared: '😨',
      curious: '🤔',
    }
    return emojis[primary] || '😐'
  }

  const getEmotionColor = (primary: string) => {
    const colors: Record<string, string> = {
      happy: 'bg-green-500',
      sad: 'bg-blue-500',
      angry: 'bg-red-500',
      excited: 'bg-yellow-500',
      tired: 'bg-purple-500',
      hungry: 'bg-orange-500',
      playful: 'bg-pink-500',
      affectionate: 'bg-pink-500',
      lonely: 'bg-blue-500',
      sick: 'bg-red-500',
      bored: 'bg-gray-500',
      neutral: 'bg-gray-500',
      proud: 'bg-green-500',
      scared: 'bg-red-500',
      curious: 'bg-purple-500',
    }
    return colors[primary] || 'bg-gray-500'
  }

  const getIntensityLabel = (intensity: number) => {
    if (intensity >= 0.8) return 'Very Strong'
    if (intensity >= 0.6) return 'Strong'
    if (intensity >= 0.4) return 'Moderate'
    if (intensity >= 0.2) return 'Weak'
    return 'Very Weak'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass p-4 rounded-2xl space-y-3"
    >
      {/* Emotion Header */}
      <div className="flex items-center gap-3">
        <div className="text-3xl">{getEmotionEmoji(emotion.primary)}</div>
        <div className="flex-1">
          <h3 className="font-bold text-white capitalize">{emotion.primary}</h3>
          {emotion.secondary && (
            <p className="text-white/60 text-sm capitalize">+ {emotion.secondary}</p>
          )}
        </div>
        <div className={`px-2 py-1 rounded-full ${getEmotionColor(emotion.primary)}`}>
          <span className="text-white text-xs font-bold">{getIntensityLabel(emotion.intensity)}</span>
        </div>
      </div>

      {/* Intensity Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-white/60">Intensity</span>
          <span className="text-white">{(emotion.intensity * 100).toFixed(0)}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${emotion.intensity * 100}%` }}
            className={`h-full ${getEmotionColor(emotion.primary)}`}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Details */}
      {showDetails && (
        <div className="space-y-2 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-sm">Duration</span>
            <span className="text-white text-sm">{emotion.duration}s</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-sm">Primary</span>
            <span className="text-white text-sm capitalize">{emotion.primary}</span>
          </div>
          {emotion.secondary && (
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">Secondary</span>
              <span className="text-white text-sm capitalize">{emotion.secondary}</span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}