'use server'

import { createClient } from '../utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getAltarItems() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('altar_items')
    .select('*')
    .eq('user_id', user.id)

  return data || []
}

export async function lightCandle() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Check if user already has a candle
  const { data: existing } = await supabase
    .from('altar_items')
    .select('id')
    .eq('user_id', user.id)
    .eq('item_type', 'candle')
    .single()

  const now = new Date().toISOString()
  const ONE_DAY_MINUTES = 1440

  if (existing) {
    // Reset existing candle
    await supabase.from('altar_items').update({
      active_since: now,
      duration_minutes: ONE_DAY_MINUTES
    }).eq('id', existing.id)
  } else {
    // Create new candle
    await supabase.from('altar_items').insert({
      user_id: user.id,
      item_type: 'candle',
      variant: 'white_wax',
      active_since: now,
      duration_minutes: ONE_DAY_MINUTES,
      position_x: 50,
      position_y: 80 // Near bottom center
    })
  }

  revalidatePath('/altar')
}