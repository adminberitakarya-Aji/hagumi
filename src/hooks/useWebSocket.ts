import { useEffect, useRef, useCallback } from 'react'
import { usePetStore } from '@/stores/petStore'

type WSAction = 'feed' | 'play' | 'rest'

/**
 * WebSocket hook — menghubungkan client ke Go game loop server.
 * Server-authoritative: client hanya mengirim intent, server yang menghitung decay.
 */
export function useWebSocket() {
  const { pet, setPet, updateStats } = usePetStore()
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const isConnectedRef = useRef(false)

  const connect = useCallback(() => {
    if (isConnectedRef.current) return

    const userId = pet?.userId || 'guest'
    const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:3001'}/ws?userId=${userId}`
    
    console.log('[WS] Connecting to', wsUrl)
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      console.log('[WS] Connected')
      isConnectedRef.current = true

      // Register current pet to server
      if (pet) {
        ws.send(JSON.stringify({
          type: 'pet:register',
          payload: {
            id: pet.id,
            userId: pet.userId,
            name: pet.name,
            stage: pet.stage,
            stats: pet.stats,
            genetics: pet.genetics,
            dayAge: pet.dayAge,
            bornAt: pet.bornAt,
            updatedAt: new Date().toISOString(),
          }
        }))
      }
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        
        if (msg.type === 'pet:state_update') {
          const { stats, stage, dayAge, inGrace } = msg.payload
          
          // Update store with server-authoritative state
          usePetStore.setState((state) => {
            if (!state.pet) return state
            return {
              pet: {
                ...state.pet,
                stats: {
                  ...state.pet.stats,
                  ...stats,
                },
                stage: stage || state.pet.stage,
                dayAge: dayAge ?? state.pet.dayAge,
                updatedAt: new Date().toISOString(),
              }
            }
          })
        }
      } catch (err) {
        console.error('[WS] Parse error:', err)
      }
    }

    ws.onclose = () => {
      console.log('[WS] Disconnected')
      isConnectedRef.current = false
      
      // Auto-reconnect after 3 seconds
      reconnectTimerRef.current = setTimeout(() => {
        connect()
      }, 3000)
    }

    ws.onerror = (err) => {
      console.error('[WS] Error:', err)
      ws.close()
    }
  }, [pet])

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
    }
    isConnectedRef.current = false
    wsRef.current?.close()
    wsRef.current = null
  }, [])

  const sendAction = useCallback((action: WSAction) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('[WS] Not connected, sending action locally')
      // Fallback to local state if server is not available
      if (action === 'feed') updateStats({ hunger: usePetStore.getState().pet!.stats.hunger + 20 })
      else if (action === 'play') updateStats({ mood: usePetStore.getState().pet!.stats.mood + 15 })
      else if (action === 'rest') updateStats({ energy: usePetStore.getState().pet!.stats.energy + 30 })
      return
    }

    wsRef.current.send(JSON.stringify({
      type: 'pet:action',
      payload: {
        petId: pet?.id,
        action,
      }
    }))
  }, [pet, updateStats])

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  return { sendAction, isConnected: isConnectedRef.current, reconnect: connect }
}