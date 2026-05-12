import { useEffect } from 'react'

/**
 * usePetLifecycle
 * 
 * Previously this hook handled local decay, growth, and death checks.
 * In the new Server-Authoritative architecture, all of these are computed
 * by the Go backend game engine (`engine.tick()`) and synced to the client
 * via WebSocket (`pet:state_update`).
 * 
 * This hook is kept here as a stub for potential future client-side 
 * visual interpolations (e.g., animations between server ticks).
 */
export function usePetLifecycle() {
  useEffect(() => {
    // Left empty for future client-side visual ticks
  }, [])
}
