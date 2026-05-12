import { PetGenetics, ChildGenetics } from '@/types/genetics'
import { combineGenetics, describeGenotype } from '@/lib/geneticsEngine'
import { motion } from 'framer-motion'
import { useState } from 'react'

interface BreedingPreviewProps {
  parent1: PetGenetics
  parent2: PetGenetics
  onPreview?: (child: ChildGenetics) => void
}

export function BreedingPreview({ parent1, parent2, onPreview }: BreedingPreviewProps) {
  const [previewCount, setPreviewCount] = useState(4)
  const [previews, setPreviews] = useState<ChildGenetics[]>([])

  const generatePreviews = () => {
    const newPreviews = []
    const generation = Math.max(
      parent1.generation || 0,
      parent2.generation || 0
    )

    for (let i = 0; i < previewCount; i++) {
      const child = combineGenetics(
        {
          color: parent1.color,
          colorName: parent1.colorName,
          personality: parent1.personality,
          baseHungerRate: parent1.baseHungerRate,
          baseMoodRate: parent1.baseMoodRate,
          baseEnergyRate: parent1.baseEnergyRate,
          growthSpeed: parent1.growthSpeed,
        },
        {
          color: parent2.color,
          colorName: parent2.colorName,
          personality: parent2.personality,
          baseHungerRate: parent2.baseHungerRate,
          baseMoodRate: parent2.baseMoodRate,
          baseEnergyRate: parent2.baseEnergyRate,
          growthSpeed: parent2.growthSpeed,
        },
        generation
      )
      newPreviews.push(child)
    }

    setPreviews(newPreviews)
  }

  const handlePreview = (child: ChildGenetics) => {
    if (onPreview) {
      onPreview(child)
    }
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold">Breeding Preview</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewCount(Math.max(1, previewCount - 1))}
            className="w-8 h-8 rounded-lg bg-white/10 text-white font-bold hover:bg-white/20 transition"
          >
            -
          </button>
          <span className="text-white/60 text-sm w-8 text-center">{previewCount}</span>
          <button
            onClick={() => setPreviewCount(Math.min(8, previewCount + 1))}
            className="w-8 h-8 rounded-lg bg-white/10 text-white font-bold hover:bg-white/20 transition"
          >
            +
          </button>
          <button
            onClick={generatePreviews}
            className="px-4 py-2 rounded-lg bg-hagumi-pink text-white font-bold text-sm hover:bg-pink-500 transition"
          >
            Generate
          </button>
        </div>
      </div>

      {/* Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {previews.map((child, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="glass p-3 rounded-xl space-y-2 cursor-pointer hover:bg-white/10 transition"
              onClick={() => handlePreview(child)}
            >
              {/* Color Preview */}
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-lg shadow"
                  style={{ background: child.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">
                    {child.colorName}
                  </p>
                  {child.isMutant && (
                    <span className="text-purple-300 text-xs">🧬 Mutant</span>
                  )}
                </div>
              </div>

              {/* Personality */}
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-xs">Personality</span>
                <span className="text-white text-xs capitalize">{child.personality}</span>
              </div>

              {/* Generation */}
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-xs">Generation</span>
                <span className="text-white text-xs">{child.generation}</span>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-1 pt-2 border-t border-white/10">
                <div className="text-center">
                  <p className="text-white/40 text-[10px]">Growth</p>
                  <p className="text-white text-xs font-medium">
                    {(child.growthSpeed * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-white/40 text-[10px]">Hunger</p>
                  <p className="text-white text-xs font-medium">
                    {(child.baseHungerRate * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Genetics Info */}
      {previews.length > 0 && (
        <div className="glass p-3 rounded-xl">
          <h4 className="text-white/60 text-sm font-medium mb-2">Genetics Analysis</h4>
          <div className="space-y-1">
            {previews.map((child, index) => (
              <div key={index} className="text-xs">
                <p className="text-white/40">Offspring #{index + 1}:</p>
                {describeGenotype(child).map((line, i) => (
                  <p key={i} className="text-white/60 pl-2">
                    {line}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}