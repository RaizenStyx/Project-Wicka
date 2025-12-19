'use server'

import { createClient } from '../utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { UserCollectionState } from './sanctuary-usercollectionstate'

export async function getCrystalsData() {
  const supabase = await createClient()

  const { data: crystals, error } = await supabase
    .from('crystals')
    .select('*')
    .order('name')
  
  if (error) console.error("Error fetching crystals:", error)

  // Fetch flags
  const { data: collection } = await supabase
    .from('user_crystals')
    .select('crystal_id, is_owned, is_wishlisted, user_image_url')

  // Map: CrystalID -> State
  const userStateMap: Record<string, UserCollectionState> = {}
  
  collection?.forEach((item) => {
    userStateMap[item.crystal_id] = { 
      isOwned: item.is_owned, 
      isWishlisted: item.is_wishlisted,
      userImage: item.user_image_url
    }
  })

  // THE FIX: Explicitly return [] if null, ensuring it is always an Array
  return { crystals: crystals || [], userStateMap }
}

export async function updateCrystalState(crystalId: string, newState: { isOwned: boolean; isWishlisted: boolean }) {
  const supabase = await createClient()
  const user = (await supabase.auth.getUser()).data.user
  if (!user) throw new Error('Unauthorized')

  if (!newState.isOwned && !newState.isWishlisted) {
    await supabase
      .from('user_crystals')
      .delete()
      .match({ user_id: user.id, crystal_id: crystalId })
  } else {
    await supabase
      .from('user_crystals')
      .upsert({ 
        user_id: user.id, 
        crystal_id: crystalId, 
        is_owned: newState.isOwned,
        is_wishlisted: newState.isWishlisted
      }, { onConflict: 'user_id, crystal_id' } as any)
  }

  revalidatePath('/crystals')
  revalidatePath('/sanctuary') // Ensure sanctuary updates too
}

export async function saveUserCrystalImage(crystalId: string, filePath: string) {
    const supabase = await createClient()
    const user = (await supabase.auth.getUser()).data.user
    if (!user) throw new Error('Unauthorized')
  
    await supabase
      .from('user_crystals')
      .update({ user_image_url: filePath })
      .match({ user_id: user.id, crystal_id: crystalId })
  
    revalidatePath('/crystals')
}