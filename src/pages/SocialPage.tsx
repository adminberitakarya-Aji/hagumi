import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FriendsPage from '@/features/social/FriendsPage'
import VisitsPage from '@/features/social/VisitsPage'
import FeedPage from '@/features/social/FeedPage'
import { Users, Rss, MapPin, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type SocialTab = 'feed' | 'friends' | 'visits'

const SocialPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SocialTab>('feed')
  const navigate = useNavigate()

  const tabs = [
    { id: 'feed', label: 'Feed', icon: <Rss className="w-5 h-5" /> },
    { id: 'friends', label: 'Friends', icon: <Users className="w-5 h-5" /> },
    { id: 'visits', label: 'Visits', icon: <MapPin className="w-5 h-5" /> },
  ]

  return (
    <div className="min-h-screen bg-[#fdf6e3] pb-20">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#ffb7c5]/20 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('/game')}
            className="p-2 hover:bg-[#ffb7c5]/10 rounded-full transition-colors text-[#5c3d2e]"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="flex bg-[#fdf6e3] rounded-full p-1 border border-[#ffb7c5]/10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SocialTab)}
                className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-[#ffb7c5] text-white shadow-sm' 
                    : 'text-[#8b5e3c] hover:bg-[#ffb7c5]/10'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="w-10" /> {/* Spacer */}
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <AnimatePresence mode="wait">
          {activeTab === 'feed' && (
            <motion.div
              key="feed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <FeedPage />
            </motion.div>
          )}
          {activeTab === 'friends' && (
            <motion.div
              key="friends"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <FriendsPage />
            </motion.div>
          )}
          {activeTab === 'visits' && (
            <motion.div
              key="visits"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <VisitsPage />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default SocialPage