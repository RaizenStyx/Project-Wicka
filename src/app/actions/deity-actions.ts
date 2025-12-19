'use server'

import { createClient } from '../utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { UserCollectionState } from './herb-actions' // Reuse the type if you want, or redefine

export async function getDeitiesData() {
  const supabase = await createClient()

  const { data: deities, error } = await supabase
    .from('deities')
    .select('*')
    .order('name')

  if (error) console.error(error)

  const { data: collection } = await supabase
    .from('user_deities')
    .select('deity_id, is_wishlisted, user_image_url, is_patron')

  const userStateMap: Record<string, UserCollectionState & { isPatron?: boolean }> = {}
  
  collection?.forEach((item) => {
    userStateMap[item.deity_id] = { 
      isOwned: true, 
      isWishlisted: item.is_wishlisted || false,
      userImage: item.user_image_url,
      isPatron: item.is_patron
    }
  })

  return { deities: deities || [], userStateMap }
}

export async function updateDeityState(deityId: string, newState: { isOwned: boolean; isWishlisted: boolean }) {
  const supabase = await createClient()
  const user = (await supabase.auth.getUser()).data.user
  if (!user) throw new Error('Unauthorized')

  if (!newState.isOwned && !newState.isWishlisted) {
    await supabase
      .from('user_deities')
      .delete()
      .match({ user_id: user.id, deity_id: deityId })
  } else {
    await supabase
      .from('user_deities')
      .upsert({ 
        user_id: user.id, 
        deity_id: deityId, 
        is_wishlisted: newState.isWishlisted,
        // We ensure a row exists. 'is_patron' would be handled by a separate toggle if you wanted.
      }, { onConflict: 'user_id, deity_id' } as any)
  }

  revalidatePath('/deities')
}

export async function saveUserDeityImage(deityId: string, filePath: string) {
    const supabase = await createClient()
    const user = (await supabase.auth.getUser()).data.user
    if (!user) throw new Error('Unauthorized')
  
    await supabase
      .from('user_deities')
      .update({ user_image_url: filePath })
      .match({ user_id: user.id, deity_id: deityId })
  
    revalidatePath('/deities')
}