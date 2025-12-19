'use client'

import { useState, useEffect } from 'react'
import GrimoireDashboard from '@/components/ui/GrimoireDashboard'
import GrimoireModal from '@/components/ui/GrimoireModal'
import { updateCandleState, UserCollectionState } from '@/app/actions/candle-actions'

interface Props {
  candles: any[]
  hex: string[]
  initialUserState: Record<string, UserCollectionState>
}

export default function CandleClientWrapper({ candles, initialUserState }: Props) {
  const [selectedCandle, setSelectedCandle] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userState, setUserState] = useState(initialUserState)

  useEffect(() => { setUserState(initialUserState) }, [initialUserState])

  // 1. Calculate Filter Categories (Unique Associations)
  // We flatten all the 'associations' arrays to get a list of intents like "Protection", "Love"
  const allAssociations = candles.flatMap(c => c.associations || [])
  const uniqueIntents = Array.from(new Set(allAssociations)).sort() as string[]

  const handleItemClick = (item: any) => {
    // DATA MAPPING:
    // The Modal expects 'magical_uses' for tags, but DB has 'associations'.
    // We create a modified object to pass to the modal so it renders correctly.
    const mappedForModal = {
      ...item,
      magical_uses: item.associations // Trick the modal into displaying these as tags
    }
    setSelectedCandle(mappedForModal)
    setIsModalOpen(true)
  }

  const handleToggleOwned = async (id: string) => {
    const current = userState[id] || { isOwned: false, isWishlisted: false }
    const newState = { ...current, isOwned: !current.isOwned }
    setUserState(prev => ({ ...prev, [id]: newState }))
    await updateCandleState(id, newState)
  }

  return (
    <>
      <GrimoireDashboard
        title="Candle Magick"
        description="Ignite your intentions with color correspondence."
        // We pass the hex_code as 'color' so the cards get the correct border
        items={candles.map(c => ({...c, color: c.hex_code}))}
        
        // Filter by Intent (Associations)
        filterCategories={uniqueIntents}
        filterKey="associations" // The Dashboard handles array checking automatically if we built it right
        // Note: If your Dashboard filter logic expects exact string match, we might need to tweak it.
        // For now, let's assume FilterKey works for 'contains' or exact match. 
        // If the dashboard doesn't filter arrays, let me know and we can tweak GrimoireDashboard.
        
        mode="modal"
        onItemClick={handleItemClick}
        userState={userState}
        onToggleItem={handleToggleOwned}
      />

      <GrimoireModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedCandle}
      />
    </>
  )
}