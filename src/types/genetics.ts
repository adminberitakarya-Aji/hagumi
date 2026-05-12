// ─── Genetics Types ───────────────────────────────────────

export interface Allele {
  dominant: string
  dominantLabel: string
  recessive: string
  recessiveLabel: string
}

export interface AllelePair {
  pair: string
  expressed: string
}

export interface PetGenetics {
  // Basic genetics
  color: string
  colorName: string
  personality: string
  baseHungerRate: number
  baseMoodRate: number
  baseEnergyRate: number
  growthSpeed: number
  
  // Extended genetics (for breeding)
  alleles?: Record<string, AllelePair>
  isMutant?: boolean
  generation?: number
  
  // Physical traits
  size?: 'small' | 'medium' | 'large'
  earType?: 'round' | 'pointy' | 'floppy'
  tailStyle?: 'short' | 'long' | 'fluffy'
  
  // Parentage
  parentId1?: string
  parentId2?: string
}

export interface ParentGenetics {
  color: string
  colorName: string
  personality: string
  baseHungerRate: number
  baseMoodRate: number
  baseEnergyRate: number
  growthSpeed: number
}

export interface ChildGenetics extends ParentGenetics {
  alleles: Record<string, AllelePair>
  isMutant: boolean
  generation: number
}

export interface BreedingRequest {
  id: string
  requesterId: string
  requesterPetId: string
  targetId: string
  targetPetId: string
  status: 'pending' | 'accepted' | 'rejected' | 'completed'
  createdAt: string
  completedAt?: string
  childPetId?: string
}

export interface FamilyTreeNode {
  pet: PetGenetics & { id: string; name: string; stage: string }
  parents?: FamilyTreeNode[]
  children?: FamilyTreeNode[]
  depth: number
}