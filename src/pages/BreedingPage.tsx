import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBreedingStore } from '@/stores/breedingStore'
import { usePetStore } from '@/stores/petStore'
import { SceneBackground } from '@/components/layout/SceneBackground'
import { GeneticsCard, BreedingPreview } from '@/components/genetics'
import { ChildGenetics } from '@/types/genetics'
import { motion } from 'framer-motion'

export default function BreedingPage() {
  const navigate = useNavigate()
  const { pet } = usePetStore()
  const { publicAdultPets, loadPublicPets, sendBreedRequest } = useBreedingStore()
  const [selectedPet, setSelectedPet] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    loadPublicPets()
  }, [loadPublicPets])

  const handleBreed = (targetPetId: string) => {
    if (!pet) return
    sendBreedRequest(pet.id, targetPetId)
    alert('Breed request sent! Wait for the other player to accept. 💕')
  }

  const handleSelectPet = (p: any) => {
    setSelectedPet(p)
    setShowPreview(true)
  }

  const handlePreviewChild = (child: ChildGenetics) => {
    console.log('Preview child:', child)
    // Could show a modal with detailed genetics info
  }

  return (
    <div className="relative w-full h-full p-6 overflow-y-auto no-scrollbar">
      <SceneBackground />
      
      <div className="z-20 max-w-lg mx-auto w-full">
        <header className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/game')} className="text-white/60 text-xl">←</button>
          <h2 className="text-2xl font-black text-white">Breeding Center</h2>
        </header>

        {pet?.stage !== 'adult' ? (
          <div className="glass p-8 rounded-3xl text-center">
            <p className="text-4xl mb-4">🐣</p>
            <p className="text-white/80 font-bold mb-2">Your pet is still too young!</p>
            <p className="text-white/40 text-xs">Pet must reach Adult stage to breed.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Your Pet's Genetics */}
            <div>
              <h3 className="text-white/60 text-sm mb-3">Your Pet</h3>
              <GeneticsCard 
                genetics={pet.genetics} 
                showDetails={true}
                showAlleles={true}
              />
            </div>

            {/* Partner Selection */}
            <div>
              <p className="text-white/60 text-sm mb-3">Select a partner for {pet.name}:</p>
              {publicAdultPets.length === 0 ? (
                <p className="text-white/30 text-center py-10">No adult pets found in the wild...</p>
              ) : (
                <div className="space-y-3">
                  {publicAdultPets.map((p) => (
                    <motion.div
                      key={p.id}
                      whileTap={{ scale: 0.98 }}
                      className={`glass p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition ${
                        selectedPet?.id === p.id ? 'ring-2 ring-hagumi-pink' : ''
                      }`}
                      onClick={() => handleSelectPet(p)}
                    >
                  <div 
                    className="w-12 h-12 rounded-full flex-shrink-0"
                    style={{ background: p.genetics.color as string }}
                  />
                      <div className="flex-1">
                        <p className="font-bold text-white text-sm">{p.name}</p>
                        <p className="text-[10px] text-white/40">Owner: {p.profiles?.display_name || 'Anonymous'}</p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleBreed(p.id)
                        }}
                        className="bg-hagumi-pink px-4 py-2 rounded-xl text-white font-bold text-xs"
                      >
                        💕 Breed
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Breeding Preview */}
            {showPreview && selectedPet && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-4 border-t border-white/10"
              >
                <BreedingPreview
                  parent1={pet.genetics}
                  parent2={selectedPet.genetics}
                  onPreview={handlePreviewChild}
                />
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
