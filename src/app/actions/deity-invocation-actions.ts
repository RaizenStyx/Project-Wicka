'use server'

import { createClient } from '@/app/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * INVOKE A DEITY
 * 1. Banish any currently active deity (set is_invoked = false).
 * 2. Set the target deity to is_invoked = true & update timestamp.
 * 3. Log the start of this session in the deity_invocations journal.
 */
export async function invokeDeity(deityId: string) {
  const supabase = await createClient()
  const user = (await supabase.auth.getUser()).data.user
  if (!user) throw new Error('Unauthorized')

  const now = new Date().toISOString()

  // 1. "Banish" current active (Reset old invocations)
  // We effectively "end" the previous session in the journal if we wanted to be strict,
  // but for now, we just ensure the toggle is off on the user_deities table.
  await supabase
    .from('user_deities')
    .update({ is_invoked: false })
    .eq('user_id', user.id)
    .eq('is_invoked', true)

  // 2. Invoke the new one
  // We use upsert to ensure the row exists if they haven't "collected" it before
  // though typically they should have wishlisted it first.
  const { error } = await supabase
    .from('user_deities')
    .upsert({ 
      user_id: user.id, 
      deity_id: deityId,
      is_invoked: true,
      last_invoked_at: now,
      // We presume if they invoke it, it's at least in their wishlist/roster
      is_wishlisted: true 
    }, { onConflict: 'user_id, deity_id' })

  if (error) throw error

  // 3. Log to Journal
  await supabase
    .from('deity_invocations')
    .insert({
      user_id: user.id,
      deity_id: deityId,
      started_at: now
    })

  revalidatePath('/sanctuary')
  revalidatePath('/deities')
}

/**
 * BANISH A DEITY (Cancel Invocation)
 * 1. Set is_invoked = false.
 * 2. Update the journal entry to show it ended.
 */
export async function banishDeity(deityId: string) {
  const supabase = await createClient()
  const user = (await supabase.auth.getUser()).data.user
  if (!user) throw new Error('Unauthorized')

  // 1. Turn off flag
  await supabase
    .from('user_deities')
    .update({ is_invoked: false })
    .match({ user_id: user.id, deity_id: deityId })

  // 2. Close the Journal Entry
  // We find the most recent open session for this deity and close it.
  await supabase
    .from('deity_invocations')
    .update({ ended_at: new Date().toISOString() })
    .match({ user_id: user.id, deity_id: deityId })
    .is('ended_at', null) // Only close currently open ones

  revalidatePath('/sanctuary')
}

/**
 * EXTEND INVOCATION
 * Rules:
 * 1. Can only be used once every 8 hours.
 * 2. Adds 6 hours to the invocation timer.
 */
export async function extendInvocation(deityId: string) {
    const supabase = await createClient()
    const user = (await supabase.auth.getUser()).data.user
    if (!user) throw new Error('Unauthorized')
  
    // 1. Check current state
    const { data } = await supabase
        .from('user_deities')
        .select('last_invoked_at, last_offering_at')
        .match({ user_id: user.id, deity_id: deityId })
        .single()
    
    if (!data?.last_invoked_at) return

    const now = new Date()
    const COOLDOWN_HOURS = 8

    // 2. Check Cooldown
    if (data.last_offering_at) {
        const lastOffering = new Date(data.last_offering_at)
        const hoursSince = (now.getTime() - lastOffering.getTime()) / (1000 * 60 * 60)
        
        if (hoursSince < COOLDOWN_HOURS) {
            throw new Error(`You must wait ${Math.ceil(COOLDOWN_HOURS - hoursSince)} hours before making another offering.`)
        }
    }

    // 3. Apply Extension
    // We add 6 hours to the *start time* (last_invoked_at), which effectively pushes the 24h expiration forward by 6h.
    const currentStart = new Date(data.last_invoked_at)
    const newStart = new Date(currentStart.getTime() + (6 * 60 * 60 * 1000))

    await supabase
        .from('user_deities')
        .update({ 
            last_invoked_at: newStart.toISOString(),
            last_offering_at: now.toISOString() // Mark usage
        })
        .match({ user_id: user.id, deity_id: deityId })

    revalidatePath('/sanctuary')
}