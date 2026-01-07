'use server'

import { createClient } from '../utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { UserCollectionState } from './sanctuary-usercollectionstate'

export async function getRunesData() {
  const supabase = await createClient()

  // 1. Get Current User (Required for filtering)
  const { data: { user } } = await supabase.auth.getUser()
  
  // If no user, return empty state immediately to prevent errors
  if (!user) {
      return { runes: [], userStateMap: {} }
  }

  // 2. Fetch Static rune Data
  const { data: runes, error } = await supabase
    .from('runes')
    .select('*')
    .order('name')
  
  if (error) console.error("Error fetching runes:", error)

  // 3. Fetch User Flags 
  const { data: collection } = await supabase
    .from('user_runes')
    .select('rune_id, is_owned, is_wishlisted, user_image_url')
    .eq('user_id', user.id)
  
  // 4. Map: runeID -> State
  const userStateMap: Record<string, UserCollectionState> = {}
  
  collection?.forEach((item) => {
    userStateMap[item.rune_id] = { 
      isOwned: item.is_owned, 
      isWishlisted: item.is_wishlisted,
      userImage: item.user_image_url 
    }
  })

  return { runes: runes || [], userStateMap }
}

export async function updateRuneState(runeId: string, newState: { isOwned: boolean; isWishlisted: boolean }) {
  const supabase = await createClient()
  const user = (await supabase.auth.getUser()).data.user
  if (!user) throw new Error('Unauthorized')

  if (!newState.isOwned && !newState.isWishlisted) {
    await supabase
      .from('user_runes')
      .delete()
      .match({ user_id: user.id, rune_id: runeId })
  } else {
    await supabase
      .from('user_runes')
      .upsert({ 
        user_id: user.id, 
        rune_id: runeId, 
        is_owned: newState.isOwned,
        is_wishlisted: newState.isWishlisted
      }, { onConflict: 'user_id, rune_id' } as any)
  }

  revalidatePath('/runes')
  revalidatePath('/sanctuary') // Ensure sanctuary updates too
}

export async function saveUserRuneImage(runeId: string, filePath: string) {
    const supabase = await createClient()
    const user = (await supabase.auth.getUser()).data.user
    if (!user) throw new Error('Unauthorized')
  
    await supabase
      .from('user_runes')
      .update({ user_image_url: filePath })
      .match({ user_id: user.id, rune_id: runeId })
  
    revalidatePath('/runes')
}