import { useTimeOfDay } from '@/hooks/useTimeOfDay'

export function SceneBackground() {
  const { timeOfDay } = useTimeOfDay()

  const backgrounds = {
    morning:   'bg-morning',
    afternoon: 'bg-afternoon',
    evening:   'bg-evening',
    night:     'bg-night',
  }

  return (
    <div className={`fixed inset-0 transition-colors duration-1000 ${backgrounds[timeOfDay]}`} />
  )
}
