'use server'

import { createClient } from '../utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { UserCollectionState } from './sanctuary-usercollectionstate'

export async function getDeitiesData() {
  const supabase = await createClient()

  const { data: deities, error } = await supabase
    .from('deities')
    .select('*')
    .order('name')

  if (error) console.error(error)

  const { data: collection } = await supabase
    .from('user_deities')
    .select('deity_id, is_invoked, is_owned, is_wishlisted, user_image_url, last_invoked_at, last_offering_at')

  const userStateMap: Record<string, UserCollectionState & { 
    isInvoked?: boolean; 
    lastInvokedAt?: string | null; 
    lastOfferingAt?: string | null; 
  }> = {}
  
  collection?.forEach((item) => {
    userStateMap[item.deity_id] = { 
      isOwned: item.is_owned, 
      isWishlisted: item.is_wishlisted,
      userImage: item.user_image_url,
      isInvoked: item.is_invoked, 
      lastInvokedAt: item.last_invoked_at,
      lastOfferingAt: item.last_offering_at
    }
  })

  return { deities: deities || [], userStateMap }
}

export async function updateDeityState(deityId: string, newState: { isOwned: boolean; isWishlisted: boolean }) {
  const supabase = await createClient()
  const user = (await supabase.auth.getUser()).data.user
  if (!user) throw new Error('Unauthorized')

  // Prevent "Ghost Rows" - if they have nothing set, delete the row
  // Note: We also check is_invoked. We don't want to delete the row if they are currently invoking the deity!
  
  // 1. Check if they are currently invoking (we need to know this before deciding to delete)
  const { data: current } = await supabase.from('user_deities').select('is_invoked').match({ user_id: user.id, deity_id: deityId }).single()
  const isInvoked = current?.is_invoked || false

  if (!newState.isOwned && !newState.isWishlisted && !isInvoked) {
    const {error} = await supabase
      .from('user_deities')
      .delete()
      .match({ user_id: user.id, deity_id: deityId })
      if (error) throw error;
  } else {
    const {error} = await supabase
      .from('user_deities')
      .upsert({ 
        user_id: user.id, 
        deity_id: deityId, 
        is_owned: newState.isOwned,
        is_wishlisted: newState.isWishlisted,
        // We DON'T touch is_invoked here. That is handled by the specialized actions.
      }, { onConflict: 'user_id, deity_id' })
      if (error) throw error;
  }

  revalidatePath('/deities')
  revalidatePath('/sanctuary')
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