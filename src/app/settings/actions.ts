'use server'

import { createClient } from '../utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(prevState: any, formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // 1. Create a dynamic update object
  const updates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  }

  // 2. Only add fields that exist in the form submission
  // This prevents overwriting existing data with null
  if (formData.has('username')) updates.username = formData.get('username');
  if (formData.has('website')) updates.website = formData.get('website');
  if (formData.has('coven_name')) updates.coven_name = formData.get('coven_name');
  if (formData.has('moon_phase')) updates.moon_phase = formData.get('moon_phase');
  if (formData.has('subtitle')) updates.subtitle = formData.get('subtitle');
  if (formData.has('bio')) updates.bio = formData.get('bio');

  // 3. Perform the update
  const { error } = await supabase
    .from('profiles')
    .update(updates) 
    .eq('id', user.id)

  if (error) {
    console.error("Profile Update Error:", error)
    return { error: 'Failed to update profile' }
  }

  revalidatePath('/settings')
  revalidatePath('/', 'layout') 
  
  return { success: 'Grimoire updated successfully' }
}