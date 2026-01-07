'use client'

import { useState, useEffect } from 'react'
import GrimoireDashboard from '../spellbook/GrimoireDashboard'
import GrimoireModal from '../spellbook/GrimoireModal'
import { updateRuneState, saveUserRuneImage } from '@/app/actions/rune-actions'
import { createClient } from '@/app/utils/supabase/client'
import { UserCollectionState } from '@/app/actions/sanctuary-usercollectionstate'

interface Props {
  runes: any[]
  initialUserState: Record<string, UserCollectionState>
}

export default function RuneClientWrapper({ runes, initialUserState }: Props) {
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userState, setUserState] = useState(initialUserState)
  const supabase = createClient()

  useEffect(() => { setUserState(initialUserState) }, [initialUserState])

  const uniqueElements = Array.from(new Set(runes.map(c => c.element).filter(Boolean))).sort() as string[]

  // --- GENERIC STATE UPDATE (Owned/Wishlist) ---
  const handleUpdate = async (id: string, field: 'isOwned' | 'isWishlisted') => {
    const current = userState[id] || { isOwned: false, isWishlisted: false, userImage: null }
    const newState = { ...current, [field]: !current[field] }

    setUserState(prev => ({ ...prev, [id]: newState }))

    try {
        await updateRuneState(id, {
            isOwned: newState.isOwned,
            isWishlisted: newState.isWishlisted
        })
    } catch (error) {
        setUserState(prev => ({ ...prev, [id]: current }))
        console.error("Update failed", error)
    }
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
    await saveUserRuneImage(id, filePath)

    // 4. Update Local State
    setUserState(prev => ({
        ...prev,
        [id]: { ...prev[id], userImage: filePath }
    }))
    
    return filePath
  }

  // Current State for Modal
  const selectedItemState = selectedItem 
    ? (userState[selectedItem.id] || { isOwned: false, isWishlisted: false, userImage: null })
    : { isOwned: false, isWishlisted: false, userImage: null }

  return (
    <>
      <GrimoireDashboard
        title="Rune Database"
        description="Explore the properties of the earth."
        items={runes}
        filterCategories={uniqueElements}
        filterKey="element"
        mode="modal"
        userState={userState}
        onToggleOwned={(id) => handleUpdate(id, 'isOwned')}
        onToggleWishlist={(id) => handleUpdate(id, 'isWishlisted')}
        onItemClick={(item) => { setSelectedItem(item); setIsModalOpen(true); }}
      />

      <GrimoireModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItem}
        category="rune"
        // Pass State
        isOwned={selectedItemState.isOwned}
        isWishlisted={selectedItemState.isWishlisted}
        userImage={selectedItemState.userImage} // NEW: Pass the image path
        
        // Pass Handlers
        onToggleOwned={() => selectedItem && handleUpdate(selectedItem.id, 'isOwned')}
        onToggleWishlist={() => selectedItem && handleUpdate(selectedItem.id, 'isWishlisted')}
        
        // NEW: Pass the specific upload logic for Runes
        onImageUpload={(file) => selectedItem ? handleImageUpload(selectedItem.id, file) : Promise.reject()}
      />
    </>
  )
}