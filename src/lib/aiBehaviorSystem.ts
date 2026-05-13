import type { Pet } from '@/types'
import type {
  PersonalityBehavior,
  AIAction,
  AIReaction,
  AIEmotion,
  AIDecision,
  PetAI,
  AITickResult,
  PetAIState
} from '@/types/ai'

// ─── Personality Behaviors ─────────────────────────────

const PERSONALITY_BEHAVIORS: Record<string, PersonalityBehavior> = {
  playful: {
    personality: 'playful',
    stateModifiers: {
      idle: -10,
      hungry: -5,
      tired: -5,
      bored: -20,
      sick: 0,
      depressed: -10,
      excited: 20,
      growing: 0,
      critical: 0,
      dead: 0,
      seeking_food: -5,
      going_sleep: -5,
      playing_alone: 30,
    },
    actionPreferences: ['play', 'explore', 'social'],
    reactionSpeed: 0.8,
    socialNeed: 0.7,
    playfulness: 0.9,
    independence: 0.4,
  },
  calm: {
    personality: 'calm',
    stateModifiers: {
      idle: 10,
      hungry: 5,
      tired: 10,
      bored: -5,
      sick: 5,
      depressed: 5,
      excited: -10,
      growing: 5,
      critical: 0,
      dead: 0,
      seeking_food: 5,
      going_sleep: 15,
      playing_alone: -10,
    },
    actionPreferences: ['rest', 'care', 'social'],
    reactionSpeed: 0.5,
    socialNeed: 0.5,
    playfulness: 0.3,
    independence: 0.7,
  },
  energetic: {
    personality: 'energetic',
    stateModifiers: {
      idle: -15,
      hungry: -10,
      tired: -20,
      bored: -25,
      sick: -5,
      depressed: -15,
      excited: 25,
      growing: 5,
      critical: 0,
      dead: 0,
      seeking_food: -10,
      going_sleep: -15,
      playing_alone: 35,
    },
    actionPreferences: ['play', 'explore', 'social'],
    reactionSpeed: 0.9,
    socialNeed: 0.8,
    playfulness: 0.95,
    independence: 0.3,
  },
  grumpy: {
    personality: 'grumpy',
    stateModifiers: {
      idle: 5,
      hungry: 15,
      tired: 10,
      bored: 10,
      sick: 10,
      depressed: 15,
      excited: -20,
      growing: 0,
      critical: 5,
      dead: 0,
      seeking_food: 10,
      going_sleep: 10,
      playing_alone: -15,
    },
    actionPreferences: ['rest', 'care'],
    reactionSpeed: 0.4,
    socialNeed: 0.3,
    playfulness: 0.2,
    independence: 0.8,
  },
  affectionate: {
    personality: 'affectionate',
    stateModifiers: {
      idle: -5,
      hungry: -5,
      tired: -5,
      bored: -15,
      sick: 5,
      depressed: -20,
      excited: 15,
      growing: 5,
      critical: 0,
      dead: 0,
      seeking_food: -5,
      going_sleep: -5,
      playing_alone: -10,
    },
    actionPreferences: ['social', 'care', 'play'],
    reactionSpeed: 0.7,
    socialNeed: 0.9,
    playfulness: 0.6,
    independence: 0.2,
  },
  lazy: {
    personality: 'lazy',
    stateModifiers: {
      idle: 15,
      hungry: 5,
      tired: 20,
      bored: 10,
      sick: 5,
      depressed: 10,
      excited: -15,
      growing: 0,
      critical: 0,
      dead: 0,
      seeking_food: 5,
      going_sleep: 25,
      playing_alone: -20,
    },
    actionPreferences: ['rest', 'care'],
    reactionSpeed: 0.3,
    socialNeed: 0.4,
    playfulness: 0.2,
    independence: 0.9,
  },
  curious: {
    personality: 'curious',
    stateModifiers: {
      idle: -10,
      hungry: -5,
      tired: -5,
      bored: -20,
      sick: 0,
      depressed: -10,
      excited: 15,
      growing: 5,
      critical: 0,
      dead: 0,
      seeking_food: -5,
      going_sleep: -5,
      playing_alone: 25,
    },
    actionPreferences: ['explore', 'play', 'social'],
    reactionSpeed: 0.8,
    socialNeed: 0.6,
    playfulness: 0.7,
    independence: 0.6,
  },
  brave: {
    personality: 'brave',
    stateModifiers: {
      idle: -5,
      hungry: -5,
      tired: -5,
      bored: -10,
      sick: -5,
      depressed: -10,
      excited: 20,
      growing: 5,
      critical: -5,
      dead: 0,
      seeking_food: -5,
      going_sleep: -5,
      playing_alone: 20,
    },
    actionPreferences: ['explore', 'play', 'social'],
    reactionSpeed: 0.7,
    socialNeed: 0.6,
    playfulness: 0.7,
    independence: 0.7,
  },
}

// ─── AI Actions Database ───────────────────────────────

const AI_ACTIONS: Record<string, AIAction> = {
  // Care actions
  eat: {
    id: 'eat',
    name: 'Eat',
    type: 'care',
    energyCost: 5,
    moodGain: 10,
    hungerCost: -30,
    duration: 5,
    animation: 'eat',
    sound: 'chomp',
  },
  drink: {
    id: 'drink',
    name: 'Drink',
    type: 'care',
    energyCost: 2,
    moodGain: 5,
    hungerCost: -10,
    duration: 3,
    animation: 'drink',
    sound: 'slurp',
  },
  sleep: {
    id: 'sleep',
    name: 'Sleep',
    type: 'rest',
    energyCost: -50,
    moodGain: 15,
    hungerCost: -5,
    duration: 30,
    animation: 'sleep',
    sound: 'snore',
  },
  rest: {
    id: 'rest',
    name: 'Rest',
    type: 'rest',
    energyCost: -20,
    moodGain: 5,
    hungerCost: -2,
    duration: 10,
    animation: 'rest',
  },
  groom: {
    id: 'groom',
    name: 'Groom',
    type: 'care',
    energyCost: 10,
    moodGain: 15,
    hungerCost: -5,
    duration: 8,
    animation: 'groom',
    sound: 'purr',
  },

  // Play actions
  play_ball: {
    id: 'play_ball',
    name: 'Play Ball',
    type: 'play',
    energyCost: 20,
    moodGain: 30,
    hungerCost: -10,
    duration: 15,
    animation: 'play_ball',
    sound: 'bounce',
  },
  chase: {
    id: 'chase',
    name: 'Chase',
    type: 'play',
    energyCost: 25,
    moodGain: 35,
    hungerCost: -15,
    duration: 12,
    animation: 'chase',
    sound: 'meow',
  },
  jump: {
    id: 'jump',
    name: 'Jump',
    type: 'play',
    energyCost: 15,
    moodGain: 25,
    hungerCost: -8,
    duration: 8,
    animation: 'jump',
    sound: 'boing',
  },
  roll: {
    id: 'roll',
    name: 'Roll',
    type: 'play',
    energyCost: 10,
    moodGain: 20,
    hungerCost: -5,
    duration: 6,
    animation: 'roll',
  },

  // Social actions
  cuddle: {
    id: 'cuddle',
    name: 'Cuddle',
    type: 'social',
    energyCost: 5,
    moodGain: 40,
    hungerCost: -3,
    duration: 10,
    animation: 'cuddle',
    sound: 'purr',
  },
  purr: {
    id: 'purr',
    name: 'Purr',
    type: 'social',
    energyCost: 2,
    moodGain: 15,
    hungerCost: -2,
    duration: 5,
    animation: 'purr',
    sound: 'purr',
  },
  meow: {
    id: 'meow',
    name: 'Meow',
    type: 'social',
    energyCost: 3,
    moodGain: 10,
    hungerCost: -2,
    duration: 3,
    animation: 'meow',
    sound: 'meow',
  },
  nuzzle: {
    id: 'nuzzle',
    name: 'Nuzzle',
    type: 'social',
    energyCost: 5,
    moodGain: 25,
    hungerCost: -3,
    duration: 7,
    animation: 'nuzzle',
    sound: 'purr',
  },

  // Explore actions
  explore: {
    id: 'explore',
    name: 'Explore',
    type: 'explore',
    energyCost: 15,
    moodGain: 20,
    hungerCost: -8,
    duration: 20,
    animation: 'explore',
  },
  sniff: {
    id: 'sniff',
    name: 'Sniff',
    type: 'explore',
    energyCost: 5,
    moodGain: 10,
    hungerCost: -3,
    duration: 8,
    animation: 'sniff',
    sound: 'sniff',
  },
  look_around: {
    id: 'look_around',
    name: 'Look Around',
    type: 'explore',
    energyCost: 3,
    moodGain: 8,
    hungerCost: -2,
    duration: 5,
    animation: 'look_around',
  },
}

// ─── AI Reactions ─────────────────────────────────────

const AI_REACTIONS: AIReaction[] = [
  { trigger: 'fed', response: 'Yummy! 😋', emotion: 'happy', intensity: 0.8 },
  { trigger: 'played', response: 'That was fun! 🎉', emotion: 'excited', intensity: 0.9 },
  { trigger: 'petted', response: 'I love you! 💕', emotion: 'affectionate', intensity: 0.9 },
  { trigger: 'ignored', response: 'Are you still there? 🥺', emotion: 'lonely', intensity: 0.5 },
  { trigger: 'scolded', response: 'I\'m sorry... 😢', emotion: 'sad', intensity: 0.7 },
  { trigger: 'praised', response: 'I did good! 😊', emotion: 'proud', intensity: 0.8 },
  { trigger: 'tired', response: 'I need a nap... 😴', emotion: 'tired', intensity: 0.6 },
  { trigger: 'hungry', response: 'I\'m hungry... 🍖', emotion: 'hungry', intensity: 0.7 },
  { trigger: 'sick', response: 'I don\'t feel well... 🤒', emotion: 'sick', intensity: 0.8 },
  { trigger: 'bored', response: 'I\'m bored... 😐', emotion: 'bored', intensity: 0.5 },
]

// ─── Behavior System Functions ─────────────────────────

export function getPersonalityBehavior(personality: string): PersonalityBehavior {
  return PERSONALITY_BEHAVIORS[personality] || PERSONALITY_BEHAVIORS.calm
}

export function getAIAction(actionId: string): AIAction | undefined {
  return AI_ACTIONS[actionId]
}

export function getAllAIActions(): AIAction[] {
  return Object.values(AI_ACTIONS)
}

export function getActionsByType(type: AIAction['type']): AIAction[] {
  return Object.values(AI_ACTIONS).filter(action => action.type === type)
}

export function getAIReaction(trigger: string): AIReaction | undefined {
  return AI_REACTIONS.find(reaction => reaction.trigger === trigger)
}

export function getRandomAIReaction(): AIReaction {
  return AI_REACTIONS[Math.floor(Math.random() * AI_REACTIONS.length)]
}

// ─── Decision Making ───────────────────────────────────

export function makeAIDecision(
  pet: Pet,
  currentState: PetAIState,
  personality: PersonalityBehavior
): AIDecision {
  const { stats } = pet

  // Get personality-modified state priorities
  const stateModifier = personality.stateModifiers[currentState] || 0
  const basePriority = getStatePriority(currentState)
  const modifiedPriority = basePriority + stateModifier

  // Determine best action based on state and personality
  let action: AIAction = AI_ACTIONS.rest
  let reasoning = 'Neutral'

  // Urgent needs first
  if (stats.hunger < 30) {
    action = AI_ACTIONS.eat
    reasoning = 'Hungry - need food'
  } else if (stats.energy < 30) {
    action = AI_ACTIONS.sleep
    reasoning = 'Tired - need rest'
  } else if (stats.mood < 30) {
    // Choose action based on personality preferences
    const preferredType = personality.actionPreferences[0]
    const actions = getActionsByType(preferredType as AIAction['type'])
    action = actions[Math.floor(Math.random() * actions.length)]
    reasoning = `Bored - prefer ${preferredType}`
  } else {
    // All stats good - choose based on personality
    const preferredType = personality.actionPreferences[
      Math.floor(Math.random() * personality.actionPreferences.length)
    ]
    const actions = getActionsByType(preferredType as AIAction['type'])
    action = actions[Math.floor(Math.random() * actions.length)]
    reasoning = `Feeling good - prefer ${preferredType}`
  }

  return {
    action: action || AI_ACTIONS.rest,
    urgency: modifiedPriority,
    reasoning,
    timestamp: Date.now(),
  }
}

function getStatePriority(state: PetAIState): number {
  const priorities: Record<PetAIState, number> = {
    dead: 100,
    critical: 95,
    sick: 85,
    seeking_food: 80,
    going_sleep: 75,
    hungry: 70,
    tired: 60,
    depressed: 90,
    bored: 50,
    playing_alone: 45,
    excited: 10,
    growing: 15,
    idle: 0,
  }
  return priorities[state] || 0
}

// ─── Emotion System ─────────────────────────────────────

export function determineEmotion(
  pet: Pet,
  currentState: PetAIState
): AIEmotion {
  const { stats, genetics } = pet

  let primary = 'neutral'
  let intensity = 0.5
  const duration = 60 // seconds

  // Determine primary emotion based on stats
  if (stats.hunger < 20) {
    primary = 'hungry'
    intensity = 0.8
  } else if (stats.energy < 20) {
    primary = 'tired'
    intensity = 0.7
  } else if (stats.mood < 20) {
    primary = 'sad'
    intensity = 0.8
  } else if (stats.mood > 80 && stats.hunger > 80 && stats.energy > 80) {
    primary = 'happy'
    intensity = 0.9
  } else if (currentState === 'excited') {
    primary = 'excited'
    intensity = 0.85
  } else if (currentState === 'playing_alone') {
    primary = 'playful'
    intensity = 0.7
  }

  // Personality affects emotion intensity
  const personality = getPersonalityBehavior(genetics.personality)
  intensity *= personality.reactionSpeed

  return {
    primary,
    intensity: Math.min(1, Math.max(0, intensity)),
    duration,
  }
}

// ─── Learning System ───────────────────────────────────

export function updateAILearning(
  learning: { actionHistory: any[]; preferences: Record<string, number>; learnedBehaviors: string[] },
  action: string,
  result: 'positive' | 'negative' | 'neutral'
): any {
  const now = Date.now()

  // Add to history
  learning.actionHistory.push({
    action,
    result,
    timestamp: now,
  })

  // Keep only last 100 actions
  if (learning.actionHistory.length > 100) {
    learning.actionHistory = learning.actionHistory.slice(-100)
  }

  // Update preferences
  if (!learning.preferences[action]) {
    learning.preferences[action] = 0
  }

  if (result === 'positive') {
    learning.preferences[action] += 0.1
  } else if (result === 'negative') {
    learning.preferences[action] -= 0.1
  }

  // Keep preferences in range [0, 1]
  learning.preferences[action] = Math.max(0, Math.min(1, learning.preferences[action]))

  // Learn new behaviors
  if (result === 'positive' && !learning.learnedBehaviors.includes(action)) {
    learning.learnedBehaviors.push(action)
  }

  return learning
}

// ─── AI Tick System ─────────────────────────────────────

export function tickAI(pet: Pet, ai: PetAI): AITickResult {
  const now = Date.now()
  const timeSinceLastTick = (now - ai.lastTick) / 1000 // seconds

  // Check if it's time for a tick
  if (timeSinceLastTick < ai.tickInterval) {
    return {
      newState: ai.currentState,
      action: null,
      message: '',
      emotion: ai.emotion,
      shouldNotify: false,
    }
  }

  // Update last tick time
  ai.lastTick = now

  // Get personality behavior
  const personality = getPersonalityBehavior(pet.genetics.personality)

  // Make decision
  const decision = makeAIDecision(pet, ai.currentState, personality)
  ai.decision = decision

  // Determine emotion
  const emotion = determineEmotion(pet, ai.currentState)
  ai.emotion = emotion

  // Update state history
  if (ai.currentState !== ai.currentState) {
    ai.stateHistory.push({
      state: ai.currentState,
      timestamp: now,
      duration: timeSinceLastTick,
    })
  }

  // Determine if notification is needed
  const shouldNotify = decision.urgency > 70

  // Generate message
  const message = generateAIMessage(pet, ai.currentState, emotion)

  return {
    newState: ai.currentState,
    action: decision.action,
    message,
    emotion,
    shouldNotify,
  }
}

function generateAIMessage(
  _pet: Pet,
  state: PetAIState,
  _emotion: AIEmotion
): string {
  const messages: Record<PetAIState, string[]> = {
    idle: ['...', 'What should we do?', 'I\'m here for you!'],
    hungry: ['I\'m hungry...', 'Food please!', 'My tummy is rumbling'],
    tired: ['I\'m sleepy...', 'Need a nap...', 'So tired...'],
    bored: ['I\'m bored...', 'Let\'s play!', 'Nothing to do...'],
    sick: ['I don\'t feel well...', 'Ouch...', 'Need care...'],
    depressed: ['I feel lonely...', 'Are you there?', 'I miss you...'],
    excited: ['Yay! Let\'s play!', 'This is fun!', 'So happy!'],
    growing: ['Something is happening...', 'I feel different...', 'Growing...'],
    critical: ['Help me...', 'I need you...', 'Please...'],
    dead: ['...', 'Thank you...', 'Goodbye...'],
    seeking_food: ['Where\'s the food?', 'Looking for snacks...', 'Hungry...'],
    going_sleep: ['Time for bed...', 'Goodnight...', 'Sleepy...'],
    playing_alone: ['This is fun!', 'Wheee!', 'Playing!'],
  }

  const stateMessages = messages[state] || messages.idle
  return stateMessages[Math.floor(Math.random() * stateMessages.length)]
}