'use server'

import { createClient } from '../utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function clearNotifications() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return

  // Update the timestamp to NOW, effectively "clearing" all previous alerts
  await supabase
    .from('profiles')
    .update({ last_read_notifications: new Date().toISOString() })
    .eq('id', user.id)

  revalidatePath('/', 'layout')
}