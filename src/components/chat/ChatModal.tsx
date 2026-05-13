import { useState, useRef, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Pet } from '@/types'
import { motion } from 'framer-motion'
// import Anthropic from '@anthropic-ai/sdk' // Removed to fix build errors

interface Props {
  pet: Pet
  onClose: () => void
}

type Message = { role: 'user' | 'assistant', text: string }

export function ChatModal({ pet, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: `Haii! Aku ${pet.name}. Senang sekali bisa ngobrol! ✨` }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    
    const userMsg = input
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setInput('')
    setLoading(true)

    try {
      // For now, we use a more sophisticated mock that simulates the pet's personality
      // In the future, this will call: const response = await fetch('/api/chat', { ... })
      
      setTimeout(() => {
        let responseText = `*hihi* ${userMsg} ya? Aku senang sekali mendengarnya! 💕`
        const { hunger, energy, mood } = pet.stats
        
        if (hunger < 30) {
          responseText = `Aduh... mau jawab "${userMsg}", tapi perutku keroncongan banget... 🥺 lapar...`
        } else if (energy < 30) {
          responseText = `Hoahm... "${userMsg}"? Aku ngantuk banget, mau tidur... 💤`
        } else if (mood < 30) {
          responseText = `Hmph! Males bahas "${userMsg}", aku lagi bad mood! 😤`
        } else if (userMsg.toLowerCase().includes('halo') || userMsg.toLowerCase().includes('hai')) {
          responseText = `Halo juga! Aku ${pet.name}, senang deh kamu menyapa! ✨`
        } else if (userMsg.toLowerCase().includes('makan')) {
          responseText = `Wah, bicara soal makan jadi makin laper nih! 😋`
        }

        setMessages(prev => [...prev, { role: 'assistant', text: responseText }])
        setLoading(false)
      }, 800)

    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, { role: 'assistant', text: `(Koneksi terputus... coba lagi nanti ya!)` }])
      setLoading(false)
    }
  }

  return (
    <Modal title={`Chat with ${pet.name}`} onClose={onClose}>
      <div ref={scrollRef} className="h-64 overflow-y-auto mb-4 flex flex-col gap-3 no-scrollbar scroll-smooth">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                msg.role === 'user' ? 'bg-hagumi-pink text-white rounded-br-none' : 'bg-white/10 text-white/80 rounded-bl-none'
              }`}
            >
              {msg.text}
            </motion.div>
          </div>
        ))}
        {loading && <div className="text-white/30 text-xs animate-pulse ml-2">Pet is thinking...</div>}
      </div>

      <div className="flex gap-2">
        <input 
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder={loading ? "Tunggu sebentar..." : "Say something..."}
          disabled={loading}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-hagumi-pink disabled:opacity-50"
        />
        <button 
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="bg-hagumi-pink px-4 py-2 rounded-xl text-white font-bold text-sm disabled:opacity-50 transition-all"
        >
          Send
        </button>
      </div>
    </Modal>
  )
}

