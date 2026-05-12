import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export function SideNav() {
  const navigate = useNavigate()

  const menus = [
    { id: 'market', icon: '🏪', path: '/market' },
    { id: 'breeding', icon: '💕', path: '/breeding' },
    { id: 'leaderboard', icon: '🏆', path: '/leaderboard' },
  ]

  return (
    <div className="fixed top-24 left-6 z-20 flex flex-col gap-3">
      {menus.map((menu) => (
        <motion.button
          key={menu.id}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(menu.path)}
          className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-xl shadow-lg"
        >
          {menu.icon}
        </motion.button>
      ))}
    </div>
  )
}
