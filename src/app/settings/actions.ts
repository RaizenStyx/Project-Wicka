'use server'

import { createClient } from '../utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Note: We added prevState: any here
export async function updateProfile(prevState: any, formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const username = formData.get('username') as string
  const website = formData.get('website') as string
  const coven_name = formData.get('coven_name') as string
  const moon_phase = formData.get('moon_phase') as string

  const { error } = await supabase
    .from('profiles')
    .update({ 
      username, 
      website, 
      coven_name,
      moon_phase,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    return { error: 'Failed to update profile' }
  }

  revalidatePath('/settings')
  revalidatePath('/') 
  
  // We return a success message that the component can read
  return { success: 'Grimoire updated successfully' }
}