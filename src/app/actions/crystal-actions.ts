'use server'

import { createClient } from '../utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getCrystalsData() {
  const supabase = await createClient()

  const { data: crystals } = await supabase
    .from('crystals')
    .select('*')
    .order('name')

  // Fetch only the flags we need
  const { data: collection } = await supabase
    .from('user_crystal_collection')
    .select('crystal_id, is_owned, is_wishlisted')

  // Map: CrystalID -> { isOwned, isWishlisted }
  const userStateMap: Record<string, { isOwned: boolean; isWishlisted: boolean }> = {}
  
  collection?.forEach((item) => {
    userStateMap[item.crystal_id] = { 
      isOwned: item.is_owned, 
      isWishlisted: item.is_wishlisted 
    }
  })

  return { crystals, userStateMap }
}

export async function updateCrystalState(crystalId: string, newState: { isOwned: boolean; isWishlisted: boolean }) {
  const supabase = await createClient()
  const user = (await supabase.auth.getUser()).data.user
  if (!user) throw new Error('Unauthorized')

  // 1. If both are false, we delete the row (clean up)
  if (!newState.isOwned && !newState.isWishlisted) {
    await supabase
      .from('user_crystal_collection')
      .delete()
      .match({ user_id: user.id, crystal_id: crystalId })
  } else {
    // 2. Otherwise, we upsert the new flags
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