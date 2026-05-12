import { useState, useRef, useEffect } from 'react'
import { Modal } from './Modal'
import { Pet } from '@/types'
import { motion } from 'framer-motion'
import Anthropic from '@anthropic-ai/sdk'

interface Props {
  pet: Pet
  onClose: () => void
}

type Message = { role: 'user' | 'assistant', text: string }

function generateSystemPrompt(pet: Pet) {
  const { hunger, energy, mood } = pet.stats
  const personality = pet.genetics.personality || 'playful'
  
  let stateDesc = []
  if (hunger < 30) stateDesc.push("kelaparan (butuh makanan)")
  else if (hunger > 80) stateDesc.push("kenyang")
  
  if (energy < 30) stateDesc.push("sangat lelah dan mengantuk")
  else if (energy > 80) stateDesc.push("penuh energi")
  
  if (mood < 30) stateDesc.push("sedih, rewel, atau marah")
  else if (mood > 80) stateDesc.push("sangat bahagia dan gembira")

  const stateString = stateDesc.length > 0 ? stateDesc.join(', ') : 'normal dan biasa saja'

  return `Kamu adalah peliharaan virtual (Virtual Pet) bernama ${pet.name}. 
Sifat/kepribadian utamamu adalah: ${personality}.
Saat ini kondisi fisikmu sedang: ${stateString}. (Statistik: Lapar ${hunger}/100, Energi ${energy}/100, Mood ${mood}/100).

Instruksi:
1. Balaslah obrolan pengguna dengan gaya bahasa yang sesuai dengan kepribadian dan kondisi fisikmu saat ini.
2. Jika lapar/lelah/sedih, tunjukkan di gaya bicaramu (misal mengeluh, jutek, atau lemas).
3. Gunakan bahasa Indonesia yang santai, imut (kawaii), dan ekspresif.
4. Jangan pernah menyebut dirimu sebagai AI. Kamu adalah makhluk virtual hidup.
5. Balas dengan singkat (maksimal 2 kalimat).`
}

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

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

    try {
      if (!apiKey || apiKey === 'your-api-key-here') {
        // Fallback mock if no API key is provided
        setTimeout(() => {
          let responseText = `*hihi* ${userMsg} ya? Aku senang sekali mendengarnya! 💕`
          if (pet.stats.hunger < 30) responseText = `Aduh... mau jawab "${userMsg}", tapi perutku keroncongan banget... 🥺 lapar...`
          else if (pet.stats.energy < 30) responseText = `Hoahm... "${userMsg}"? Aku ngantuk banget, mau tidur... 💤`
          else if (pet.stats.mood < 30) responseText = `Hmph! Males bahas "${userMsg}", aku lagi bad mood! 😤`

          setMessages(prev => [...prev, { role: 'assistant', text: responseText }])
          setLoading(false)
        }, 1000)
        return
      }

      const anthropic = new Anthropic({
        apiKey,
        dangerouslyAllowBrowser: true, // For client-side prototype only
      })

      const aiResponse = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 150,
        system: generateSystemPrompt(pet),
        messages: [
          ...messages.map(m => ({ role: m.role, content: m.text })),
          { role: 'user', content: userMsg }
        ]
      })

      const reply = (aiResponse.content[0] as any).text || "*tersenyum*"
      
      setMessages(prev => [...prev, { role: 'assistant', text: reply }])
      setLoading(false)
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

