import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMiniGameStore } from '@/features/minigames/minigameStore'
import { useContentStore } from '@/features/content/contentStore'
import { SceneBackground } from '@/components/layout/SceneBackground'
import { Loading } from '@/shared/feedback/Loading'
import type { MiniGameId, MiniGameDifficulty } from '@/features/minigames/types'

// ─── Game Select Card ─────────────────────────────────

function GameCard({ gameId, onSelect }: { gameId: MiniGameId; onSelect: () => void }) {
  const game = useMiniGameStore((s) => s.getGame(gameId))
  const canPlay = useMiniGameStore((s) => s.canPlayGame(gameId))
  const cooldownRemaining = useMiniGameStore((s) => s.getCooldownRemaining(gameId))
  const highScores = useMiniGameStore((s) => s.getHighScores(gameId))

  if (!game) return null

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={canPlay ? onSelect : undefined}
      className={`glass rounded-2xl p-4 cursor-pointer ${!canPlay ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl">{game.icon}</div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-white">{game.name}</h3>
          <p className="text-[10px] text-white/40 mt-0.5">{game.description}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] text-white/30">⏱️ {game.durationSeconds}s</span>
            <span className="text-[10px] text-white/30">⚡ -{game.energyCost} energy</span>
          </div>
          {highScores.length > 0 && (
            <p className="text-[10px] text-hagumi-pink mt-1">🏆 Best: {highScores[0]}</p>
          )}
        </div>
        {cooldownRemaining > 0 ? (
          <div className="text-right">
            <p className="text-[10px] text-white/30">Cooldown</p>
            <p className="text-xs font-bold text-yellow-400">{formatTime(cooldownRemaining)}</p>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-hagumi-pink/20 flex items-center justify-center">
            <span className="text-hagumi-pink">▶</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Sakura Catch Game ─────────────────────────────────

function SakuraCatchGame({ onEnd }: { onEnd: (input: any) => void }) {
  const [petals, setPetals] = useState<Array<{ id: string; x: number; y: number; speed: number }>>([])
  const [caught, setCaught] = useState(0)
  const [missed, setMissed] = useState(0)
  const { state, updateScore } = useMiniGameStore()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const newPetal = {
        id: crypto.randomUUID(),
        x: Math.random() * (rect.width - 40),
        y: -40,
        speed: 2 + Math.random() * 3,
      }
      setPetals((prev) => [...prev, newPetal])
    }, 800)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setPetals((prev) => {
        const updated = prev.map((p) => ({ ...p, y: p.y + p.speed }))
        const missedCount = updated.filter((p) => p.y > 400).length
        if (missedCount > 0) setMissed((m) => m + missedCount)
        return updated.filter((p) => p.y <= 400)
      })
    }, 50)

    return () => clearInterval(interval)
  }, [])

  const handleCatch = (id: string) => {
    setPetals((prev) => prev.filter((p) => p.id !== id))
    setCaught((c) => c + 1)
    updateScore(caught + 1)
  }

  return (
    <div className="relative w-full h-[400px] glass rounded-2xl overflow-hidden" ref={containerRef}>
      <div className="absolute top-2 left-2 text-xs text-white/50">
        Caught: {caught} | Missed: {missed}
      </div>
      <AnimatePresence>
        {petals.map((petal) => (
          <motion.div
            key={petal.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            style={{ left: petal.x, top: petal.y }}
            className="absolute w-8 h-8 text-2xl cursor-pointer hover:scale-125 transition-transform"
            onClick={() => handleCatch(petal.id)}
          >
            🌸
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// ─── Memory Match Game ─────────────────────────────────

function MemoryMatchGame({ onEnd }: { onEnd: (input: any) => void }) {
  const emojis = ['🌸', '🍣', '🎀', '⭐', '🌙', '💎', '🔥', '💧']
  const [cards, setCards] = useState<Array<{ id: string; emoji: string; isFlipped: boolean; isMatched: boolean }>>([])
  const [flipped, setFlipped] = useState<string[]>([])
  const [pairs, setPairs] = useState(0)
  const [timeUsed, setTimeUsed] = useState(0)
  const { state, updateScore } = useMiniGameStore()

  useEffect(() => {
    const shuffled = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, i) => ({ id: crypto.randomUUID(), emoji, isFlipped: false, isMatched: false }))
    setCards(shuffled)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setTimeUsed((t) => t + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleCardClick = (id: string) => {
    if (flipped.length === 2) return
    const card = cards.find((c) => c.id === id)
    if (!card || card.isFlipped || card.isMatched) return

    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, isFlipped: true } : c)))
    setFlipped((prev) => [...prev, id])

    if (flipped.length === 1) {
      const firstCard = cards.find((c) => c.id === flipped[0])
      if (firstCard?.emoji === card.emoji) {
        setTimeout(() => {
          setCards((prev) => prev.map((c) => (c.id === id || c.id === flipped[0] ? { ...c, isMatched: true } : c)))
          setPairs((p) => p + 1)
          setFlipped([])
          updateScore(pairs + 1)
        }, 500)
      } else {
        setTimeout(() => {
          setCards((prev) => prev.map((c) => (c.id === id || c.id === flipped[0] ? { ...c, isFlipped: false } : c)))
          setFlipped([])
        }, 1000)
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-xs text-white/50">
        <span>Pairs: {pairs}/8</span>
        <span>Time: {timeUsed}s</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {cards.map((card) => (
          <motion.div
            key={card.id}
            whileHover={{ scale: card.isMatched ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCardClick(card.id)}
            className={`aspect-square rounded-xl flex items-center justify-center text-3xl cursor-pointer transition-all ${
              card.isFlipped || card.isMatched ? 'glass' : 'bg-white/5'
            }`}
          >
            {card.isFlipped || card.isMatched ? card.emoji : '?'}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Feeding Frenzy Game ───────────────────────────────

function FeedingFrenzyGame({ onEnd }: { onEnd: (input: any) => void }) {
  const [foods, setFoods] = useState<Array<{ id: string; x: number; y: number }>>([])
  const [fed, setFed] = useState(0)
  const [missed, setMissed] = useState(0)
  const [combo, setCombo] = useState(0)
  const { state, updateScore } = useMiniGameStore()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const newFood = {
        id: crypto.randomUUID(),
        x: Math.random() * (rect.width - 40),
        y: Math.random() * (rect.height - 40),
      }
      setFoods((prev) => [...prev, newFood])
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleFeed = (id: string) => {
    setFoods((prev) => prev.filter((f) => f.id !== id))
    setFed((f) => f + 1)
    setCombo((c) => c + 1)
    updateScore(fed * 50 + combo * 20)
  }

  const handleMiss = (id: string) => {
    setFoods((prev) => prev.filter((f) => f.id !== id))
    setMissed((m) => m + 1)
    setCombo(0)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-xs text-white/50">
        <span>Fed: {fed}</span>
        <span>Combo: {combo}x</span>
      </div>
      <div className="relative w-full h-[300px] glass rounded-2xl overflow-hidden" ref={containerRef}>
        <AnimatePresence>
          {foods.map((food) => (
            <motion.div
              key={food.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              style={{ left: food.x, top: food.y }}
              className="absolute w-10 h-10 text-2xl cursor-pointer"
            >
              <button
                onClick={() => handleFeed(food.id)}
                onContextMenu={(e) => { e.preventDefault(); handleMiss(food.id) }}
                className="w-full h-full"
              >
                🍖
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <p className="text-[10px] text-white/30 text-center">Click to feed, right-click to skip</p>
    </div>
  )
}

// ─── Hide & Seek Game ───────────────────────────────────

function HideSeekGame({ onEnd }: { onEnd: (input: any) => void }) {
  const [hidingSpots, setHidingSpots] = useState<Array<{ id: string; hasPet: boolean; revealed: boolean }>>([])
  const [found, setFound] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const { state, updateScore } = useMiniGameStore()

  useEffect(() => {
    const spots = Array.from({ length: 9 }, (_, i) => ({
      id: crypto.randomUUID(),
      hasPet: i < 3,
      revealed: false,
    }))
    setHidingSpots(spots.sort(() => Math.random() - 0.5))
  }, [])

  const handleSpotClick = (id: string) => {
    const spot = hidingSpots.find((s) => s.id === id)
    if (!spot || spot.revealed) return

    setHidingSpots((prev) => prev.map((s) => (s.id === id ? { ...s, revealed: true } : s)))
    if (spot.hasPet) {
      setFound((f) => f + 1)
      updateScore(found + 1)
    }
  }

  const useHint = () => {
    const unrevealed = hidingSpots.filter((s) => s.hasPet && !s.revealed)
    if (unrevealed.length > 0) {
      setHintsUsed((h) => h + 1)
      setHidingSpots((prev) => prev.map((s) => (s.id === unrevealed[0].id ? { ...s, revealed: true } : s)))
      setFound((f) => f + 1)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-xs text-white/50">
        <span>Found: {found}/3</span>
        <span>Hints: {hintsUsed}</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {hidingSpots.map((spot) => (
          <motion.div
            key={spot.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSpotClick(spot.id)}
            className={`aspect-square rounded-xl flex items-center justify-center text-3xl cursor-pointer transition-all ${
              spot.revealed ? 'glass' : 'bg-white/5'
            }`}
          >
            {spot.revealed ? (spot.hasPet ? '🐾' : '🌳') : '?'}
          </motion.div>
        ))}
      </div>
      <button
        onClick={useHint}
        className="w-full py-2 text-xs font-bold bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"
      >
        💡 Use Hint
      </button>
    </div>
  )
}

// ─── Pet Dance Game ─────────────────────────────────────

function PetDanceGame({ onEnd }: { onEnd: (input: any) => void }) {
  const [beats, setBeats] = useState<Array<{ id: string; time: number; hit: boolean }>>([])
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)
  const [perfectHits, setPerfectHits] = useState(0)
  const { state, updateScore } = useMiniGameStore()

  useEffect(() => {
    const interval = setInterval(() => {
      const newBeat = {
        id: crypto.randomUUID(),
        time: Date.now(),
        hit: false,
      }
      setBeats((prev) => [...prev.slice(-4), newBeat])
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleBeat = (id: string) => {
    const beat = beats.find((b) => b.id === id)
    if (!beat || beat.hit) return

    const timeDiff = Date.now() - beat.time
    const isPerfect = timeDiff < 200

    setBeats((prev) => prev.map((b) => (b.id === id ? { ...b, hit: true } : b)))
    setHits((h) => h + 1)
    if (isPerfect) setPerfectHits((p) => p + 1)
    updateScore(hits * 700 + perfectHits * 30)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-xs text-white/50">
        <span>Hits: {hits}</span>
        <span>Perfect: {perfectHits}</span>
      </div>
      <div className="flex justify-center gap-4">
        {beats.map((beat) => (
          <motion.button
            key={beat.id}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleBeat(beat.id)}
            disabled={beat.hit}
            className={`w-16 h-16 rounded-full text-2xl font-bold transition-all ${
              beat.hit ? 'bg-hagumi-pink text-white' : 'bg-white/10 text-white/50'
            }`}
          >
            {beat.hit ? '✓' : '🎵'}
          </motion.button>
        ))}
      </div>
      <p className="text-[10px] text-white/30 text-center">Tap when the beat reaches the center!</p>
    </div>
  )
}

// ─── Game Component Router ─────────────────────────────

function GameComponent({ gameId, onEnd }: { gameId: MiniGameId; onEnd: (input: any) => void }) {
  switch (gameId) {
    case 'sakura-catch':
      return <SakuraCatchGame onEnd={onEnd} />
    case 'memory-match':
      return <MemoryMatchGame onEnd={onEnd} />
    case 'feeding-frenzy':
      return <FeedingFrenzyGame onEnd={onEnd} />
    case 'hide-seek':
      return <HideSeekGame onEnd={onEnd} />
    case 'pet-dance':
      return <PetDanceGame onEnd={onEnd} />
    default:
      return null
  }
}

// ─── Main MiniGames Page ───────────────────────────────

export default function MiniGamesPage() {
  const { state, startGame, endGame } = useMiniGameStore()
  const { updateProgress } = useContentStore()
  const [selectedGame, setSelectedGame] = useState<MiniGameId | null>(null)
  const [difficulty, setDifficulty] = useState<MiniGameDifficulty>('easy')
  const [gameInput, setGameInput] = useState<any>(null)
  const [showResults, setShowResults] = useState(false)
  const [rewards, setRewards] = useState<any[]>([])

  const games: MiniGameId[] = ['sakura-catch', 'memory-match', 'feeding-frenzy', 'hide-seek', 'pet-dance']

  const handleStartGame = (gameId: MiniGameId) => {
    setSelectedGame(gameId)
    startGame(gameId, difficulty)
  }

  const handleEndGame = (input: any) => {
    setGameInput(input)
    const earnedRewards = endGame(input)
    setRewards(earnedRewards)
    setShowResults(true)
    updateProgress('games_played', 1)
  }

  const handleBack = () => {
    setSelectedGame(null)
    setShowResults(false)
    setGameInput(null)
    setRewards([])
  }

  return (
    <div className="relative w-full h-full overflow-y-auto no-scrollbar">
      <SceneBackground />
      <div className="z-20 relative max-w-lg mx-auto w-full p-4 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-white">Mini Games</h1>
          {selectedGame && (
            <button onClick={handleBack} className="text-sm text-white/50 hover:text-white">
              ← Back
            </button>
          )}
        </div>

        {/* Game Selection */}
        {!selectedGame && (
          <div className="space-y-3">
            {games.map((gameId) => (
              <GameCard key={gameId} gameId={gameId} onSelect={() => handleStartGame(gameId)} />
            ))}
          </div>
        )}

        {/* Active Game */}
        {selectedGame && !showResults && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{useMiniGameStore((s) => s.getGame(selectedGame))?.name}</h2>
              <span className="text-xs text-white/30">Score: {state.score}</span>
            </div>
            <GameComponent gameId={selectedGame} onEnd={handleEndGame} />
            <button
              onClick={() => handleEndGame(gameInput || {})}
              className="w-full py-3 text-sm font-bold bg-hagumi-pink hover:bg-pink-500 text-white rounded-2xl"
            >
              Finish Game
            </button>
          </div>
        )}

        {/* Results */}
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 text-center space-y-4"
          >
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-white">Game Complete!</h2>
            <p className="text-3xl font-black text-gradient">{state.score} points</p>
            {rewards.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-bold text-white/70">Rewards:</p>
                {rewards.map((reward, i) => (
                  <div key={i} className="text-sm text-white">
                    {reward.type === 'coins' && `💰 ${reward.amount} coins`}
                    {reward.type === 'gems' && `💎 ${reward.amount} gems`}
                    {reward.type === 'item' && `🎁 ${reward.itemId}`}
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={handleBack}
              className="w-full py-3 text-sm font-bold bg-hagumi-pink hover:bg-pink-500 text-white rounded-2xl"
            >
              Back to Games
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}