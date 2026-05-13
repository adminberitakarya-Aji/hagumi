import { useState } from 'react'
import { useEconomyStore } from '@/features/economy/economyStore'
import { GachaItem } from '@/features/economy/types'
import { motion, AnimatePresence } from 'framer-motion'

export default function GachaPage() {
  const { gachaPools, balance, pullGacha } = useEconomyStore()
  const [selectedPool, setSelectedPool] = useState<{ id: string; name: string; description: string; costGems: number; items: GachaItem[]; pityThreshold: number; guaranteedPityItem: string } | null>(null)
  const [pullCount, setPullCount] = useState(1)
  const [isPulling, setIsPulling] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [pullResults, setPullResults] = useState<{ items: GachaItem[] } | null>(null)

  const handlePull = async (count: number) => {
    if (!selectedPool) return

    setIsPulling(true)
    setPullCount(count)

    try {
      const results = await pullGacha(selectedPool.id, count)
      setPullResults(results)
      setShowResults(true)
    } catch (error) {
      console.error('Pull failed:', error)
      alert('Pull failed. Please try again.')
    } finally {
      setIsPulling(false)
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

  const getRarityBorder = (rarity?: string) => {
    switch (rarity) {
      case 'legendary': return 'border-yellow-400 shadow-yellow-400/50'
      case 'epic': return 'border-purple-400 shadow-purple-400/50'
      case 'rare': return 'border-blue-400 shadow-blue-400/50'
      case 'uncommon': return 'border-green-400 shadow-green-400/50'
      default: return 'border-gray-400'
    }
  }

  const getRarityGlow = (rarity?: string) => {
    switch (rarity) {
      case 'legendary': return 'shadow-[0_0_30px_rgba(250,204,21,0.5)]'
      case 'epic': return 'shadow-[0_0_30px_rgba(168,85,247,0.5)]'
      case 'rare': return 'shadow-[0_0_30px_rgba(59,130,246,0.5)]'
      case 'uncommon': return 'shadow-[0_0_30px_rgba(34,197,94,0.5)]'
      default: return ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">
          🎰 Gacha
        </h1>
        
        {/* Balance Display */}
        <div className="flex justify-center gap-4 mb-6">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 px-6 py-3 rounded-full shadow-lg">
            <span className="text-white font-bold text-lg">💰 {balance.coins.toLocaleString()} Coins</span>
          </div>
          <div className="bg-gradient-to-r from-purple-400 to-purple-600 px-6 py-3 rounded-full shadow-lg">
            <span className="text-white font-bold text-lg">💎 {balance.gems.toLocaleString()} Gems</span>
          </div>
        </div>
      </div>

      {/* Gacha Pools */}
      {!selectedPool && (
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Select a Gacha Pool</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gachaPools.filter(pool => pool.isActive).map((pool, index) => (
              <motion.div
                key={pool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border-2 border-purple-400 hover:scale-105 transition-transform cursor-pointer"
                onClick={() => setSelectedPool(pool)}
              >
                <div className="text-center mb-4">
                  <div className="text-6xl mb-2">🎁</div>
                  <h3 className="text-white font-bold text-xl mb-2">{pool.name}</h3>
                  <p className="text-white/70 text-sm mb-4">{pool.description}</p>
                </div>

                {/* Cost */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-2xl">💎</span>
                  <span className="text-white font-bold text-xl">{pool.costGems} Gems</span>
                  <span className="text-white/70">per pull</span>
                </div>

                {/* Pity System */}
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-white/70 text-sm text-center">
                    Pity System: Guaranteed {pool.guaranteedPityItem} after {pool.pityThreshold} pulls
                  </p>
                </div>

                {/* Item Preview */}
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {pool.items.slice(0, 5).map((item, i) => (
                    <div
                      key={i}
                      className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getRarityColor(item.rarity)} flex items-center justify-center text-lg`}
                      title={item.name}
                    >
                      {item.type === 'pet' ? '🐾' : item.type === 'accessory' ? '👑' : item.type === 'decoration' ? '🏠' : '🎨'}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Pool Detail */}
      {selectedPool && !showResults && (
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedPool(null)}
            className="mb-6 text-white/70 hover:text-white transition-colors"
          >
            ← Back to Pools
          </button>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border-2 border-purple-400">
            <div className="text-center mb-8">
              <div className="text-8xl mb-4">🎁</div>
              <h2 className="text-3xl font-bold text-white mb-2">{selectedPool.name}</h2>
              <p className="text-white/70 mb-4">{selectedPool.description}</p>
              
              {/* Pity Counter */}
              <div className="bg-white/10 rounded-xl p-4 mb-6">
                <p className="text-white/70 text-sm">
                  Pity Counter: <span className="text-purple-300 font-bold">0 / {selectedPool.pityThreshold}</span>
                </p>
                <p className="text-white/70 text-sm mt-2">
                  Next Pity: <span className="text-yellow-300 font-bold">{selectedPool.guaranteedPityItem}</span>
                </p>
              </div>
            </div>

            {/* Pull Options */}
            <div className="space-y-4">
              <button
                onClick={() => handlePull(1)}
                disabled={isPulling || balance.gems < selectedPool.costGems}
                className="w-full bg-gradient-to-r from-purple-400 to-pink-500 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-500 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPulling ? 'Pulling...' : `Pull 1x - ${selectedPool.costGems} 💎`}
              </button>
              
              <button
                onClick={() => handlePull(10)}
                disabled={isPulling || balance.gems < selectedPool.costGems * 10}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:from-yellow-500 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPulling ? 'Pulling...' : `Pull 10x - ${selectedPool.costGems * 10} 💎`}
              </button>
            </div>

            {/* Item Probabilities */}
            <div className="mt-8">
              <h3 className="text-white font-bold text-lg mb-4">Drop Rates</h3>
              <div className="space-y-2">
                {selectedPool.items.map((item: GachaItem, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${getRarityColor(item.rarity)} flex items-center justify-center`}>
                        {item.type === 'pet' ? '🐾' : item.type === 'accessory' ? '👑' : item.type === 'decoration' ? '🏠' : '🎨'}
                      </div>
                      <span className="text-white">{item.name}</span>
                    </div>
                    <span className="text-white/70">{(item.probability * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pull Results */}
      <AnimatePresence>
        {showResults && pullResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-purple-800 to-pink-800 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Pull Results</h2>
                <p className="text-white/70">You pulled {pullResults.items.length} item(s)</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                {pullResults.items.map((item: GachaItem, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative bg-white/10 rounded-xl p-4 border-2 ${getRarityBorder(item.rarity)} ${getRarityGlow(item.rarity)}`}
                  >
                    <div className={`w-full h-20 rounded-lg bg-gradient-to-r ${getRarityColor(item.rarity)} flex items-center justify-center text-4xl mb-3`}>
                      {item.type === 'pet' ? '🐾' : item.type === 'accessory' ? '👑' : item.type === 'decoration' ? '🏠' : '🎨'}
                    </div>
                    <p className="text-white font-bold text-sm text-center">{item.name}</p>
                    <p className={`text-xs text-center font-bold ${
                      item.rarity === 'legendary' ? 'text-yellow-400' : 
                      item.rarity === 'epic' ? 'text-purple-400' : 
                      item.rarity === 'rare' ? 'text-blue-400' : 'text-white/70'
                    }`}>
                      {item.rarity.toUpperCase()}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowResults(false)}
                  className="flex-1 bg-white/20 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/30 transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowResults(false)
                    handlePull(pullCount)
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-400 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:from-purple-500 hover:to-pink-600 transition-all"
                >
                  Pull Again
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}