import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Medal, Crown, Star, TrendingUp, Search } from 'lucide-react'

const LeaderboardPage: React.FC = () => {
  const [filter, setFilter] = useState<'global' | 'friends'>('global')
  const [category, setCategory] = useState<'growth' | 'age' | 'care'>('growth')

  // Mock data
  const topPets = [
    { rank: 1, username: 'SakuraChan', petName: 'Mochi', score: 9850, stage: 'Adult', color: '#ffb7c5' },
    { rank: 2, username: 'YukiNoir', petName: 'Kuro', score: 9420, stage: 'Adult', color: '#2c3e50' },
    { rank: 3, username: 'HaruMizu', petName: 'Matcha', score: 8900, stage: 'Teen', color: '#8fbc8f' },
    { rank: 4, username: 'ZenMaster', petName: 'Bonsai', score: 8550, stage: 'Adult', color: '#4a7c59' },
    { rank: 5, username: 'NekoLover', petName: 'Sushi', score: 8200, stage: 'Teen', color: '#f39c12' },
  ]

  return (
    <div className="min-h-screen bg-[#fdf6e3] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block p-4 bg-white rounded-full shadow-xl mb-6 border-4 border-[#ffb7c5]/20"
          >
            <Trophy className="w-12 h-12 text-[#ffb7c5]" />
          </motion.div>
          <h1 className="text-4xl font-black text-[#5c3d2e] tracking-tight mb-2">Hall of Fame</h1>
          <p className="text-[#8b5e3c]">The most legendary Hagumi pets in the world.</p>
        </header>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Controls */}
          <aside className="w-full md:w-64 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-[#ffb7c5]/10">
              <h3 className="font-bold text-[#5c3d2e] mb-4 flex items-center gap-2">
                <Search className="w-4 h-4 text-[#ffb7c5]" />
                Filters
              </h3>
              <div className="space-y-2">
                <FilterButton 
                  active={filter === 'global'} 
                  onClick={() => setFilter('global')}
                  label="Global"
                />
                <FilterButton 
                  active={filter === 'friends'} 
                  onClick={() => setFilter('friends')}
                  label="Friends Only"
                />
              </div>
              
              <hr className="my-6 border-[#f8edeb]" />

              <h3 className="font-bold text-[#5c3d2e] mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-[#ffb7c5]" />
                Category
              </h3>
              <div className="space-y-2">
                <FilterButton 
                  active={category === 'growth'} 
                  onClick={() => setCategory('growth')}
                  label="Top Growth"
                />
                <FilterButton 
                  active={category === 'age'} 
                  onClick={() => setCategory('age')}
                  label="Oldest Pets"
                />
                <FilterButton 
                  active={category === 'care'} 
                  onClick={() => setCategory('care')}
                  label="Best Care"
                />
              </div>
            </div>

            <div className="bg-[#5c3d2e] p-6 rounded-3xl shadow-lg text-white">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#ffb7c5]" />
                Your Rank
              </h3>
              <p className="text-3xl font-black mb-1">#1,402</p>
              <p className="text-xs text-white/60">Top 15% of all players</p>
            </div>
          </aside>

          {/* Main Leaderboard */}
          <div className="flex-1 space-y-4">
            {/* Podium for top 3 */}
            <div className="grid grid-cols-3 gap-4 mb-8 items-end">
              <PodiumItem entry={topPets[1]} rank={2} height="h-40" />
              <PodiumItem entry={topPets[0]} rank={1} height="h-52" />
              <PodiumItem entry={topPets[2]} rank={3} height="h-32" />
            </div>

            {/* Rest of the list */}
            <div className="bg-white rounded-3xl shadow-sm border-2 border-[#ffb7c5]/10 overflow-hidden">
              {topPets.slice(3).map((pet) => (
                <LeaderboardRow key={pet.rank} pet={pet} />
              ))}
            </div>

            <p className="text-center text-[#8b5e3c] text-sm mt-8 italic">
              Rankings update every 15 minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const FilterButton: React.FC<{ active: boolean; onClick: () => void; label: string }> = ({ 
  active, onClick, label 
}) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-2 rounded-xl text-sm font-bold transition-all ${
      active 
        ? 'bg-[#ffb7c5] text-white' 
        : 'text-[#8b5e3c] hover:bg-[#ffb7c5]/10'
    }`}
  >
    {label}
  </button>
)

const PodiumItem: React.FC<{ entry: any; rank: number; height: string }> = ({ entry, rank, height }) => (
  <div className="flex flex-col items-center">
    <div className="w-16 h-16 rounded-full bg-white border-4 border-[#ffb7c5] mb-2 shadow-lg overflow-hidden flex items-center justify-center">
       <div className="w-12 h-12 rounded-full" style={{ backgroundColor: entry.color }} />
    </div>
    <div className={`w-full ${height} bg-white rounded-t-2xl shadow-sm border-2 border-b-0 border-[#ffb7c5]/20 flex flex-col items-center justify-center p-2 text-center`}>
      {rank === 1 ? <Crown className="w-6 h-6 text-yellow-400 mb-1" /> : <Medal className={`w-6 h-6 mb-1 ${rank === 2 ? 'text-gray-400' : 'text-orange-400'}`} />}
      <p className="font-black text-[#5c3d2e] text-sm truncate w-full">{entry.petName}</p>
      <p className="text-[10px] text-[#8b5e3c] truncate w-full">@{entry.username}</p>
      <p className="text-xs font-bold text-[#ffb7c5] mt-2">{entry.score}</p>
    </div>
  </div>
)

const LeaderboardRow: React.FC<{ pet: any }> = ({ pet }) => (
  <div className="flex items-center gap-4 p-4 border-b border-[#f8edeb] last:border-0 hover:bg-[#f8edeb]/30 transition-colors">
    <span className="w-8 text-center font-black text-[#8b5e3c]">#{pet.rank}</span>
    <div className="w-10 h-10 rounded-full border-2 border-[#ffb7c5]/20 flex-shrink-0" style={{ backgroundColor: pet.color }} />
    <div className="flex-1 min-w-0">
      <h4 className="font-bold text-[#5c3d2e] truncate">{pet.petName}</h4>
      <p className="text-xs text-[#8b5e3c]">@{pet.username}</p>
    </div>
    <div className="text-right">
      <p className="font-black text-[#5c3d2e]">{pet.score}</p>
      <p className="text-[10px] text-[#ffb7c5] font-bold uppercase">{pet.stage}</p>
    </div>
  </div>
)

export default LeaderboardPage
