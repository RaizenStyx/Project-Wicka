'use client'

import { useState, useEffect } from 'react'
import GrimoireDashboard from '../spellbook/GrimoireDashboard'
import DeityModal from '../deities/DeityModal' 
import { UserCollectionState } from '@/app/actions/sanctuary-usercollectionstate'
import { updateDeityState } from '@/app/actions/deity-actions'

interface Props {
  deities: any[]
  pantheons: string[]
  // Updated type definition to include lastOfferingAt
  initialUserState: Record<string, UserCollectionState & { isInvoked?: boolean; lastInvokedAt?: string; lastOfferingAt?: string }>
}

export default function DeityClientWrapper({ deities, pantheons, initialUserState }: Props) {
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userState, setUserState] = useState(initialUserState)

  useEffect(() => { setUserState(initialUserState) }, [initialUserState])

  const handleToggleOwned = async (id: string) => {
      const current = userState[id] || { isOwned: false, isWishlisted: false }
      const newState = { ...current, isOwned: !current.isOwned }
      setUserState(prev => ({ ...prev, [id]: newState }))
      await updateDeityState(id, newState) 
  }
  
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
        onToggleOwned={handleToggleOwned}
        onToggleWishlist={handleToggleWishlist}
        onItemClick={(item) => { setSelectedItem(item); setIsModalOpen(true); }}
      />

      <DeityModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        deity={selectedItem}
        
        isInvoked={selectedItemState.isInvoked || false}
        isOwned={selectedItemState.isOwned}
        lastInvokedAt={selectedItemState.lastInvokedAt}
        lastOfferingAt={selectedItemState.lastOfferingAt} // Passing the data!
      />
    </>
  )
}