'use client'

import { useState, useEffect } from 'react'
import GrimoireDashboard from '../ui/GrimoireDashboard'
import GrimoireModal from '../ui/GrimoireModal'
import { updateHerbState } from '@/app/actions/herb-actions'
import { UserCollectionState } from '@/app/actions/sanctuary-usercollectionstate'

interface Props {
  herbs: any[]
  elements: string[]
  initialUserState: Record<string, UserCollectionState>
}

export default function HerbClientWrapper({ herbs, elements, initialUserState }: Props) {
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Local state for instant UI updates
  const [userState, setUserState] = useState(initialUserState)

  // Sync if server data changes
  useEffect(() => { setUserState(initialUserState) }, [initialUserState])

  // 1. Handle Card Click
//   const handleItemClick = (item: any) => {
//     setSelectedHerb(item)
//     setIsModalOpen(true)
//   }

//   // 2. Handle Collect/Wishlist Toggle (passed to Dashboard)
//   const handleToggleOwned = async (id: string) => {
//     const current = userState[id] || { isOwned: false, isWishlisted: false }
//     const newState = { ...current, isOwned: !current.isOwned }
    
//     // Optimistic Update
//     setUserState(prev => ({ ...prev, [id]: newState }))
    
//     // Server Update
//     await updateHerbState(id, newState)
//   }

// LOGIC: Toggle Ownership
  const handleToggleOwned = async (id: string) => {
    const current = userState[id] || { isOwned: false, isWishlisted: false }
    const newState = { ...current, isOwned: !current.isOwned }
    
    setUserState(prev => ({ ...prev, [id]: newState }))
    await updateHerbState(id, newState) 
  }

  // LOGIC: Toggle Wishlist
  const handleToggleWishlist = async (id: string) => {
    const current = userState[id] || { isOwned: false, isWishlisted: false }
    const newState = { ...current, isWishlisted: !current.isWishlisted }
    
    setUserState(prev => ({ ...prev, [id]: newState }))
    await updateHerbState(id, newState) 
  }

  // Get state for the currently open modal item
  const selectedItemState = selectedItem 
    ? (userState[selectedItem.id] || { isOwned: false, isWishlisted: false })
    : { isOwned: false, isWishlisted: false }

  return (
    <>
      <GrimoireDashboard
        title="Herbal Grimoire"
        description="The green spirits of the earth."
        items={herbs}
        filterCategories={elements}
        
        filterKey="element"
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