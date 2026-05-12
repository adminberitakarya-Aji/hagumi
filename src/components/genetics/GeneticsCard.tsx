import { PetGenetics } from '@/types/genetics'
import { motion } from 'framer-motion'

interface GeneticsCardProps {
  genetics: PetGenetics
  showDetails?: boolean
  showAlleles?: boolean
}

export function GeneticsCard({ genetics, showDetails = false, showAlleles = false }: GeneticsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-4 rounded-2xl space-y-3"
    >
      {/* Color Preview */}
      <div className="flex items-center gap-3">
        <div 
          className="w-16 h-16 rounded-2xl shadow-lg"
          style={{ background: genetics.color }}
        />
        <div className="flex-1">
          <h3 className="font-bold text-white text-lg">{genetics.colorName}</h3>
          {genetics.isMutant && (
            <span className="inline-block px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full mt-1">
              🧬 Mutant
            </span>
          )}
          {genetics.generation !== undefined && (
            <p className="text-white/40 text-xs">Generation {genetics.generation}</p>
          )}
        </div>
      </div>

      {/* Personality */}
      <div className="flex items-center justify-between">
        <span className="text-white/60 text-sm">Personality</span>
        <span className="text-white font-medium capitalize">{genetics.personality}</span>
      </div>

      {/* Physical Traits */}
      {showDetails && (
        <div className="space-y-2 pt-2 border-t border-white/10">
          {genetics.size && (
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">Size</span>
              <span className="text-white font-medium capitalize">{genetics.size}</span>
            </div>
          )}
          {genetics.earType && (
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">Ears</span>
              <span className="text-white font-medium capitalize">{genetics.earType}</span>
            </div>
          )}
          {genetics.tailStyle && (
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">Tail</span>
              <span className="text-white font-medium capitalize">{genetics.tailStyle}</span>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      {showDetails && (
        <div className="space-y-2 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-sm">Hunger Rate</span>
            <span className="text-white font-medium">{(genetics.baseHungerRate * 100).toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-sm">Mood Rate</span>
            <span className="text-white font-medium">{(genetics.baseMoodRate * 100).toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-sm">Energy Rate</span>
            <span className="text-white font-medium">{(genetics.baseEnergyRate * 100).toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-sm">Growth Speed</span>
            <span className="text-white font-medium">{(genetics.growthSpeed * 100).toFixed(1)}%</span>
          </div>
        </div>
      )}

      {/* Alleles */}
      {showAlleles && genetics.alleles && (
        <div className="space-y-2 pt-2 border-t border-white/10">
          <p className="text-white/60 text-sm font-medium">Genotype</p>
          {Object.entries(genetics.alleles).map(([trait, info]) => (
            <div key={trait} className="flex items-center justify-between">
              <span className="text-white/60 text-xs capitalize">{trait}</span>
              <span className="text-white font-mono text-xs">
                {info.pair} → {info.expressed}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}