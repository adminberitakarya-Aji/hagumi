import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { SceneBackground } from '@/components/layout/SceneBackground'
import { useSocialStore } from '@/features/social/socialStore'
import type { ChatMessage } from '@/features/social/types'

export function SocialFeed() {
  const { chatMessages, sendChatMessage, chatFilter } = useSocialStore()
  const [message, setMessage] = useState('')
  const [posts, setPosts] = useState<any[]>([])
  const [filter, setFilter] = useState<'recent' | 'trending' | 'popular'>('recent')

  // Mock posts data
  const MOCK_POSTS = [
    {
      id: '1',
      userId: 'user2',
      displayName: 'SakuraChan',
      avatarUrl: null,
      content: 'Just hatched my first legendary pet! 🎉',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      likes: 42,
      comments: 8,
      shares: 3,
      type: 'achievement',
      tags: ['pet', 'legendary', 'first'],
    },
    {
      id: '2',
      userId: 'user3',
      displayName: 'YukiNoir',
      avatarUrl: null,
      content: 'My Kuro reached adult stage! Time to breed! 🐱',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      likes: 28,
      comments: 12,
      shares: 5,
      type: 'milestone',
      tags: ['pet', 'growth', 'breeding'],
    },
    {
      id: '3',
      userId: 'user4',
      displayName: 'HaruMizu',
      avatarUrl: null,
      content: 'Looking for friends to play with! 🎮',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      likes: 15,
      comments: 3,
      shares: 2,
      type: 'social',
      tags: ['social', 'friends'],
    },
    {
      id: '4',
      userId: 'user5',
      displayName: 'Matcha',
      avatarUrl: null,
      content: 'Anyone want to trade? Have some rare items! 🎁',
      timestamp: new Date(Date.now() - 2592000000).toISOString(),
      likes: 56,
      comments: 24,
      shares: 12,
      type: 'trade',
      tags: ['trade', 'items', 'rare'],
    },
    {
      id: '5',
      userId: 'user6',
      displayName: 'Hana',
      avatarUrl: null,
      content: 'Just discovered a new mutation! 🧬',
      timestamp: new Date(Date.now() - 1209600000).toISOString(),
      likes: 89,
      comments: 31,
      shares: 7,
      type: 'discovery',
      tags: ['genetics', 'mutation', 'rare'],
    },
  ]

  useEffect(() => {
    // Load posts from Supabase
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      // Try to load from Supabase
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      if (data && data.length > 0) {
        setPosts(data)
      } else {
        // Fallback to mock data
        setPosts(MOCK_POSTS)
      }
    } catch (err) {
      console.warn('[SocialFeed] Using mock data (Supabase unavailable)')
      setPosts(MOCK_POSTS)
    }
  }

  const handleLike = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    )
  }

  const handleComment = (postId: string, comment: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, comments: post.comments + 1 } : post
      )
    )
  }

  const handleShare = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, shares: post.shares + 1 } : post
      )
    )
  }

  const filteredPosts = posts.filter(post => {
    if (filter === 'trending') {
      return post.likes > 20
    }
    if (filter === 'popular') {
      return post.shares > 5
    }
    return true
  })

  return (
    <div className="relative w-full h-full overflow-y-auto no-scrollbar">
      <SceneBackground />
      
      <div className="z-20 relative max-w-lg mx-auto w-full p-4 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-white">Social Feed</h1>
          <span className="text-xs text-white/30">{posts.length} posts</span>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 bg-white/5 rounded-2xl p-1">
          {(['recent', 'trending', 'popular'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                filter === f ? 'bg-hagumi-pink text-white shadow-lg' : 'text-white/50 hover:text-white/70'
              }`}
            >
              {f === 'recent' ? '📰 Recent' : f === 'trending' ? '🔥 Trending' : '🔥 Popular'}
            </button>
          ))}
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📰</p>
              <p className="text-white/30 text-sm mb-2">No posts yet</p>
              <p className="text-white/20 text-xs">Be the first to share something!</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="glass rounded-2xl p-4"
                  >
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-hagumi-pink to-purple-400 flex items-center justify-center text-white font-bold text-xs">
                        {post.displayName[0]}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white">{post.displayName}</p>
                        <p className="text-[10px] text-white/40">
                          {new Date(post.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-white/30">
                          {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-sm text-white/90 mb-3">{post.content}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 rounded-full bg-white/10 text-white/60 text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Interactions */}
                    <div className="flex items-center gap-4 pt-3 border-t border-white/10">
                      <button
                        onClick={() => handleLike(post.id)}
                        className="flex items-center gap-1 text-white/60 hover:text-pink-400 transition-colors"
                      >
                        <span className="text-sm">❤️ {post.likes}</span>
                      </button>
                      <button
                        onClick={() => handleComment(post.id, '')}
                        className="flex items-center gap-1 text-white/60 hover:text-blue-400 transition-colors"
                      >
                        <span className="text-sm">💬 {post.comments}</span>
                      </button>
                      <button
                        onClick={() => handleShare(post.id)}
                        className="flex items-center gap-1 text-white/60 hover:text-green-400 transition-colors"
                      >
                        <span className="text-sm">🔗 {post.shares}</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}