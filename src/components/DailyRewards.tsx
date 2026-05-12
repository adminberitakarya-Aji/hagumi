import React, { useState, useEffect } from 'react'
import { useEconomyStore } from '@/features/economy/economyStore'
import { motion, AnimatePresence } from 'framer-motion'

export default function DailyRewards() {
  const { claimDailyReward, getDailyReward, balance } = useEconomyStore()
  const [currentDay, setCurrentDay] = useState(1)
  const [isClaiming, setIsClaiming] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [claimedReward, setClaimedReward] = useState<any>(null)

  const days = [1, 2, 3, 4, 5, 6, 7]

  const handleClaim = async (day: number) => {
    if (day !== currentDay) return

    setIsClaiming(true)
    try {
      const reward = await claimDailyReward()
      if (reward) {
        setClaimedReward(reward)
        setShowSuccess(true)
        setCurrentDay(day + 1 > 7 ? 1 : day + 1)
        setTimeout(() => {
          setShowSuccess(false)
          setClaimedReward(null)
        }, 3000)
      }
    } catch (error) {
      console.error('Claim failed:', error)
      alert('Claim failed. Please try again.')
    } finally {
      setIsClaiming(false)
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-4 text-center">🎁 Daily Rewards</h2>
      
      <div className="grid grid-cols-7 gap-2 mb-4">
        {days.map((day) => {
          const reward = getDailyReward(day)
          const isCurrentDay = day === currentDay
          const isPastDay = day < currentDay
          const isFutureDay = day > currentDay

          return (
            <motion.div
              key={day}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: day * 0.1 }}
              className={`relative rounded-xl p-3 text-center ${
                isCurrentDay
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-yellow-300'
                  : isPastDay
                  ? 'bg-white/20 opacity-50'
                  : 'bg-white/10 opacity-30'
              }`}
            >
              <div className="text-white font-bold text-lg mb-2">Day {day}</div>
              
              {reward && (
                <div className="space-y-1">
                  {reward.coins > 0 && (
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-lg">💰</span>
                      <span className="text-white text-sm font-semibold">{reward.coins}</span>
                    </div>
                  )}
                  {reward.gems > 0 && (
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-lg">💎</span>
                      <span className="text-white text-sm font-semibold">{reward.gems}</span>
                    </div>
                  )}
                  {reward.bonus && (
                    <div className="text-yellow-300 text-xs font-bold">
                      {reward.bonus}
                    </div>
                  )}
                </div>
              )}

              {isCurrentDay && (
                <button
                  onClick={() => handleClaim(day)}
                  disabled={isClaiming}
                  className="mt-2 w-full bg-white text-orange-500 py-1 rounded-full text-xs font-bold hover:bg-white/90 transition-all disabled:opacity-50"
                >
                  {isClaiming ? 'Claiming...' : 'Claim'}
                </button>
              )}

              {isPastDay && (
                <div className="mt-2 text-green-400 text-xs font-bold">✓ Claimed</div>
              )}
            </motion.div>
          )
        })}
      </div>

      <div className="text-center text-white/70 text-sm">
        <p>Current Day: {currentDay} / 7</p>
        <p className="mt-1">Claim daily to build your streak!</p>
      </div>

      {/* Success Animation */}
      <AnimatePresence>
        {showSuccess && claimedReward && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-white mb-2">Reward Claimed!</h3>
              <div className="space-y-2">
                {claimedReward.coins > 0 && (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-3xl">💰</span>
                    <span className="text-white text-xl font-bold">+{claimedReward.coins} Coins</span>
                  </div>
                )}
                {claimedReward.gems > 0 && (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-3xl">💎</span>
                    <span className="text-white text-xl font-bold">+{claimedReward.gems} Gems</span>
                  </div>
                )}
                {claimedReward.bonus && (
                  <div className="text-yellow-200 text-lg font-bold">
                    {claimedReward.bonus}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}