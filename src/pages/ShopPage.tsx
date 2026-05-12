import { useState, useEffect } from 'react'
import { useEconomyStore } from '@/features/economy/economyStore'
import { useAuthStore } from '@/stores/authStore'
import { motion, AnimatePresence } from 'framer-motion'

export default function ShopPage() {
  const { shopItems, balance, purchaseShopItem, isLoading } = useEconomyStore()
  const { user } = useAuthStore()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)

  const categories = ['all', 'cosmetic', 'accessory', 'decoration', 'pack']

  const filteredItems = selectedCategory === 'all'
    ? shopItems
    : shopItems.filter(item => item.category === selectedCategory)

  const handlePurchase = async (item: any) => {
    setSelectedItem(item)
    setShowPurchaseModal(true)
  }

  const confirmPurchase = async () => {
    if (!selectedItem) return

    try {
      await purchaseShopItem(selectedItem.id)
      setPurchaseSuccess(true)
      setTimeout(() => {
        setShowPurchaseModal(false)
        setPurchaseSuccess(false)
        setSelectedItem(null)
      }, 2000)
    } catch (error) {
      console.error('Purchase failed:', error)
      alert('Purchase failed. Please try again.')
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
      case 'legendary': return 'border-yellow-400'
      case 'epic': return 'border-purple-400'
      case 'rare': return 'border-blue-400'
      case 'uncommon': return 'border-green-400'
      default: return 'border-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">
          🛍️ Shop
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

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full font-semibold transition-all ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Shop Items Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border-2 ${getRarityBorder(item.rarity)} hover:scale-105 transition-transform cursor-pointer`}
            onClick={() => handlePurchase(item)}
          >
            {/* Rarity Badge */}
            {item.rarity && (
              <div className={`absolute top-2 right-2 px-3 py-1 rounded-full bg-gradient-to-r ${getRarityColor(item.rarity)} text-white text-xs font-bold`}>
                {item.rarity.toUpperCase()}
              </div>
            )}

            {/* Limited Badge */}
            {item.isLimited && (
              <div className="absolute top-2 left-2 px-3 py-1 rounded-full bg-red-500 text-white text-xs font-bold">
                LIMITED
              </div>
            )}

            {/* Item Image Placeholder */}
            <div className="w-full h-32 bg-gradient-to-br from-purple-200 to-pink-200 rounded-xl mb-4 flex items-center justify-center">
              <span className="text-4xl">
                {item.type === 'cosmetic' ? '🎨' : item.type === 'accessory' ? '👑' : item.type === 'decoration' ? '🏠' : '📦'}
              </span>
            </div>

            {/* Item Details */}
            <h3 className="text-white font-bold text-lg mb-2">{item.name}</h3>
            <p className="text-white/70 text-sm mb-4 line-clamp-2">{item.description}</p>

            {/* Price */}
            <div className="flex items-center justify-between">
              {item.currency === 'gems' ? (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💎</span>
                  <span className="text-white font-bold text-xl">{item.priceGems}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💰</span>
                  <span className="text-white font-bold text-xl">{item.priceCoins}</span>
                </div>
              )}
              <button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-full font-semibold hover:from-pink-600 hover:to-purple-600 transition-all">
                Buy
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Purchase Modal */}
      <AnimatePresence>
        {showPurchaseModal && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => !purchaseSuccess && setShowPurchaseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-purple-800 to-pink-800 rounded-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {purchaseSuccess ? (
                <div className="text-center">
                  <div className="text-6xl mb-4">✅</div>
                  <h2 className="text-2xl font-bold text-white mb-2">Purchase Successful!</h2>
                  <p className="text-white/70">You have purchased {selectedItem.name}</p>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-white mb-4">Confirm Purchase</h2>
                  
                  <div className="bg-white/10 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-200 to-pink-200 rounded-xl flex items-center justify-center">
                        <span className="text-4xl">
                          {selectedItem.type === 'cosmetic' ? '🎨' : selectedItem.type === 'accessory' ? '👑' : selectedItem.type === 'decoration' ? '🏠' : '📦'}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">{selectedItem.name}</h3>
                        <p className="text-white/70 text-sm">{selectedItem.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/20 pt-4">
                      <span className="text-white/70">Price:</span>
                      {selectedItem.currency === 'gems' ? (
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">💎</span>
                          <span className="text-white font-bold text-xl">{selectedItem.priceGems}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">💰</span>
                          <span className="text-white font-bold text-xl">{selectedItem.priceCoins}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowPurchaseModal(false)}
                      className="flex-1 bg-white/20 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/30 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmPurchase}
                      className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-full font-semibold hover:from-pink-600 hover:to-purple-600 transition-all"
                    >
                      Confirm
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