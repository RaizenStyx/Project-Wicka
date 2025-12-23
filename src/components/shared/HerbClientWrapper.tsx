'use client'

import { useState, useEffect } from 'react'
import GrimoireDashboard from '../ui/GrimoireDashboard'
import GrimoireModal from '../ui/GrimoireModal'
import { updateHerbState, saveUserHerbImage } from '@/app/actions/herb-actions'
import { UserCollectionState } from '@/app/actions/sanctuary-usercollectionstate'
import { createClient } from '@/app/utils/supabase/client'

interface Props {
  herbs: any[]
  elements: string[]
  initialUserState: Record<string, UserCollectionState>
}

export default function HerbClientWrapper({ herbs, elements, initialUserState }: Props) {
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const supabase = createClient()
  
  // Local state for instant UI updates
  const [userState, setUserState] = useState(initialUserState)

  // Sync if server data changes
  useEffect(() => { setUserState(initialUserState) }, [initialUserState])

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

  // --- NEW: IMAGE UPLOAD HANDLER ---
    const handleImageUpload = async (id: string, file: File) => {
      // 1. Check Auth
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not logged in")
  
      // 2. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${id}_${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}` // Must match RLS
  
      const { error: uploadError } = await supabase.storage
          .from('user_uploads')
          .upload(filePath, file)
  
      if (uploadError) throw uploadError
  
      // 3. Save Path to DB (Server Action)
      await saveUserHerbImage(id, filePath)
  
      // 4. Update Local State
      setUserState(prev => ({
          ...prev,
          [id]: { ...prev[id], userImage: filePath }
      }))
      
      return filePath
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
        category="herb"
        // Pass the live state to the modal
        isOwned={selectedItemState.isOwned}
        isWishlisted={selectedItemState.isWishlisted}
        onToggleOwned={() => selectedItem && handleToggleOwned(selectedItem.id)}
        onToggleWishlist={() => selectedItem && handleToggleWishlist(selectedItem.id)}
        // 4. Pass Upload Handler
        onImageUpload={(file) => selectedItem ? handleImageUpload(selectedItem.id, file) : Promise.reject()}
      />
    </>
  )
}