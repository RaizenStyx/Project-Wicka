'use client'

import { useState, useEffect } from 'react'
import GrimoireDashboard from '../ui/GrimoireDashboard'
import GrimoireModal from '../ui/GrimoireModal'
import { UserCollectionState } from '@/app/actions/herb-actions'
import { updateDeityState } from '@/app/actions/deity-actions'

interface Props {
  deities: any[]
  pantheons: string[]
  initialUserState: Record<string, UserCollectionState>
}

export default function DeityClientWrapper({ deities, pantheons, initialUserState }: Props) {
  const [selectedDeity, setSelectedDeity] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userState, setUserState] = useState(initialUserState)

  useEffect(() => { setUserState(initialUserState) }, [initialUserState])

  const handleItemClick = (item: any) => {
    setSelectedDeity(item)
    setIsModalOpen(true)
  }

  const handleToggleOwned = async (id: string) => {
    const current = userState[id] || { isOwned: false, isWishlisted: false }
    const newState = { ...current, isOwned: !current.isOwned }
    
    setUserState(prev => ({ ...prev, [id]: newState }))
    await updateDeityState(id, newState)
  }

  return (
    <>
      <GrimoireDashboard
        title="Divine Pantheon"
        description="Gods and Goddesses of the ancient world."
        items={deities}
        filterCategories={pantheons}
        filterKey="pantheon"
        mode="modal"
        
        onItemClick={handleItemClick}
        userState={userState}
        onToggleItem={handleToggleOwned}
      />

      <GrimoireModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedDeity}
      />
    </>
  )
}