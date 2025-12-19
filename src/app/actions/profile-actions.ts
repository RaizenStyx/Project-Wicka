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