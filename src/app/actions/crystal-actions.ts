'use server'

import { createClient } from '../utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Define the shape of our user state including the new image
export type UserCrystalState = {
  isOwned: boolean;
  isWishlisted: boolean;
  userImage?: string | null; // Added this
}

export async function getCrystalsData() {
  const supabase = await createClient()

  const { data: crystals } = await supabase
    .from('crystals')
    .select('*')
    .order('name')

  // Fetch flags AND the new user_image_url
  const { data: collection } = await supabase
    .from('user_crystal_collection')
    .select('crystal_id, is_owned, is_wishlisted, user_image_url')

  // Map: CrystalID -> State
  const userStateMap: Record<string, UserCrystalState> = {}
  
  collection?.forEach((item) => {
    userStateMap[item.crystal_id] = { 
      isOwned: item.is_owned, 
      isWishlisted: item.is_wishlisted,
      userImage: item.user_image_url // Map the new column
    }
  })

  return { crystals, userStateMap }
}

export async function updateCrystalState(crystalId: string, newState: { isOwned: boolean; isWishlisted: boolean }) {
  const supabase = await createClient()
  const user = (await supabase.auth.getUser()).data.user
  if (!user) throw new Error('Unauthorized')

  // If both false, delete row
  if (!newState.isOwned && !newState.isWishlisted) {
    await supabase
      .from('user_crystal_collection')
      .delete()
      .match({ user_id: user.id, crystal_id: crystalId })
  } else {
    // Upsert
    await supabase
      .from('user_crystal_collection')
      .upsert({ 
        user_id: user.id, 
        crystal_id: crystalId, 
        is_owned: newState.isOwned,
        is_wishlisted: newState.isWishlisted
      }, { onConflict: 'user_id, crystal_id' })
  }

  revalidatePath('/crystals')
}

// FUNCTION: Saves the image URL to the database
export async function saveUserCrystalImage(crystalId: string, filePath: string) {
    const supabase = await createClient()
    const user = (await supabase.auth.getUser()).data.user
    if (!user) throw new Error('Unauthorized')
  
    await supabase
      .from('user_crystal_collection')
      .update({ user_image_url: filePath })
      .match({ user_id: user.id, crystal_id: crystalId })
  
    revalidatePath('/crystals')
}