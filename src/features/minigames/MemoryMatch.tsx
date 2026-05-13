import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameEngine } from '@/lib/gameEngine'
import type { GameType } from '@/types/game'

interface MemoryCard {
  id: number
  emoji: string
  isFlipped: boolean
  isMatched: boolean
}

const EMOJIS = ['🐱', '🐶', '🐰', '🦊', '🐼', '🐨', '🐯', '🦁']

export function MemoryMatch() {
  const [gameEngine] = useState<GameEngine>(() => {
    const engine = new GameEngine('memory_match' as GameType, 'user1', 'pet1')
    return engine
  })
  const [cards, setCards] = useState<MemoryCard[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [moves, setMoves] = useState(0)
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameover' | 'victory'>('menu')
  const [timeRemaining, setTimeRemaining] = useState(90)
  const [isProcessing, setIsProcessing] = useState(false)

  // Start game
  const startGame = () => {
    gameEngine.start()
    setGameState('playing')
    initializeCards()
    setScore(0)
    setMoves(0)
    setTimeRemaining(90)
  }

  // Initialize cards
  const initializeCards = () => {
    const selectedEmojis = EMOJIS.slice(0, 8) // 8 pairs = 16 cards
    const cardPairs = [...selectedEmojis, ...selectedEmojis]
    
    // Shuffle cards
    const shuffled = cardPairs
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }))
      .sort(() => Math.random() - 0.5)
    
    setCards(shuffled)
  }

  // Handle card click
  const handleCardClick = (cardId: number) => {
    if (isProcessing || gameState !== 'playing') return
    
    const card = cards.find(c => c.id === cardId)
    if (!card || card.isFlipped || card.isMatched) return
    if (flippedCards.length >= 2) return

    // Flip the card
    setCards(prevCards =>
      prevCards.map(c =>
        c.id === cardId ? { ...c, isFlipped: true } : c
      )
    )

    const newFlippedCards = [...flippedCards, cardId]
    setFlippedCards(newFlippedCards)

    // Check for match when 2 cards are flipped
    if (newFlippedCards.length === 2) {
      setIsProcessing(true)
      setMoves(prev => prev + 1)

      const [firstId, secondId] = newFlippedCards
      const firstCard = cards.find(c => c.id === firstId)
      const secondCard = cards.find(c => c.id === secondId)

      if (firstCard?.emoji === secondCard?.emoji) {
        // Match found!
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map(c =>
              c.id === firstId || c.id === secondId
                ? { ...c, isMatched: true }
                : c
            )
          )
          setFlippedCards([])
          setIsProcessing(false)
          
          // Add score
          setScore(prev => prev + 10)
          
          // Check for victory
          const allMatched = cards.every(c => c.isMatched)
          if (allMatched) {
            endGame(true)
          }
        }, 500)
      } else {
        // No match - flip back
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map(c =>
              c.id === firstId || c.id === secondId
                ? { ...c, isFlipped: false }
                : c
            )
          )
          setFlippedCards([])
          setIsProcessing(false)
        }, 1000)
      }
    }
  }

  // End game
  const endGame = useCallback((victory: boolean) => {
    gameEngine.end()
    setGameState(victory ? 'victory' : 'gameover')
  }, [gameEngine])

  // Pause game
  const pauseGame = () => {
    gameEngine.pause()
    setGameState('paused')
  }

  // Resume game
  const resumeGame = () => {
    gameEngine.resume()
    setGameState('playing')
  }

  // Update timer
  useEffect(() => {
    if (gameState !== 'playing') return

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = Math.max(0, prev - 1)
        if (newTime <= 0) {
          endGame(false)
        }
        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [gameState, endGame])

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-purple-100 to-purple-200 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-200 via-purple-100 to-white opacity-50" />
      
      {/* Menu Screen */}
      {gameState === 'menu' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center z-20"
        >
          <h1 className="text-4xl font-bold text-purple-600 mb-4">🧠 Memory Match 🧠</h1>
          <p className="text-purple-500 mb-8 text-center px-4">
            Match pairs of cards to test your memory!<br/>
            Find all 8 pairs before time runs out!
          </p>
          <button
            onClick={startGame}
            className="px-8 py-4 bg-purple-500 text-white rounded-full font-bold text-lg hover:bg-purple-600 transition shadow-lg"
          >
            Start Game
          </button>
        </motion.div>
      )}

      {/* Game Screen */}
      {gameState === 'playing' && (
        <>
          {/* HUD */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
            <div className="glass px-4 py-2 rounded-full">
              <span className="text-purple-600 font-bold">Score: {score}</span>
            </div>
            <div className="glass px-4 py-2 rounded-full">
              <span className="text-purple-600 font-bold">Moves: {moves}</span>
            </div>
            <div className="glass px-4 py-2 rounded-full">
              <span className="text-purple-600 font-bold">Time: {timeRemaining}s</span>
            </div>
          </div>

          {/* Pause Button */}
          <button
            onClick={pauseGame}
            className="absolute top-4 right-4 z-20 glass p-2 rounded-full"
          >
            ⏸️
          </button>

          {/* Cards Grid */}
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="grid grid-cols-4 gap-3 max-w-md w-full">
              <AnimatePresence>
                {cards.map(card => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, rotateY: -90 }}
                    animate={{
                      opacity: 1,
                      rotateY: card.isFlipped || card.isMatched ? 0 : -90,
                    }}
                    transition={{ duration: 0.3 }}
                    onClick={() => handleCardClick(card.id)}
                    className="relative cursor-pointer"
                  >
                    <div
                      className={`w-full aspect-square rounded-xl shadow-lg flex items-center justify-center text-4xl transition-all ${
                        card.isFlipped || card.isMatched
                          ? 'bg-white'
                          : 'bg-purple-500 hover:bg-purple-600'
                      }`}
                    >
                      {card.isFlipped || card.isMatched ? (
                        <span>{card.emoji}</span>
                      ) : (
                        <span className="text-white/50">?</span>
                      )}
                    </div>
                    {card.isMatched && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-green-500/30 rounded-xl"
                      />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </>
      )}

      {/* Paused Screen */}
      {gameState === 'paused' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/30"
        >
          <h2 className="text-3xl font-bold text-white mb-8">Paused</h2>
          <div className="flex gap-4">
            <button
              onClick={resumeGame}
              className="px-6 py-3 bg-purple-500 text-white rounded-full font-bold hover:bg-purple-600 transition"
            >
              Resume
            </button>
            <button
              onClick={() => setGameState('menu')}
              className="px-6 py-3 bg-gray-500 text-white rounded-full font-bold hover:bg-gray-600 transition"
            >
              Quit
            </button>
          </div>
        </motion.div>
      )}

      {/* Game Over Screen */}
      {(gameState === 'gameover' || gameState === 'victory') && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/30"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            {gameState === 'victory' ? '🎉 Victory! 🎉' : '😢 Game Over'}
          </h2>
          <div className="glass p-8 rounded-2xl text-center mb-8">
            <p className="text-white text-xl mb-2">Final Score</p>
            <p className="text-5xl font-bold text-purple-500">{score}</p>
            <p className="text-white/60 text-sm mt-2">Moves: {moves}</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={startGame}
              className="px-6 py-3 bg-purple-500 text-white rounded-full font-bold hover:bg-purple-600 transition"
            >
              Play Again
            </button>
            <button
              onClick={() => setGameState('menu')}
              className="px-6 py-3 bg-gray-500 text-white rounded-full font-bold hover:bg-gray-600 transition"
            >
              Menu
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}