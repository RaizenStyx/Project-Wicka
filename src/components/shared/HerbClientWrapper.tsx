'use client'

import { useState, useEffect } from 'react'
import GrimoireDashboard from '../ui/GrimoireDashboard'
import GrimoireModal from '../ui/GrimoireModal'
import { updateHerbState, UserCollectionState } from '@/app/actions/herb-actions'

interface Props {
  herbs: any[]
  elements: string[]
  initialUserState: Record<string, UserCollectionState>
}

export default function HerbClientWrapper({ herbs, elements, initialUserState }: Props) {
  const [selectedHerb, setSelectedHerb] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Local state for instant UI updates
  const [userState, setUserState] = useState(initialUserState)

  // Sync if server data changes
  useEffect(() => { setUserState(initialUserState) }, [initialUserState])

  // 1. Handle Card Click
  const handleItemClick = (item: any) => {
    setSelectedHerb(item)
    setIsModalOpen(true)
  }

  // 2. Handle Collect/Wishlist Toggle (passed to Dashboard)
  const handleToggleOwned = async (id: string) => {
    const current = userState[id] || { isOwned: false, isWishlisted: false }
    const newState = { ...current, isOwned: !current.isOwned }
    
    // Optimistic Update
    setUserState(prev => ({ ...prev, [id]: newState }))
    
    // Server Update
    await updateHerbState(id, newState)
  }

  return (
    <>
      <GrimoireDashboard
        title="Herbal Grimoire"
        description="The green spirits of the earth."
        items={herbs}
        filterCategories={elements}
        filterKey="element"
        mode="modal"
        
        // INTERACTION PROPS
        onItemClick={handleItemClick}
        userState={userState}
        onToggleItem={handleToggleOwned} 
      />

      <GrimoireModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedHerb}
      />
    </>
  )
}