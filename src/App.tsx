import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ErrorBoundary from '@/shared/error/ErrorBoundary'
import ErrorFallback from '@/shared/error/ErrorFallback'

// Eagerly load LandingPage since it's the first thing users see
import LandingPage from '@/pages/LandingPage'

// Lazy load all other pages to reduce initial bundle size (Code Splitting)
const EggSelectPage = lazy(() => import('@/pages/EggSelectPage'))
const HatchPage = lazy(() => import('@/pages/HatchPage'))
const GamePage = lazy(() => import('@/pages/GamePage'))
const MarketPage = lazy(() => import('@/pages/MarketPage'))
const BreedingPage = lazy(() => import('@/pages/BreedingPage'))
const LeaderboardPage = lazy(() => import('@/pages/LeaderboardPage'))
const SocialPage = lazy(() => import('@/pages/SocialPage'))
const MiniGamesPage = lazy(() => import('@/pages/MiniGamesPage'))
const ShopPage = lazy(() => import('@/pages/ShopPage'))
const BattlePassPage = lazy(() => import('@/pages/BattlePassPage'))
const GachaPage = lazy(() => import('@/pages/GachaPage'))
const PaymentPage = lazy(() => import('@/pages/PaymentPage'))

const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-[#0a0a1a]">
    <div className="w-16 h-16 border-4 border-white/10 border-t-pink-500 rounded-full animate-spin shadow-[0_0_15px_rgba(236,72,153,0.5)]"></div>
  </div>
)

import { AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { PageTransition } from '@/components/layout/PageTransition'

const AppRoutes = () => {
  const location = useLocation()
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><EggSelectPage /></PageTransition>} />
        <Route path="/egg-select" element={<PageTransition><EggSelectPage /></PageTransition>} />
        <Route path="/hatch" element={<PageTransition><HatchPage /></PageTransition>} />
        <Route path="/game" element={<PageTransition><GamePage /></PageTransition>} />
        <Route path="/market" element={<PageTransition><MarketPage /></PageTransition>} />
        <Route path="/breeding" element={<PageTransition><BreedingPage /></PageTransition>} />
        <Route path="/leaderboard" element={<PageTransition><LeaderboardPage /></PageTransition>} />
        <Route path="/social" element={<PageTransition><SocialPage /></PageTransition>} />
        <Route path="/minigames" element={<PageTransition><MiniGamesPage /></PageTransition>} />
        <Route path="/shop" element={<PageTransition><ShopPage /></PageTransition>} />
        <Route path="/battle-pass" element={<PageTransition><BattlePassPage /></PageTransition>} />
        <Route path="/gacha" element={<PageTransition><GachaPage /></PageTransition>} />
        <Route path="/payment" element={<PageTransition><PaymentPage /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Router>
        <div className="w-full h-full bg-[#0a0a1a]">
          <Suspense fallback={<PageLoader />}>
            <AppRoutes />
          </Suspense>
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App