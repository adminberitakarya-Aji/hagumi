import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameEngine } from '@/lib/gameEngine'
import type { GameType } from '@/types/game'

interface SakuraPetal {
  id: number
  x: number
  y: number
  speed: number
  rotation: number
  rotationSpeed: number
  size: number
  color: string
  caught: boolean
}

export function SakuraCatch() {
  const [gameEngine] = useState<GameEngine>(() => {
    const engine = new GameEngine('sakura_catch' as GameType, 'user1', 'pet1')
    return engine
  })
  const [petals, setPetals] = useState<SakuraPetal[]>([])
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameover' | 'victory'>('menu')
  const [timeRemaining, setTimeRemaining] = useState(60)
  const gameLoopRef = useRef<number>(0)
  const petalIdRef = useRef(0)

  const PETAL_COLORS = useMemo(() => ['#FFB7C5', '#FF69B4', '#FFC0CB', '#FFD1DC', '#FFE4E1'], [])
  const SPAWN_INTERVAL = 800 // ms
  const lastSpawnRef = useRef(0)

  // Spawn a new petal
  const spawnPetal = useCallback(() => {
    const id = petalIdRef.current++
    const size = 30 + Math.random() * 20
    const speed = 0.5 + Math.random() * 0.5
    
    setPetals(prev => [
      ...prev,
      {
        id,
        x: Math.random() * 80 + 10, // 10-90% of screen width
        y: -size,
        speed,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 5,
        size,
        color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
        caught: false,
      },
    ])
  }, [PETAL_COLORS])

  // Game loop
  const gameLoop = useCallback(function loop() {
    if (gameState !== 'playing') return

    const now = Date.now()
    
    // Spawn new petals
    if (now - lastSpawnRef.current > SPAWN_INTERVAL) {
      spawnPetal()
      lastSpawnRef.current = now
    }

    // Update petals
    setPetals(prevPetals => {
      const updatedPetals = prevPetals.map(petal => {
        if (petal.caught) return petal
        
        const newY = petal.y + petal.speed
        const newRotation = petal.rotation + petal.rotationSpeed
        
        // Check if petal is caught (clicked)
        if (newY > 100) {
          // Petal missed - reset combo
          setCombo(0)
          return { ...petal, y: newY, rotation: newRotation }
        }
        
        return { ...petal, y: newY, rotation: newRotation }
      })

      // Remove caught or off-screen petals
      return updatedPetals.filter(petal => !petal.caught && petal.y < 100)
    })

    // Update time
    setTimeRemaining(prev => {
      const next = Math.max(0, prev - 1/60)
      if (next <= 0) {
        return 0
      }
      return next
    })

    gameLoopRef.current = requestAnimationFrame(loop)
  }, [gameState, spawnPetal])

  // Start game
  const startGame = useCallback(() => {
    gameEngine.start()
    setGameState('playing')
    setPetals([])
    setScore(0)
    setCombo(0)
    setTimeRemaining(60)
    lastSpawnRef.current = Date.now()
    gameLoopRef.current = requestAnimationFrame(gameLoop)
  }, [gameEngine, gameLoop])


  // Catch a petal
  const catchPetal = (petalId: number) => {
    setPetals(prevPetals =>
      prevPetals.map(petal =>
        petal.id === petalId ? { ...petal, caught: true } : petal
      )
    )

    // Update score and combo
    const newCombo = combo + 1
    setCombo(newCombo)
    const points = 10 * (1 + Math.floor(newCombo / 5) * 0.5) // Combo bonus
    setScore(prev => prev + Math.floor(points))
  }

  // End game
  const endGame = useCallback(() => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current)
    }
    
    gameEngine.end()
    setGameState(score > 0 ? 'victory' : 'gameover')
  }, [gameEngine, score])

  // Pause game
  const pauseGame = () => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current)
    }
    gameEngine.pause()
    setGameState('paused')
  }

  // Resume game
  const resumeGame = useCallback(() => {
    gameEngine.resume()
    setGameState('playing')
    lastSpawnRef.current = Date.now()
    gameLoopRef.current = requestAnimationFrame(gameLoop)
  }, [gameEngine, gameLoop])

  // Game over observer
  useEffect(() => {
    if (timeRemaining <= 0 && gameState === 'playing') {
      setTimeout(() => endGame(), 0)
    }
  }, [timeRemaining, gameState, endGame])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [])

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-pink-100 to-pink-200 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-pink-200 via-pink-100 to-white opacity-50" />
      
      {/* Menu Screen */}
      {gameState === 'menu' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center z-20"
        >
          <h1 className="text-4xl font-bold text-pink-600 mb-4">🌸 Sakura Catch 🌸</h1>
          <p className="text-pink-500 mb-8 text-center px-4">
            Catch falling sakura petals before they hit the ground!<br/>
            Build combos for bonus points!
          </p>
          <button
            onClick={startGame}
            className="px-8 py-4 bg-pink-500 text-white rounded-full font-bold text-lg hover:bg-pink-600 transition shadow-lg"
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
              <span className="text-pink-600 font-bold">Score: {score}</span>
            </div>
            <div className="glass px-4 py-2 rounded-full">
              <span className="text-pink-600 font-bold">Time: {Math.ceil(timeRemaining)}s</span>
            </div>
            <div className="glass px-4 py-2 rounded-full">
              <span className="text-pink-600 font-bold">Combo: {combo}x</span>
            </div>
          </div>

          {/* Pause Button */}
          <button
            onClick={pauseGame}
            className="absolute top-4 right-4 z-20 glass p-2 rounded-full"
          >
            ⏸️
          </button>

          {/* Petals */}
          <AnimatePresence>
            {petals.map(petal => (
              <motion.div
                key={petal.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                style={{
                  position: 'absolute',
                  left: `${petal.x}%`,
                  top: `${petal.y}%`,
                  width: `${petal.size}px`,
                  height: `${petal.size}px`,
                  transform: `rotate(${petal.rotation}deg)`,
                  backgroundColor: petal.color,
                  borderRadius: '50%',
                  cursor: 'pointer',
                }}
                onClick={() => catchPetal(petal.id)}
                className="shadow-lg hover:scale-110 transition-transform"
              />
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
              className="px-6 py-3 bg-pink-500 text-white rounded-full font-bold hover:bg-pink-600 transition"
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
            <p className="text-5xl font-bold text-pink-500">{score}</p>
            <p className="text-white/60 text-sm mt-2">Max Combo: {combo}x</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={startGame}
              className="px-6 py-3 bg-pink-500 text-white rounded-full font-bold hover:bg-pink-600 transition"
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