'use client'

import { useState, useEffect } from 'react'
import GrimoireDashboard from '../ui/GrimoireDashboard'
import GrimoireModal from '../ui/GrimoireModal'
import { UserCollectionState } from '@/app/actions/sanctuary-usercollectionstate'
import { updateDeityState } from '@/app/actions/deity-actions'

interface Props {
  deities: any[]
  pantheons: string[]
  initialUserState: Record<string, UserCollectionState>
}

export default function DeityClientWrapper({ deities, pantheons, initialUserState }: Props) {
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userState, setUserState] = useState(initialUserState)

  useEffect(() => { setUserState(initialUserState) }, [initialUserState])

  // LOGIC: Toggle Ownership
    const handleToggleOwned = async (id: string) => {
      const current = userState[id] || { isOwned: false, isWishlisted: false }
      const newState = { ...current, isOwned: !current.isOwned }
      
      setUserState(prev => ({ ...prev, [id]: newState }))
      await updateDeityState(id, newState) 
    }
  
    // LOGIC: Toggle Wishlist
    const handleToggleWishlist = async (id: string) => {
      const current = userState[id] || { isOwned: false, isWishlisted: false }
      const newState = { ...current, isWishlisted: !current.isWishlisted }
      
      setUserState(prev => ({ ...prev, [id]: newState }))
      await updateDeityState(id, newState) 
    }
  
    // Get state for the currently open modal item
    const selectedItemState = selectedItem 
      ? (userState[selectedItem.id] || { isOwned: false, isWishlisted: false })
      : { isOwned: false, isWishlisted: false }

  return (
    <>
      <GrimoireDashboard
        title="Divine Pantheon"
        description="Gods and Goddesses of the ancient world."
        items={deities}
        filterCategories={pantheons}

        filterKey="pantheon"
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