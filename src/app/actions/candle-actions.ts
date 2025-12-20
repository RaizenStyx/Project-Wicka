'use server'

import { createClient } from '../utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { UserCollectionState } from './sanctuary-usercollectionstate'

export async function getCandlesData() {
  const supabase = await createClient()

  // 1. Fetch Public Candles
  // We explicitly fetch hex_code to use for the border color
  const { data: candles, error } = await supabase
    .from('candles')
    .select('*')
    .order('name')

  if (error) console.error('Error fetching candles:', error)

  // 2. Fetch User's Collection
  const { data: collection } = await supabase
    .from('user_candles')
    .select('candle_id, is_owned, is_wishlisted, user_image_url')

  // 3. Map User State
  const userStateMap: Record<string, UserCollectionState> = {}
  
  collection?.forEach((item) => {
    userStateMap[item.candle_id] = { 
      isOwned: item.is_owned,
      isWishlisted: item.is_wishlisted,
      userImage: item.user_image_url
    }
  })

  return { candles: candles || [], userStateMap }
}

export async function updateCandleState(candleId: string, newState: { isOwned: boolean; isWishlisted: boolean }) {
  const supabase = await createClient()
  const user = (await supabase.auth.getUser()).data.user
  if (!user) throw new Error('Unauthorized')

  if (!newState.isOwned && !newState.isWishlisted) {
    const {error} = await supabase
      .from('user_candles')
      .delete()
      .match({ user_id: user.id, candle_id: candleId })
      if (error) throw error;
  } else {
    const {error} = await supabase
      .from('user_candles')
      .upsert({ 
        user_id: user.id, 
        candle_id: candleId,
        is_owned: newState.isOwned,
        is_wishlisted: newState.isWishlisted
      }, { onConflict: 'user_id, candle_id' } as any)
      if (error) throw error;
  }

  revalidatePath('/candles')
}

export async function saveUserCandleImage(candleId: string, filePath: string) {
    const supabase = await createClient()
    const user = (await supabase.auth.getUser()).data.user
    if (!user) throw new Error('Unauthorized')
  
    await supabase
      .from('user_candles')
      .update({ user_image_url: filePath })
      .match({ user_id: user.id, candle_id: candleId })
  
    revalidatePath('/candles')
}