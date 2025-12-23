'use server'

import { createClient } from '../utils/supabase/server'
import { getZodiacSign } from '../utils/astrology'
import { revalidatePath } from 'next/cache'

export async function updateBirthDate(formData: FormData) {
  const supabase = await createClient()
  
  // 1. Check Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // 2. Get Input
  const birthDate = formData.get('birth_date') as string
  if (!birthDate) return { error: 'Date required' }

  try {
    // 3. Calculate Sign
    const signName = getZodiacSign(birthDate)
    
    // 4. Find the Zodiac ID in Database
    // We search case-insensitive just to be safe
    const { data: zodiacData, error: zodiacError } = await supabase
      .from('zodiac_signs')
      .select('id, name')
      .ilike('name', signName)
      .single()

    if (zodiacError || !zodiacData) {
      console.error('Zodiac Lookup Error:', zodiacError)
      return { error: `Could not match star sign: ${signName}` }
    }

    // 5. Update Profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        birth_date: birthDate,
        zodiac_id: zodiacData.id
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Profile Update Error:', updateError)
      return { error: 'Failed to save to the stars.' }
    }

    revalidatePath('/profile')
    return { success: true, signName: zodiacData.name }

  } catch (err) {
    return { error: 'Something went wrong' }
  }
}

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