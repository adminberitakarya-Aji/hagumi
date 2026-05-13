import { PetAI, AIStateInfo } from '@/types/ai'
import { AIStateDisplay } from './AIStateDisplay'
import { AIEmotionDisplay } from './AIEmotionDisplay'
import { AIBehaviorIndicators } from './AIBehaviorIndicators'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

interface AIDebugViewProps {
  ai: PetAI
  stateInfo: AIStateInfo
  onTick?: () => void
  onReset?: () => void
}

export function AIDebugView({ ai, stateInfo, onTick, onReset }: AIDebugViewProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!showDetails) return
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [showDetails])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold">AI Debug View</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-3 py-1 rounded-lg bg-white/10 text-white text-xs hover:bg-white/20 transition"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
          {onTick && (
            <button
              onClick={onTick}
              className="px-3 py-1 rounded-lg bg-hagumi-pink text-white text-xs hover:bg-pink-500 transition"
            >
              Tick
            </button>
          )}
          {onReset && (
            <button
              onClick={onReset}
              className="px-3 py-1 rounded-lg bg-red-500/20 text-red-300 text-xs hover:bg-red-500/30 transition"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Current State */}
      <AIStateDisplay state={ai.currentState} stateInfo={stateInfo} showDetails={showDetails} />

      {/* Current Emotion */}
      <AIEmotionDisplay emotion={ai.emotion} showDetails={showDetails} />

      {/* Personality Behavior */}
      <AIBehaviorIndicators
        personality={ai.personalityBehavior}
        currentAction={ai.decision?.action || null}
        showDetails={showDetails}
      />

      {/* Decision Info */}
      {ai.decision && showDetails && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-4 rounded-2xl space-y-3"
        >
          <h4 className="text-white/60 text-sm font-medium">Current Decision</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">Action</span>
              <span className="text-white text-sm">{ai.decision.action.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">Urgency</span>
              <span className="text-white text-sm">{ai.decision.urgency}/100</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">Reasoning</span>
              <span className="text-white text-sm">{ai.decision.reasoning}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">Timestamp</span>
              <span className="text-white text-sm">
                {new Date(ai.decision.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* State History */}
      {showDetails && ai.stateHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-4 rounded-2xl space-y-3"
        >
          <h4 className="text-white/60 text-sm font-medium">State History (Last 10)</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {ai.stateHistory.slice(-10).reverse().map((entry, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-white/60 capitalize">{entry.state}</span>
                <span className="text-white/40">
                  {entry.duration.toFixed(1)}s - {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Learning Info */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-4 rounded-2xl space-y-3"
        >
          <h4 className="text-white/60 text-sm font-medium">Learning</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">Actions History</span>
              <span className="text-white text-sm">{ai.learning.actionHistory.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">Learned Behaviors</span>
              <span className="text-white text-sm">{ai.learning.learnedBehaviors.length}</span>
            </div>
            {ai.learning.learnedBehaviors.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {ai.learning.learnedBehaviors.map((behavior, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 rounded-full bg-green-500/20 text-green-300 text-xs capitalize"
                  >
                    {behavior}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Tick Info */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-4 rounded-2xl space-y-3"
        >
          <h4 className="text-white/60 text-sm font-medium">Tick System</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">Tick Interval</span>
              <span className="text-white text-sm">{ai.tickInterval}s</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">Last Tick</span>
              <span className="text-white text-sm">
                {new Date(ai.lastTick).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">Time Since Last Tick</span>
              <span className="text-white text-sm">
                {((now - ai.lastTick) / 1000).toFixed(1)}s
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}