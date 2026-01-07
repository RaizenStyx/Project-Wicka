'use server'

import { createClient } from '@/app/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * INVOKE A DEITY
 * 1. Banish any currently active deity (set is_invoked = false).
 * 2. Set the target deity to is_invoked = true & is_owned = true.
 * 3. Log the start of this session.
 */
export async function invokeDeity(deityId: string) {
  const supabase = await createClient()
  const user = (await supabase.auth.getUser()).data.user
  if (!user) throw new Error('Unauthorized')

  const now = new Date().toISOString()

  // 1. "Banish" current active (Reset old invocations)
  // We explicitly turn off is_invoked AND is_owned for any other deity
  // This ensures only the active deity is "Owned" (Viewable in Gallery)
  await supabase
    .from('user_deities')
    .update({ is_invoked: false, is_owned: false }) 
    .eq('user_id', user.id)
    .eq('is_invoked', true)

  // 2. Invoke the new one
  const { error } = await supabase
    .from('user_deities')
    .upsert({ 
      user_id: user.id, 
      deity_id: deityId,
      is_owned: true,       // Unlock Gallery
      is_invoked: true,     // Start Timer
      last_invoked_at: now,
      is_wishlisted: true   // Ensure it's in the roster
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
 * 1. Set is_invoked = false & is_owned = false.
 * 2. Update the journal entry.
 */
export async function banishDeity(deityId: string) {
  const supabase = await createClient()
  const user = (await supabase.auth.getUser()).data.user
  if (!user) throw new Error('Unauthorized')

  // 1. Turn off flags
  // We flip is_owned to false so the Gallery Tab locks again.
  await supabase
    .from('user_deities')
    .update({ is_invoked: false, is_owned: false }) 
    .match({ user_id: user.id, deity_id: deityId })

  // 2. Close the Journal Entry
  await supabase
    .from('deity_invocations')
    .update({ ended_at: new Date().toISOString() })
    .match({ user_id: user.id, deity_id: deityId })
    .is('ended_at', null) 

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
    const currentStart = new Date(data.last_invoked_at)
    const newStart = new Date(currentStart.getTime() + (6 * 60 * 60 * 1000))

    await supabase
        .from('user_deities')
        .update({ 
            last_invoked_at: newStart.toISOString(),
            last_offering_at: now.toISOString()
        })
        .match({ user_id: user.id, deity_id: deityId })

    revalidatePath('/sanctuary')
}