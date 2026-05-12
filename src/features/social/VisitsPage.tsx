import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSocialStore } from './socialStore'
import { MapPin, Clock, Star, Gift, Heart, MessageSquare, ArrowRight } from 'lucide-react'

const VisitsPage: React.FC = () => {
  const { recentVisitors, isLoading, recordVisit } = useSocialStore()

  // For demo/mock purposes
  const mockVisitors = [
    { id: 'v1', userId: 'user2', displayName: 'SakuraChan', petName: 'Mochi', visitedAt: new Date(Date.now() - 3600000).toISOString(), message: 'Your pet is so cute! 🌸', reaction: '❤️' },
    { id: 'v2', userId: 'user3', displayName: 'YukiNoir', petName: 'Kuro', visitedAt: new Date(Date.now() - 86400000).toISOString(), message: 'Left some snacks!', reaction: '⭐' },
    { id: 'v3', userId: 'user4', displayName: 'HaruMizu', petName: 'Matcha', visitedAt: new Date(Date.now() - 172800000).toISOString(), message: 'Great genetics!', reaction: '👍' },
  ]

  const displayVisitors = recentVisitors.length > 0 ? recentVisitors : mockVisitors

  return (
    <div className="min-h-screen bg-[#fdf6e3] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[#5c3d2e] flex items-center gap-2">
            <MapPin className="w-8 h-8 text-[#ffb7c5]" />
            Recent Visitors
          </h1>
          <p className="text-[#8b5e3c]">See who stopped by to play with your pet!</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section>
            <h2 className="text-xl font-bold text-[#5c3d2e] mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#ffb7c5]" />
              Visit History
            </h2>
            <div className="space-y-4">
              {displayVisitors.map((visitor, idx) => (
                <VisitorCard key={visitor.id} visitor={visitor} index={idx} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#5c3d2e] mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5 text-[#ffb7c5]" />
              Host Rewards
            </h2>
            <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-[#ffb7c5]/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-[#ffb7c5]/10 flex items-center justify-center text-[#ffb7c5]">
                  <Star className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#8b5e3c]">Total Visits Received</p>
                  <p className="text-3xl font-black text-[#5c3d2e]">12</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <RewardItem label="Popularity Points" value="+120" />
                <RewardItem label="Care Bonus" value="+50" />
                <RewardItem label="Social Coins" value="240" />
              </div>

              <button className="w-full mt-8 bg-[#5c3d2e] text-white py-3 rounded-2xl font-bold shadow-lg hover:bg-[#462e23] transition-all flex items-center justify-center gap-2">
                Claim Weekly Bonus
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

const VisitorCard: React.FC<{ visitor: any; index: number }> = ({ visitor, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    className="bg-white p-4 rounded-2xl shadow-sm border-2 border-[#ffb7c5]/10 flex items-start gap-4"
  >
    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ffb7c5] to-[#f8edeb] flex-shrink-0 flex items-center justify-center font-bold text-white shadow-sm">
      {visitor.displayName[0]}
    </div>
    <div className="flex-1">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-[#5c3d2e]">{visitor.displayName}</h3>
        <span className="text-[10px] text-[#8b5e3c] font-medium bg-[#f8edeb] px-2 py-0.5 rounded-full uppercase">
          {new Date(visitor.visitedAt).toLocaleDateString()}
        </span>
      </div>
      <p className="text-xs text-[#8b5e3c] mb-2">Visited with <span className="font-bold">{visitor.petName}</span></p>
      
      {visitor.message && (
        <div className="bg-[#fdf6e3] p-2 rounded-xl text-sm text-[#5c3d2e] flex gap-2 items-start mb-2 italic">
          <MessageSquare className="w-4 h-4 text-[#ffb7c5] flex-shrink-0 mt-0.5" />
          "{visitor.message}"
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="text-lg">{visitor.reaction}</span>
        <button className="text-[10px] font-bold text-[#ffb7c5] hover:underline uppercase tracking-wider">
          Visit Back
        </button>
      </div>
    </div>
  </motion.div>
)

const RewardItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-[#f8edeb] last:border-0">
    <span className="text-[#8b5e3c] text-sm">{label}</span>
    <span className="font-bold text-[#5c3d2e]">{value}</span>
  </div>
)

export default VisitsPage
