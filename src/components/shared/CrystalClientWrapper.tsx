'use client'

import { useState, useEffect } from 'react'
import GrimoireDashboard from '../ui/GrimoireDashboard'
import GrimoireModal from '../ui/GrimoireModal'
import { updateCrystalState } from '@/app/actions/crystal-actions'
import { UserCollectionState } from '@/app/actions/sanctuary-usercollectionstate'

interface Props {
  crystals: any[]
  initialUserState: Record<string, UserCollectionState>
}

export default function CrystalClientWrapper({ crystals, initialUserState }: Props) {
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userState, setUserState] = useState(initialUserState)

  useEffect(() => { setUserState(initialUserState) }, [initialUserState])

  // Calculate unique filters (Elements)
  const uniqueElements = Array.from(new Set(crystals.map(c => c.element).filter(Boolean))).sort() as string[]

// --- GENERIC HANDLER ---
  const handleUpdate = async (id: string, field: 'isOwned' | 'isWishlisted') => {
    // 1. Get current state
    const current = userState[id] || { isOwned: false, isWishlisted: false }
    
    // 2. Calculate new state
    const newState = { 
        ...current, 
        [field]: !current[field] 
    }

    // 3. Optimistic Update (Update UI immediately)
    setUserState(prev => ({ ...prev, [id]: newState }))

    try {
        // 4. Call Server Action
        await updateCrystalState(id, {
            isOwned: newState.isOwned,
            isWishlisted: newState.isWishlisted
        })
        console.log(`Success: Updated ${id}`)
    } catch (error) {
        // 5. Revert on Error
        console.error("Action failed:", error)
        setUserState(prev => ({ ...prev, [id]: current })) // Revert to previous
        alert("Failed to update sanctuary. Are you logged in?")
    }
  }

  // Get state for the currently open modal item
  const selectedItemState = selectedItem 
    ? (userState[selectedItem.id] || { isOwned: false, isWishlisted: false })
    : { isOwned: false, isWishlisted: false }

  return (
    <>
      <GrimoireDashboard
        title="Crystal Database"
        description="Explore the properties of the earth."
        items={crystals.map(c => ({ ...c }))}
        filterCategories={uniqueElements}
        filterKey="element"
        mode="modal"
        userState={userState}
        // Pass the handlers wrapped to call our generic function
        onToggleOwned={(id) => handleUpdate(id, 'isOwned')}
        onToggleWishlist={(id) => handleUpdate(id, 'isWishlisted')}
        onItemClick={(item) => { setSelectedItem(item); setIsModalOpen(true); }}
      />

      <GrimoireModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItem}
        isOwned={selectedItem ? (userState[selectedItem.id]?.isOwned || false) : false}
        isWishlisted={selectedItem ? (userState[selectedItem.id]?.isWishlisted || false) : false}
        onToggleOwned={() => selectedItem && handleUpdate(selectedItem.id, 'isOwned')}
        onToggleWishlist={() => selectedItem && handleUpdate(selectedItem.id, 'isWishlisted')}
      />
    </>
  )
}