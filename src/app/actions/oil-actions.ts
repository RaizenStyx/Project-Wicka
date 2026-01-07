'use server'

import { createClient } from '../utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { UserCollectionState } from './sanctuary-usercollectionstate'

export async function getOilsData() {
  const supabase = await createClient()

  // 1. Get Current User (Required for filtering)
  const { data: { user } } = await supabase.auth.getUser()
  
  // If no user, return empty state immediately to prevent errors
  if (!user) {
      return { oils: [], userStateMap: {} }
  }

  // 2. Fetch Static oil Data
  const { data: oils, error } = await supabase
    .from('essential_oils')
    .select('*')
    .order('name')
  
  if (error) console.error("Error fetching oils:", error)

  // 3. Fetch User Flags 
  const { data: collection } = await supabase
    .from('user_oils')
    .select('oil_id, is_owned, is_wishlisted, user_image_url')
    .eq('user_id', user.id)
  
  // 4. Map: oilID -> State
  const userStateMap: Record<string, UserCollectionState> = {}
  
  collection?.forEach((item) => {
    userStateMap[item.oil_id] = { 
      isOwned: item.is_owned, 
      isWishlisted: item.is_wishlisted,
      userImage: item.user_image_url 
    }
  })

  return { oils: oils || [], userStateMap }
}

export async function updateOilState(oilId: string, newState: { isOwned: boolean; isWishlisted: boolean }) {
  const supabase = await createClient()
  const user = (await supabase.auth.getUser()).data.user
  if (!user) throw new Error('Unauthorized')

  if (!newState.isOwned && !newState.isWishlisted) {
    await supabase
      .from('user_oils')
      .delete()
      .match({ user_id: user.id, oil_id: oilId })
  } else {
    await supabase
      .from('user_oils')
      .upsert({ 
        user_id: user.id, 
        oil_id: oilId, 
        is_owned: newState.isOwned,
        is_wishlisted: newState.isWishlisted
      }, { onConflict: 'user_id, oil_id' } as any)
  }

  revalidatePath('/oils')
  revalidatePath('/sanctuary') // Ensure sanctuary updates too
}

export async function saveUserOilImage(oilId: string, filePath: string) {
    const supabase = await createClient()
    const user = (await supabase.auth.getUser()).data.user
    if (!user) throw new Error('Unauthorized')
  
    await supabase
      .from('user_oils')
      .update({ user_image_url: filePath })
      .match({ user_id: user.id, oil_id: oilId })
  
    revalidatePath('/oils')
}