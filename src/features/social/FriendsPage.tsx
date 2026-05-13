import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSocialStore } from './socialStore'
import { 
  Users, UserPlus, Search, Check, X, 
  Trash2, MessageCircle 
} from 'lucide-react'
import { Friend, FriendRequest } from './types'

const FriendsPage: React.FC = () => {
  const { 
    friends, friendRequests, searchResults, 
    loadFriends, loadFriendRequests,
    searchUsers, sendFriendRequest, acceptFriendRequest,
    rejectFriendRequest, removeFriend 
  } = useSocialStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends')

  useEffect(() => {
    loadFriends()
    loadFriendRequests()
  }, [loadFriends, loadFriendRequests])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchUsers(searchQuery)
    setActiveTab('search')
  }

  return (
    <div className="min-h-screen bg-[#fdf6e3] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#5c3d2e] flex items-center gap-2">
              <Users className="w-8 h-8 text-[#ffb7c5]" />
              Social Hub
            </h1>
            <p className="text-[#8b5e3c]">Connect with other pet parents!</p>
          </div>

          <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username..."
              className="w-full bg-white border-2 border-[#ffb7c5] rounded-full py-2 px-10 focus:outline-none focus:ring-2 focus:ring-[#ffb7c5]/50 text-[#5c3d2e]"
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-[#8b5e3c]" />
            <button 
              type="submit"
              className="absolute right-2 top-1.5 bg-[#ffb7c5] text-white px-4 py-1 rounded-full text-sm font-bold hover:bg-[#ff9aad] transition-colors"
            >
              Search
            </button>
          </form>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <TabButton 
            active={activeTab === 'friends'} 
            onClick={() => setActiveTab('friends')}
            label="Friends"
            count={friends.length}
          />
          <TabButton 
            active={activeTab === 'requests'} 
            onClick={() => setActiveTab('requests')}
            label="Requests"
            count={friendRequests.length}
          />
          {searchResults.length > 0 && (
            <TabButton 
              active={activeTab === 'search'} 
              onClick={() => setActiveTab('search')}
              label="Results"
            />
          )}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'friends' && (
            <motion.div
              key="friends"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {friends.length > 0 ? (
                friends.map((friend) => (
                  <FriendCard key={friend.id} friend={friend} onRemove={removeFriend} />
                ))
              ) : (
                <EmptyState icon={<Users />} message="No friends yet. Time to explore!" />
              )}
            </motion.div>
          )}

          {activeTab === 'requests' && (
            <motion.div
              key="requests"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {friendRequests.length > 0 ? (
                friendRequests.map((req) => (
                  <RequestCard 
                    key={req.id} 
                    request={req} 
                    onAccept={acceptFriendRequest}
                    onReject={rejectFriendRequest}
                  />
                ))
              ) : (
                <EmptyState icon={<UserPlus />} message="No pending requests." />
              )}
            </motion.div>
          )}

          {activeTab === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {searchResults.map((user) => (
                <SearchResultCard 
                  key={user.id} 
                  user={user} 
                  onAdd={sendFriendRequest}
                  isFriend={friends.some(f => f.userId === user.userId)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

const TabButton: React.FC<{ active: boolean; onClick: () => void; label: string; count?: number }> = ({ 
  active, onClick, label, count 
}) => (
  <button
    onClick={onClick}
    className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
      active 
        ? 'bg-[#5c3d2e] text-white shadow-lg' 
        : 'bg-white text-[#8b5e3c] hover:bg-[#ffb7c5]/10'
    }`}
  >
    {label} {count !== undefined && <span className="ml-2 opacity-60">({count})</span>}
  </button>
)

const FriendCard: React.FC<{ friend: Friend; onRemove: (id: string) => void }> = ({ friend, onRemove }) => (
  <div className="bg-white p-4 rounded-2xl shadow-sm border-2 border-[#ffb7c5]/20 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ffb7c5] to-[#f8edeb] flex items-center justify-center border-4 border-white overflow-hidden shadow-inner">
      {friend.avatarUrl ? (
        <img src={friend.avatarUrl} alt={friend.displayName} className="w-full h-full object-cover" />
      ) : (
        <Users className="w-8 h-8 text-white" />
      )}
    </div>
    <div className="flex-1">
      <h3 className="font-bold text-[#5c3d2e]">{friend.displayName}</h3>
      <p className="text-xs text-[#8b5e3c]">@{friend.nickname}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${friend.isOnline ? 'bg-green-400' : 'bg-gray-300'}`} />
        <span className="text-[10px] uppercase font-bold tracking-wider text-[#8b5e3c]">
          {friend.isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
    </div>
    <div className="flex gap-1">
      <button className="p-2 text-[#8b5e3c] hover:bg-[#ffb7c5]/10 rounded-full transition-colors">
        <MessageCircle className="w-5 h-5" />
      </button>
      <button 
        onClick={() => onRemove(friend.id)}
        className="p-2 text-red-400 hover:bg-red-50 rounded-full transition-colors"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  </div>
)

const RequestCard: React.FC<{ request: FriendRequest; onAccept: (id: string) => void; onReject: (id: string) => void }> = ({ 
  request, onAccept, onReject 
}) => (
  <div className="bg-white p-4 rounded-2xl shadow-sm border-2 border-[#ffb7c5]/20 flex items-center justify-between gap-4">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-[#f8edeb] flex items-center justify-center text-[#ffb7c5]">
        <UserPlus className="w-6 h-6" />
      </div>
      <div>
        <h3 className="font-bold text-[#5c3d2e]">{request.fromDisplayName}</h3>
        <p className="text-xs text-[#8b5e3c]">wants to be friends!</p>
      </div>
    </div>
    <div className="flex gap-2">
      <button 
        onClick={() => onAccept(request.id)}
        className="bg-[#ffb7c5] text-white p-2 rounded-full hover:bg-[#ff9aad] transition-colors shadow-sm"
      >
        <Check className="w-5 h-5" />
      </button>
      <button 
        onClick={() => onReject(request.id)}
        className="bg-gray-100 text-[#8b5e3c] p-2 rounded-full hover:bg-gray-200 transition-colors shadow-sm"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  </div>
)

const SearchResultCard: React.FC<{ user: Friend; onAdd: (id: string) => void; isFriend: boolean }> = ({ 
  user, onAdd, isFriend 
}) => (
  <div className="bg-white p-4 rounded-2xl shadow-sm border-2 border-[#ffb7c5]/20 flex items-center justify-between gap-4">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-[#ffb7c5]/10 flex items-center justify-center text-[#ffb7c5]">
        <Users className="w-6 h-6" />
      </div>
      <div>
        <h3 className="font-bold text-[#5c3d2e]">{user.displayName}</h3>
        <p className="text-xs text-[#8b5e3c]">@{user.nickname}</p>
      </div>
    </div>
    <button 
      disabled={isFriend}
      onClick={() => onAdd(user.userId)}
      className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
        isFriend 
          ? 'bg-gray-100 text-gray-400 cursor-default' 
          : 'bg-[#ffb7c5] text-white hover:bg-[#ff9aad] shadow-sm'
      }`}
    >
      {isFriend ? 'Friend' : 'Add Friend'}
    </button>
  </div>
)

const EmptyState: React.FC<{ icon: React.ReactNode; message: string }> = ({ icon, message }) => (
  <div className="col-span-full py-12 flex flex-col items-center justify-center text-[#8b5e3c] bg-white/50 rounded-3xl border-2 border-dashed border-[#ffb7c5]/20">
    <div className="w-16 h-16 mb-4 opacity-20">{icon}</div>
    <p className="font-medium">{message}</p>
  </div>
)

export default FriendsPage
