import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameEngine } from '@/lib/gameEngine'
import type { GameType } from '@/types/game'

interface FoodItem {
  id: number
  x: number
  y: number
  type: 'fish' | 'meat' | 'vegetable' | 'treat'
  emoji: string
  points: number
  speed: number
  caught: boolean
}

const FOOD_TYPES = [
  { type: 'fish' as const, emoji: '🐟', points: 10, speed: 1.0 },
  { type: 'meat' as const, emoji: '🍖', points: 15, speed: 1.2 },
  { type: 'vegetable' as const, emoji: '🥬', points: 5, speed: 0.8 },
  { type: 'treat' as const, emoji: '🍖', points: 20, speed: 1.5 },
]

export function FeedingFrenzy() {
  const [gameEngine] = useState<GameEngine>(() => {
    const engine = new GameEngine('feeding_frenzy' as GameType, 'user1', 'pet1')
    return engine
  })
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameover' | 'victory'>('menu')
  const [timeRemaining, setTimeRemaining] = useState(45)
  const gameLoopRef = useRef<number>(0)
  const foodIdRef = useRef(0)
  const lastSpawnRef = useRef(0)
  const scoreRef = useRef(score)
  useEffect(() => {
    scoreRef.current = score
  }, [score])

  const SPAWN_INTERVAL = 600 // ms

  // Spawn food
  const spawnFood = useCallback(() => {
    const id = foodIdRef.current++
    const foodType = FOOD_TYPES[Math.floor(Math.random() * FOOD_TYPES.length)]
    
    setFoodItems(prev => [
      ...prev,
      {
        id,
        x: Math.random() * 80 + 10, // 10-90% of screen width
        y: -30,
        type: foodType.type,
        emoji: foodType.emoji,
        points: foodType.points,
        speed: foodType.speed,
        caught: false,
      },
    ])
  }, [])

  // End game - stable except for gameEngine
  const endGame = useCallback(() => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current)
    }
    gameEngine.end()
    setGameState(scoreRef.current > 0 ? 'victory' : 'gameover')
  }, [gameEngine])

  // Game loop - named function expression to satisfy lint
  const gameLoop = useCallback(function loop() {
    if (gameState !== 'playing') return

    const now = Date.now()
    
    // Spawn new food
    if (now - lastSpawnRef.current > SPAWN_INTERVAL) {
      spawnFood()
      lastSpawnRef.current = now
    }

    // Update food items
    setFoodItems(prevItems => {
      const updatedItems = prevItems.map(item => {
        if (item.caught) return item
        
        const newY = item.y + item.speed
        
        // Check if food is missed (clicked)
        if (newY > 100) {
          // Food missed - reset combo
          setCombo(0)
          return { ...item, y: newY }
        }
        
        return { ...item, y: newY }
      })

      // Remove caught or off-screen food
      return updatedItems.filter(item => !item.caught && item.y < 100)
    })

    // Update time
    setTimeRemaining(prev => {
      const next = Math.max(0, prev - 1/60)
      // End game if time runs out
      if (next <= 0) {
        endGame()
      }
      return next
    })

    gameLoopRef.current = requestAnimationFrame(loop)
  }, [gameState, SPAWN_INTERVAL, spawnFood, endGame])

  // Start game
  const startGame = useCallback(() => {
    gameEngine.start()
    setGameState('playing')
    setFoodItems([])
    setScore(0)
    setCombo(0)
    setTimeRemaining(45)
    lastSpawnRef.current = Date.now()
    gameLoopRef.current = requestAnimationFrame(gameLoop)
  }, [gameEngine, gameLoop])

  // Catch food
  const catchFood = (foodId: number) => {
    const food = foodItems.find(f => f.id === foodId)
    if (!food) return

    setFoodItems(prevItems =>
      prevItems.map(item =>
        item.id === foodId ? { ...item, caught: true } : item
      )
    )

    // Update score and combo
    const newCombo = combo + 1
    setCombo(newCombo)
    const points = food.points * (1 + Math.floor(newCombo / 5) * 0.5) // Combo bonus
    setScore(prev => prev + Math.floor(points))
  }

  // Pause game
  const pauseGame = () => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current)
    }
    gameEngine.pause()
    setGameState('paused')
  }

  // Resume game
  const resumeGame = () => {
    gameEngine.resume()
    setGameState('playing')
    lastSpawnRef.current = Date.now()
    gameLoopRef.current = requestAnimationFrame(gameLoop)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [])

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-orange-100 to-orange-200 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-200 via-orange-100 to-white opacity-50" />
      
      {/* Menu Screen */}
      {gameState === 'menu' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center z-20"
        >
          <h1 className="text-4xl font-bold text-orange-600 mb-4">🍖 Feeding Frenzy 🍖</h1>
          <p className="text-orange-500 mb-8 text-center px-4">
            Feed your pet as fast as you can!<br/>
            Catch food items before they hit the ground!
          </p>
          <button
            onClick={startGame}
            className="px-8 py-4 bg-orange-500 text-white rounded-full font-bold text-lg hover:bg-orange-600 transition shadow-lg"
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
              <span className="text-orange-600 font-bold">Score: {score}</span>
            </div>
            <div className="glass px-4 py-2 rounded-full">
              <span className="text-orange-600 font-bold">Time: {Math.ceil(timeRemaining)}s</span>
            </div>
            <div className="glass px-4 py-2 rounded-full">
              <span className="text-orange-600 font-bold">Combo: {combo}x</span>
            </div>
          </div>

          {/* Pause Button */}
          <button
            onClick={pauseGame}
            className="absolute top-4 right-4 z-20 glass p-2 rounded-full"
          >
            ⏸️
          </button>

          {/* Food Items */}
          <AnimatePresence>
            {foodItems.map(food => (
              <motion.div
                key={food.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                style={{
                  position: 'absolute',
                  left: `${food.x}%`,
                  top: `${food.y}%`,
                  fontSize: '2.5rem',
                  cursor: 'pointer',
                }}
                onClick={() => catchFood(food.id)}
                className="hover:scale-125 transition-transform"
              >
                {food.emoji}
              </motion.div>
            ))}
          </AnimatePresence>
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
              className="px-6 py-3 bg-orange-500 text-white rounded-full font-bold hover:bg-orange-600 transition"
            >
              Resume
            </button>
            <button
              onClick={() => {
                if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
                setGameState('menu')
              }}
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
            <p className="text-5xl font-bold text-orange-500">{score}</p>
            <p className="text-white/60 text-sm mt-2">Max Combo: {combo}x</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={startGame}
              className="px-6 py-3 bg-orange-500 text-white rounded-full font-bold hover:bg-orange-600 transition"
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