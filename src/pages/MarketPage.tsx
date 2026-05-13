import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMarketStore } from '@/stores/marketStore'
import { SceneBackground } from '@/components/layout/SceneBackground'
import { motion } from 'framer-motion'

const MarketItem = React.memo(({ item }: { item: { id: string; profiles?: { display_name: string } } }) => (
  <motion.div
    whileTap={{ scale: 0.98 }}
    className="glass p-4 rounded-2xl flex items-center gap-4"
  >
    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-2xl">
      🍱
    </div>
    <div className="flex-1">
      <p className="font-bold text-white text-sm">Delicious Ramen</p>
      <p className="text-[10px] text-white/40">Seller: {item.profiles?.display_name || 'Anonymous'}</p>
    </div>
    <div className="text-right">
      <p className="text-yellow-300 font-black text-sm">50 🪙</p>
      <button className="text-[10px] bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg text-white font-bold transition-all">
        Buy
      </button>
    </div>
  </motion.div>
));

export default function MarketPage() {
  const navigate = useNavigate()
  const { listings, loadListings } = useMarketStore()

  useEffect(() => {
    loadListings()
  }, [loadListings])

  return (
    <div className="relative w-full h-full p-6 overflow-y-auto no-scrollbar">
      <SceneBackground />
      
      <div className="z-20 max-w-lg mx-auto w-full">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/game')} className="text-white/60 text-xl">←</button>
            <h2 className="text-2xl font-black text-white">Market</h2>
          </div>
          <div className="bg-yellow-400/20 px-3 py-1 rounded-full border border-yellow-400/30">
            <span className="text-xs font-bold text-yellow-300">🪙 200</span>
          </div>
        </header>

        <div className="flex flex-col gap-4">
          {listings.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">🏪</p>
              <p className="text-white/30 text-sm">The market is quiet today...</p>
            </div>
          ) : (
            listings.map((l) => (
              <MarketItem key={l.id} item={l} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
