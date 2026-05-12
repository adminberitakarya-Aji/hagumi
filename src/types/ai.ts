// ─── AI Types ───────────────────────────────────────

export type PetAIState =
  | 'idle'
  | 'hungry'
  | 'tired'
  | 'bored'
  | 'sick'
  | 'depressed'
  | 'excited'
  | 'growing'
  | 'critical'
  | 'dead'
  | 'seeking_food'
  | 'going_sleep'
  | 'playing_alone'

export interface AIStateInfo {
  state: PetAIState
  priority: number
  emoji: string
  message: string
  animation: string
}

export interface PersonalityBehavior {
  personality: string
  stateModifiers: Record<PetAIState, number> // Priority modifiers
  actionPreferences: string[] // Preferred actions
  reactionSpeed: number // How quickly they react
  socialNeed: number // How much they need interaction
  playfulness: number // How much they want to play
  independence: number // How independent they are
}

export interface AIAction {
  id: string
  name: string
  type: 'care' | 'play' | 'social' | 'rest' | 'explore'
  energyCost: number
  moodGain: number
  hungerCost: number
  duration: number // in seconds
  animation: string
  sound?: string
}

export interface AIReaction {
  trigger: string
  response: string
  emotion: string
  intensity: number
}

export interface AIDecision {
  action: AIAction
  urgency: number
  reasoning: string
  timestamp: number
}

export interface AIEmotion {
  primary: string
  secondary?: string
  intensity: number
  duration: number
}

export interface AILearning {
  actionHistory: Array<{
    action: string
    result: 'positive' | 'negative' | 'neutral'
    timestamp: number
  }>
  preferences: Record<string, number>
  learnedBehaviors: string[]
}

export interface PetAI {
  currentState: PetAIState
  previousState: PetAIState
  stateHistory: Array<{
    state: PetAIState
    timestamp: number
    duration: number
  }>
  emotion: AIEmotion
  decision: AIDecision | null
  learning: AILearning
  personalityBehavior: PersonalityBehavior
  lastTick: number
  tickInterval: number
}

export interface AITickResult {
  newState: PetAIState
  action: AIAction | null
  message: string
  emotion: AIEmotion
  shouldNotify: boolean
}