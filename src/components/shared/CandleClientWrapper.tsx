'use client'

import { useState, useEffect } from 'react'
import GrimoireDashboard from '@/components/ui/GrimoireDashboard'
import GrimoireModal from '@/components/ui/GrimoireModal'
import { updateCandleState } from '@/app/actions/candle-actions'
import { UserCollectionState } from '@/app/actions/sanctuary-usercollectionstate'

interface Props {
  candles: any[]
  initialUserState: Record<string, UserCollectionState>
}

export default function CandleClientWrapper({ candles, initialUserState }: Props) {
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userState, setUserState] = useState(initialUserState)

  useEffect(() => { setUserState(initialUserState) }, [initialUserState])

  // 1. Calculate Filter Categories (Unique Associations)
  // We flatten all the 'associations' arrays to get a list of intents like "Protection", "Love"
  const allAssociations = candles.flatMap(c => c.associations || [])
  const uniqueIntents = Array.from(new Set(allAssociations)).sort() as string[]

// LOGIC: Toggle Ownership
  const handleToggleOwned = async (id: string) => {
    const current = userState[id] || { isOwned: false, isWishlisted: false }
    const newState = { ...current, isOwned: !current.isOwned }
    
    // 1. Optimistic Update
    setUserState(prev => ({ ...prev, [id]: newState }))

    try {
        // 2. Server Action
        await updateCandleState(id, newState) 
    } catch (error) {
        // 3. Revert on Error
        console.error("Candle update failed:", error)
        setUserState(prev => ({ ...prev, [id]: current }))
        alert("Could not update sanctuary. Check your permissions.")
    }
  }

  // LOGIC: Toggle Wishlist
  const handleToggleWishlist = async (id: string) => {
    const current = userState[id] || { isOwned: false, isWishlisted: false }
    const newState = { ...current, isWishlisted: !current.isWishlisted }
    
    // 1. Optimistic Update
    setUserState(prev => ({ ...prev, [id]: newState }))

    try {
        // 2. Server Action
        await updateCandleState(id, newState) 
    } catch (error) {
        // 3. Revert on Error
        console.error("Candle update failed:", error)
        setUserState(prev => ({ ...prev, [id]: current }))
        alert("Could not update wishlist. Check your permissions.")
    }
  }

  // Get state for the currently open modal item
  const selectedItemState = selectedItem 
    ? (userState[selectedItem.id] || { isOwned: false, isWishlisted: false })
    : { isOwned: false, isWishlisted: false }

  return (
    <>
      <GrimoireDashboard
        title="Candle Magick"
        description="Ignite your intentions with color correspondence."
        items={candles.map(c => ({
            ...c, 
            color: c.hex_code 
        }))}
        // ----------------
        
        // Filter by Intent (Associations)
        filterCategories={uniqueIntents}
        filterKey="associations" 

        mode="modal"
        userState={userState}
        onToggleOwned={handleToggleOwned}
        onToggleWishlist={handleToggleWishlist}
        onItemClick={(item) => { setSelectedItem(item); setIsModalOpen(true); }}
      />

      <GrimoireModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItem}
        // Pass the live state to the modal
        isOwned={selectedItemState.isOwned}
        isWishlisted={selectedItemState.isWishlisted}
        onToggleOwned={() => selectedItem && handleToggleOwned(selectedItem.id)}
        onToggleWishlist={() => selectedItem && handleToggleWishlist(selectedItem.id)}
      />
    </>
  )
}