'use client'

import { useState, useEffect } from 'react'
import GrimoireDashboard from '../ui/GrimoireDashboard'
import GrimoireModal from '../ui/GrimoireModal'
import { UserCollectionState } from '@/app/actions/sanctuary-usercollectionstate'
import { updateDeityState, saveUserDeityImage } from '@/app/actions/deity-actions'
import { createClient } from '@/app/utils/supabase/client'

interface Props {
  deities: any[]
  pantheons: string[]
  initialUserState: Record<string, UserCollectionState>
}

export default function DeityClientWrapper({ deities, pantheons, initialUserState }: Props) {
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userState, setUserState] = useState(initialUserState)
  const supabase = createClient()

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

     // --- NEW: IMAGE UPLOAD HANDLER ---
      const handleImageUpload = async (id: string, file: File) => {
        // 1. Check Auth
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Not logged in")
    
        // 2. Upload to Supabase Storage
        const fileExt = file.name.split('.').pop()
        const fileName = `${id}_${Date.now()}.${fileExt}`
        const filePath = `${user.id}/${fileName}` // Must match RLS policy
    
        const { error: uploadError } = await supabase.storage
            .from('user_uploads') // Ensure this bucket exists
            .upload(filePath, file)
    
        if (uploadError) throw uploadError
    
        // 3. Save Path to DB (Server Action)
        await saveUserDeityImage(id, filePath)
    
        // 4. Update Local State so UI updates instantly
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
        category="deity"
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