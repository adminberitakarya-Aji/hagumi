import { useState, useEffect } from 'react'
import { useEconomyStore } from '@/features/economy/economyStore'
import { motion, AnimatePresence } from 'framer-motion'

export default function BattlePassPage() {
  const { 
    battlePass, 
    balance, 
    loadBattlePass, 
    addBattlePassXP, 
    claimBattlePassReward, 
    purchaseBattlePassPremium,
    getBattlePassLevel,
    isLoading 
  } = useEconomyStore()
  
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null)
  const [showRewardModal, setShowRewardModal] = useState(false)
  const [claimSuccess, setClaimSuccess] = useState(false)

  useEffect(() => {
    loadBattlePass()
  }, [loadBattlePass])

  const handleClaimReward = async (level: number, isPremium: boolean) => {
    setSelectedLevel(level)
    setShowRewardModal(true)
  }

  const confirmClaim = async () => {
    if (selectedLevel === null) return

    try {
      const isPremium = battlePass?.isPremium || false
      await claimBattlePassReward(selectedLevel, isPremium)
      setClaimSuccess(true)
      setTimeout(() => {
        setShowRewardModal(false)
        setClaimSuccess(false)
        setSelectedLevel(null)
      }, 2000)
    } catch (error) {
      console.error('Claim failed:', error)
      alert('Claim failed. Please try again.')
    }
  }

  const handlePurchasePremium = async () => {
    try {
      await purchaseBattlePassPremium()
      alert('Battle Pass Premium purchased successfully!')
    } catch (error) {
      console.error('Purchase failed:', error)
      alert('Purchase failed. Please try again.')
    }
  }

  const getRewardIcon = (reward: any) => {
    switch (reward.type) {
      case 'coins': return '💰'
      case 'gems': return '💎'
      case 'pet': return '🐾'
      case 'accessory': return '👑'
      case 'decoration': return '🏠'
      case 'item': return '📦'
      case 'title': return '🏆'
      default: return '🎁'
    }
  }

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500'
      case 'epic': return 'from-purple-400 to-pink-500'
      case 'rare': return 'from-blue-400 to-cyan-500'
      case 'uncommon': return 'from-green-400 to-emerald-500'
      default: return 'from-gray-400 to-gray-500'
    }
  }

  const levels = [5, 10, 20, 30, 40, 50, 75, 100]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">
          📜 Battle Pass
        </h1>
        
        {/* Balance & XP Display */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 px-6 py-3 rounded-full shadow-lg">
            <span className="text-white font-bold text-lg">💰 {balance.coins.toLocaleString()} Coins</span>
          </div>
          <div className="bg-gradient-to-r from-purple-400 to-purple-600 px-6 py-3 rounded-full shadow-lg">
            <span className="text-white font-bold text-lg">💎 {balance.gems.toLocaleString()} Gems</span>
          </div>
          {battlePass && (
            <div className="bg-gradient-to-r from-blue-400 to-cyan-600 px-6 py-3 rounded-full shadow-lg">
              <span className="text-white font-bold text-lg">⭐ Level {battlePass.currentLevel}</span>
            </div>
          )}
        </div>

        {/* Premium Purchase Button */}
        {!battlePass?.isPremium && (
          <div className="flex justify-center mb-6">
            <button
              onClick={handlePurchasePremium}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:from-yellow-500 hover:to-orange-600 transition-all transform hover:scale-105"
            >
              👑 Upgrade to Premium - $4.99
            </button>
          </div>
        )}

        {/* XP Progress Bar */}
        {battlePass && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-semibold">Level {battlePass.currentLevel}</span>
              <span className="text-white/70">{battlePass.currentXP} / {battlePass.totalXP} XP</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(battlePass.currentXP / battlePass.totalXP) * 100}%` }}
                className="bg-gradient-to-r from-blue-400 to-purple-500 h-full rounded-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Battle Pass Levels */}
      <div className="max-w-7xl mx-auto space-y-6">
        {levels.map((level, index) => {
          const levelData = getBattlePassLevel(level)
          if (!levelData) return null

          const isUnlocked = battlePass && battlePass.currentLevel >= level
          const isClaimedFree = battlePass?.claimedFreeLevels?.includes(level)
          const isClaimedPremium = battlePass?.claimedPremiumLevels?.includes(level)
          const canClaimPremium = battlePass?.isPremium && !isClaimedPremium

          return (
            <motion.div
              key={level}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 border-2 ${
                isUnlocked ? 'border-green-400' : 'border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                    isUnlocked ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-white/20'
                  }`}>
                    {level}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl">Level {level}</h3>
                    <p className="text-white/70 text-sm">{levelData.xpRequired} XP required</p>
                  </div>
                </div>
                {isUnlocked && (
                  <div className="text-green-400 font-bold">✓ Unlocked</div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Free Reward */}
                <div className={`bg-white/10 rounded-xl p-4 ${
                  isClaimedFree ? 'opacity-50' : ''
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/70 text-sm font-semibold">FREE</span>
                    {isClaimedFree && <span className="text-green-400 text-sm">✓ Claimed</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${getRarityColor(levelData.freeReward.rarity)} flex items-center justify-center text-2xl`}>
                      {getRewardIcon(levelData.freeReward)}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{levelData.freeReward.itemName || `${levelData.freeReward.type} x${levelData.freeReward.amount || 1}`}</p>
                      {levelData.freeReward.rarity && (
                        <p className={`text-xs font-bold ${levelData.freeReward.rarity === 'legendary' ? 'text-yellow-400' : levelData.freeReward.rarity === 'epic' ? 'text-purple-400' : 'text-white/70'}`}>
                          {levelData.freeReward.rarity.toUpperCase()}
                        </p>
                      )}
                    </div>
                  </div>
                  {isUnlocked && !isClaimedFree && (
                    <button
                      onClick={() => handleClaimReward(level, false)}
                      className="mt-3 w-full bg-gradient-to-r from-blue-400 to-cyan-500 text-white py-2 rounded-full font-semibold hover:from-blue-500 hover:to-cyan-600 transition-all"
                    >
                      Claim
                    </button>
                  )}
                </div>

                {/* Premium Reward */}
                <div className={`bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-400/30 ${
                  !battlePass?.isPremium ? 'opacity-50' : ''
                } ${isClaimedPremium ? 'opacity-50' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-purple-300 text-sm font-semibold">👑 PREMIUM</span>
                    {isClaimedPremium && <span className="text-green-400 text-sm">✓ Claimed</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${getRarityColor(levelData.premiumReward.rarity)} flex items-center justify-center text-2xl`}>
                      {getRewardIcon(levelData.premiumReward)}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{levelData.premiumReward.itemName || `${levelData.premiumReward.type} x${levelData.premiumReward.amount || 1}`}</p>
                      {levelData.premiumReward.rarity && (
                        <p className={`text-xs font-bold ${levelData.premiumReward.rarity === 'legendary' ? 'text-yellow-400' : levelData.premiumReward.rarity === 'epic' ? 'text-purple-400' : 'text-white/70'}`}>
                          {levelData.premiumReward.rarity.toUpperCase()}
                        </p>
                      )}
                    </div>
                  </div>
                  {canClaimPremium && isUnlocked && !isClaimedPremium && (
                    <button
                      onClick={() => handleClaimReward(level, true)}
                      className="mt-3 w-full bg-gradient-to-r from-purple-400 to-pink-500 text-white py-2 rounded-full font-semibold hover:from-purple-500 hover:to-pink-600 transition-all"
                    >
                      Claim
                    </button>
                  )}
                  {!battlePass?.isPremium && (
                    <div className="mt-3 text-center text-purple-300 text-sm">
                      Upgrade to Premium to claim
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Claim Reward Modal */}
      <AnimatePresence>
        {showRewardModal && selectedLevel !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => !claimSuccess && setShowRewardModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-purple-800 to-pink-800 rounded-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {claimSuccess ? (
                <div className="text-center">
                  <div className="text-6xl mb-4">✅</div>
                  <h2 className="text-2xl font-bold text-white mb-2">Reward Claimed!</h2>
                  <p className="text-white/70">You have claimed the Level {selectedLevel} reward</p>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-white mb-4">Claim Reward</h2>
                  <p className="text-white/70 mb-6">Are you sure you want to claim the Level {selectedLevel} reward?</p>
                  
                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowRewardModal(false)}
                      className="flex-1 bg-white/20 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/30 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmClaim}
                      className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-3 rounded-full font-semibold hover:from-green-500 hover:to-emerald-600 transition-all"
                    >
                      Claim
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}