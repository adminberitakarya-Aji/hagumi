import { useState, useEffect } from 'react'

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night'

export function useTimeOfDay() {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning')

  useEffect(() => {
    const updateTime = () => {
      const hour = new Date().getHours()
      if (hour >= 5 && hour < 11) setTimeOfDay('morning')
      else if (hour >= 11 && hour < 17) setTimeOfDay('afternoon')
      else if (hour >= 17 && hour < 21) setTimeOfDay('evening')
      else setTimeOfDay('night')
    }

    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  return { timeOfDay }
}
