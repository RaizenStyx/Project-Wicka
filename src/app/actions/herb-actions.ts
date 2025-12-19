'use server'

import { createClient } from '../utils/supabase/server';
import { revalidatePath } from 'next/cache'
import { UserCollectionState } from './sanctuary-usercollectionstate'

export async function getHerbsData() {
  const supabase = await createClient()

  // 1. Fetch Public Herbs
  const { data: herbs, error } = await supabase
    .from('herbs')
    .select('*')
    .order('name')

  if (error) console.error('Error fetching herbs:', error)

  // 2. Fetch User's Collection
  const { data: collection } = await supabase
    .from('user_herbs')
    .select('herb_id, is_wishlisted, user_image_url') 
    // Note: If a row exists, we assume isOwned = true roughly, 
    // but typically we check if the row exists at all for "ownership"

  // 3. Map it for the Client
  const userStateMap: Record<string, UserCollectionState> = {}
  
  collection?.forEach((item) => {
    userStateMap[item.herb_id] = { 
      isOwned: true, // If the row exists, they have some relationship to it
      isWishlisted: item.is_wishlisted || false,
      userImage: item.user_image_url
    }
  })

  return { herbs: herbs || [], userStateMap }
}

export async function updateHerbState(herbId: string, newState: { isOwned: boolean; isWishlisted: boolean }) {
  const supabase = await createClient()
  const user = (await supabase.auth.getUser()).data.user
  if (!user) throw new Error('Unauthorized')

  // If both are false, we remove the item from their "Sanctuary" entirely
  if (!newState.isOwned && !newState.isWishlisted) {
    await supabase
      .from('user_herbs')
      .delete()
      .match({ user_id: user.id, herb_id: herbId })
  } else {
    // Upsert: Create or Update
    await supabase
      .from('user_herbs')
      .upsert({ 
        user_id: user.id, 
        herb_id: herbId,
        // If they click "Add to Collection", we assume quantity 1 for now
        quantity: newState.isOwned ? 1 : 0, 
        is_wishlisted: newState.isWishlisted
      }, { onConflict: 'user_id, herb_id' } as any) // Type cast if TS complains about composite key syntax
  }

  revalidatePath('/herbs')
}

export async function saveUserHerbImage(herbId: string, filePath: string) {
    const supabase = await createClient()
    const user = (await supabase.auth.getUser()).data.user
    if (!user) throw new Error('Unauthorized')
  
    // We update the existing row
    await supabase
      .from('user_herbs')
      .update({ user_image_url: filePath })
      .match({ user_id: user.id, herb_id: herbId })
  
    revalidatePath('/herbs')
}