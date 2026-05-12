import type { Pet, PetStage, PetStats } from '@/types'

// ─── AI States ───────────────────────────────────────

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
  priority: number   // Higher = more urgent
  emoji: string
  message: string
  animation: string  // CSS animation class
}

// ─── State Priority & Messages ───────────────────────

const AI_STATE_INFO: Record<PetAIState, Omit<AIStateInfo, 'state'>> = {
  idle:           { priority: 0,  emoji: '😊', message: '...',                      animation: 'idle-bounce' },
  hungry:         { priority: 70, emoji: '🍖', message: "I'm hungry!",              animation: 'paw-at-screen' },
  seeking_food:   { priority: 80, emoji: '🔍', message: 'Looking for food...',      animation: 'look-around' },
  tired:          { priority: 60, emoji: '😴', message: 'Getting sleepy...',        animation: 'rub-eyes' },
  going_sleep:    { priority: 75, emoji: '💤', message: 'Going to bed...',          animation: 'yawn-stretch' },
  bored:          { priority: 50, emoji: '😐', message: "I'm bored...",             animation: 'sigh' },
  playing_alone:  { priority: 45, emoji: '🎾', message: 'Playing by myself...',     animation: 'hop-around' },
  sick:           { priority: 85, emoji: '🤒', message: "I don't feel well...",    animation: 'tremble' },
  depressed:      { priority: 90, emoji: '😢', message: 'Feeling lonely...',       animation: 'curl-up' },
  excited:        { priority: 10, emoji: '🎉', message: 'Yay! Let\'s play!',        animation: 'jump-spin' },
  growing:        { priority: 15, emoji: '✨', message: 'Something is happening...', animation: 'glow-pulse' },
  critical:       { priority: 95, emoji: '💔', message: 'I need help...',          animation: 'fade-shake' },
  dead:           { priority: 100, emoji: '🕊️', message: '...',                     animation: 'still' },
}

// ─── AI Engine ───────────────────────────────────────

/**
 * Pet AI State Machine — determines pet's current state based on stats.
 * 
 * Rules:
 * 1. Health/Death checks first (highest priority)
 * 2. Then urgent needs (hunger, sickness)
 * 3. Then normal needs (energy, mood)
 * 4. Then idle states
 */
export function determinePetState(pet: Pet): AIStateInfo {
  const { stats, stage } = pet

  // ── Terminal states ──
  if (stage === 'dead') {
    return { ...AI_STATE_INFO.dead, state: 'dead' }
  }

  if (stage === 'egg') {
    return { state: 'idle', priority: 0, emoji: '🥚', message: '...', animation: 'gentle-rock' }
  }

  // ── Critical state (about to die) ──
  if (stats.hunger <= 10 || stats.health <= 20) {
    return { ...AI_STATE_INFO.critical, state: 'critical' }
  }

  // ── Sick (hunger < 20 for extended period) ──
  if (stats.hunger < 20 && stats.health < 50) {
    return { ...AI_STATE_INFO.sick, state: 'sick' }
  }

  // ── Depressed (mood very low) ──
  if (stats.mood < 20) {
    return { ...AI_STATE_INFO.depressed, state: 'depressed' }
  }

  // ── Hungry / Seeking food ──
  if (stats.hunger < 30) {
    return { ...AI_STATE_INFO.seeking_food, state: 'seeking_food' }
  }
  if (stats.hunger < 50) {
    return { ...AI_STATE_INFO.hungry, state: 'hungry' }
  }

  // ── Tired / Going to sleep ──
  if (stats.energy < 20) {
    return { ...AI_STATE_INFO.going_sleep, state: 'going_sleep' }
  }
  if (stats.energy < 40) {
    return { ...AI_STATE_INFO.tired, state: 'tired' }
  }

  // ── Bored / Playing alone ──
  if (stats.mood < 50) {
    return { ...AI_STATE_INFO.bored, state: 'bored' }
  }

  // ── Excited (all stats high) ──
  if (stats.hunger > 80 && stats.mood > 80 && stats.energy > 80) {
    return { ...AI_STATE_INFO.excited, state: 'excited' }
  }

  // ── Default: Idle ──
  return { ...AI_STATE_INFO.idle, state: 'idle' }
}

// ─── Emotion-based messages ──────────────────────────

interface EmotionMessage {
  condition: (stats: PetStats) => boolean
  messages: string[]
}

const EMOTION_MESSAGES: EmotionMessage[] = [
  {
    condition: (s) => s.hunger > 80 && s.mood > 80,
    messages: [
      "Today is a beautiful day! 🌸",
      "I love spending time with you! ✨",
      "Can we play forever? 🎮",
    ]
  },
  {
    condition: (s) => s.hunger > 50 && s.mood > 50,
    messages: [
      "Nyaa~ what's next? 🐱",
      "I'm feeling good today! 😊",
      "Hmm, should we go outside? 🌿",
    ]
  },
  {
    condition: (s) => s.hunger < 30,
    messages: [
      "My tummy is making noises... 🍽️",
      "I could really use a snack... 🍙",
      "Is it almost mealtime? ⏰",
    ]
  },
  {
    condition: (s) => s.energy < 30,
    messages: [
      "I'm so sleepy... 😴",
      "Just five more minutes... 🛏️",
      "Can I take a nap? 💤",
    ]
  },
  {
    condition: (s) => s.mood < 30,
    messages: [
      "I feel a bit lonely... 🥺",
      "Will you stay with me? 💕",
      "I miss you when you're away... 🌙",
    ]
  },
]

/**
 * Get a context-aware message from the pet based on current stats.
 */
export function getPetMessage(pet: Pet): string {
  if (pet.stage === 'dead') {
    const deathMessages = [
      "Thank you for everything... 🕊️",
      "I'll always be with you... 💫",
      "Our memories will last forever... 🌈",
    ]
    return deathMessages[Math.floor(Math.random() * deathMessages.length)]
  }

  if (pet.stage === 'egg') {
    return "Tap to give me warmth! 🥚✨"
  }

  // Find matching emotion category
  const matched = EMOTION_MESSAGES.find(m => m.condition(pet.stats))
  if (matched) {
    return matched.messages[Math.floor(Math.random() * matched.messages.length)]
  }

  // Fallback generic messages
  const genericMessages = [
    "Nyaa~? 🐱",
    "You're back! 🌟",
    "I was waiting for you! ⏳",
    "What do you want to do? 🤔",
    "I'm happy you're here! 🎵",
  ]
  return genericMessages[Math.floor(Math.random() * genericMessages.length)]
}

// ─── Growth Event Messages ───────────────────────────

const EVOLUTION_MESSAGES: Record<PetStage, string[]> = {
  egg: ['Something is stirring inside...'],
  baby: ['You\'re growing so fast! 🌱'],
  child: ['Getting bigger every day! 🌿'],
  teen: ['Almost all grown up... 🌳'],
  adult: ['You\'ve become so beautiful! 🌸'],
  elder: ['Every moment with you is precious... 🌅'],
  dead: ['...'],
}

export function getEvolutionMessage(stage: PetStage): string {
  const messages = EVOLUTION_MESSAGES[stage]
  return messages[Math.floor(Math.random() * messages.length)]
}