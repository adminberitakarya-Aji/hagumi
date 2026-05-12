import React from 'react'
import { motion } from 'framer-motion'
import { 
  Rss, Heart, MessageCircle, Share2, 
  TrendingUp, Sparkles, User, Gift 
} from 'lucide-react'

const FeedPage: React.FC = () => {
  const feedItems = [
    {
      id: '1', user: 'SakuraChan', action: 'pet_growth', 
      content: 'Mochi just reached the Adult stage! 🌸',
      timestamp: '2 hours ago', likes: 24, comments: 5,
      image: null, type: 'achievement'
    },
    {
      id: '2', user: 'YukiNoir', action: 'visit', 
      content: 'Visited Kuro and left some special snacks! 🍖',
      timestamp: '4 hours ago', likes: 12, comments: 2,
      image: null, type: 'social'
    },
    {
      id: '3', user: 'System', action: 'event', 
      content: 'Spring Festival has started! Visit your friends to earn Sakura Petals. 🌸✨',
      timestamp: '6 hours ago', likes: 156, comments: 42,
      image: null, type: 'announcement'
    },
    {
      id: '4', user: 'HaruMizu', action: 'genetics', 
      content: 'Found a rare mutation! My pet now has glowing wings! 🦋',
      timestamp: '8 hours ago', likes: 89, comments: 15,
      image: null, type: 'achievement'
    }
  ]

  return (
    <div className="min-h-screen bg-[#fdf6e3] p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-[#5c3d2e] flex items-center gap-2">
            <Rss className="w-8 h-8 text-[#ffb7c5]" />
            Social Feed
          </h1>
          <p className="text-[#8b5e3c]">See what your friends and their pets are up to.</p>
        </header>

        {/* Post Creation (Simulated) */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border-2 border-[#ffb7c5]/10 mb-8 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#f8edeb] flex items-center justify-center text-[#ffb7c5]">
            <User className="w-6 h-6" />
          </div>
          <input 
            type="text" 
            placeholder="Share an update about your pet..." 
            className="flex-1 bg-[#fdf6e3] rounded-2xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffb7c5]/50"
          />
          <button className="bg-[#ffb7c5] text-white p-2 rounded-2xl hover:bg-[#ff9aad] transition-colors">
            <Sparkles className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {feedItems.map((item, idx) => (
            <FeedItem key={item.id} item={item} index={idx} />
          ))}
        </div>
      </div>
    </div>
  )
}

const FeedItem: React.FC<{ item: any; index: number }> = ({ item, index }) => {
  const getIcon = () => {
    switch (item.type) {
      case 'achievement': return <TrendingUp className="w-4 h-4" />
      case 'social': return <Gift className="w-4 h-4" />
      case 'announcement': return <Sparkles className="w-4 h-4" />
      default: return <Rss className="w-4 h-4" />
    }
  }

  const getColor = () => {
    switch (item.type) {
      case 'achievement': return 'bg-green-100 text-green-600'
      case 'social': return 'bg-purple-100 text-purple-600'
      case 'announcement': return 'bg-blue-100 text-blue-600'
      default: return 'bg-[#f8edeb] text-[#ffb7c5]'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-3xl shadow-sm border-2 border-[#ffb7c5]/10 overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ffb7c5] to-[#f8edeb] border-2 border-white shadow-sm flex items-center justify-center font-bold text-white">
              {item.user[0]}
            </div>
            <div>
              <h4 className="font-bold text-[#5c3d2e] text-sm">{item.user}</h4>
              <p className="text-[10px] text-[#8b5e3c] font-medium">{item.timestamp}</p>
            </div>
          </div>
          <div className={`p-2 rounded-xl ${getColor()}`}>
            {getIcon()}
          </div>
        </div>

        <p className="text-[#5c3d2e] leading-relaxed mb-6">
          {item.content}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-[#f8edeb]">
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-1.5 text-[#8b5e3c] hover:text-[#ffb7c5] transition-colors group">
              <Heart className="w-5 h-5 group-hover:fill-current" />
              <span className="text-xs font-bold">{item.likes}</span>
            </button>
            <button className="flex items-center gap-1.5 text-[#8b5e3c] hover:text-[#5c3d2e] transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span className="text-xs font-bold">{item.comments}</span>
            </button>
          </div>
          <button className="text-[#8b5e3c] hover:text-[#5c3d2e] transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default FeedPage
