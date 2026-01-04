'use client'

import { useState, useEffect } from 'react'
import GrimoireDashboard from '../spellbook/GrimoireDashboard'
import DeityModal from '../deities/DeityModal' 
import { UserCollectionState } from '@/app/actions/sanctuary-usercollectionstate'
import { updateDeityState } from '@/app/actions/deity-actions'


interface Props {
  deities: any[]
  pantheons: string[]
  initialUserState: Record<string, UserCollectionState & { isInvoked?: boolean; lastInvokedAt?: string }>
}

export default function DeityClientWrapper({ deities, pantheons, initialUserState }: Props) {
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userState, setUserState] = useState(initialUserState)

  useEffect(() => { setUserState(initialUserState) }, [initialUserState])

  // LOGIC: Toggle Ownership (Physical Statue)
  const handleToggleOwned = async (id: string) => {
      const current = userState[id] || { isOwned: false, isWishlisted: false }
      const newState = { ...current, isOwned: !current.isOwned }
      
      setUserState(prev => ({ ...prev, [id]: newState }))
      await updateDeityState(id, newState) 
  }
  
  // LOGIC: Toggle Wishlist (Roster)
  const handleToggleWishlist = async (id: string) => {
      const current = userState[id] || { isOwned: false, isWishlisted: false }
      const newState = { ...current, isWishlisted: !current.isWishlisted }
      
      setUserState(prev => ({ ...prev, [id]: newState }))
      await updateDeityState(id, newState) 
  }

// Get state for the currently open modal item
const selectedItemState = selectedItem 
    ? (userState[selectedItem.id] || { isOwned: false, isWishlisted: false, isInvoked: false, lastInvokedAt: null, lastOfferingAt: null })
    : { isOwned: false, isWishlisted: false, isInvoked: false, lastInvokedAt: null, lastOfferingAt: null }

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
        // We keep these toggles for the CARD view (Heart/Checkmark)
        onToggleOwned={handleToggleOwned}
        onToggleWishlist={handleToggleWishlist}
        onItemClick={(item) => { setSelectedItem(item); setIsModalOpen(true); }}
      />

      {/* NEW SPECIALIZED MODAL */}
      <DeityModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        deity={selectedItem}
        
        // Pass the specialized state
        isInvoked={selectedItemState.isInvoked || false}
        isOwned={selectedItemState.isOwned}
        lastInvokedAt={selectedItemState.lastInvokedAt}
        lastOfferingAt={selectedItemState.lastOfferingAt}
      />
    </>
  )
}