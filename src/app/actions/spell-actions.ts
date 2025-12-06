'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type Spell = {
  id: string
  title: string
  intent: string | null
  ingredients: string | null
  moon_phase: string | null
  content: string | null
  is_private: boolean
  created_at: string
}

export async function getSpells() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() }
      }
    }
  )
  
  // 1. Get the current User's ID
  const { data: { user } } = await supabase.auth.getUser()
  
  // If not logged in, they shouldn't see anything anyway
  if (!user) return []

  // 2. Add .eq('user_id', user.id) to the query
  const { data: spells, error } = await supabase
    .from('spells')
    .select('*')
    .eq('user_id', user.id) 
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching spells:', error)
    return []
  }

  return (spells as any[]) || []
}

export async function createSpell(formData: FormData) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() }
      }
    }
  )
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const title = formData.get('title') as string
  const intent = formData.get('intent') as string
  const moon_phase = formData.get('moon_phase') as string
  const ingredients = formData.get('ingredients') as string
  const content = formData.get('content') as string
  const is_private = formData.get('is_private') === 'on'

  const { error } = await supabase
    .from('spells')
    .insert({
      user_id: user.id,
      title,
      intent,
      moon_phase,
      ingredients,
      content,
      is_private
    })

  if (error) {
    console.error('Error creating spell:', error)
    throw new Error('Failed to create spell')
  }

  revalidatePath('/spellbook')
  return { success: true }
}

export async function deleteSpell(spellId: string) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() }
      }
    }
  )
  
  const { error } = await supabase
    .from('spells')
    .delete()
    .eq('id', spellId)

  if (error) {
    console.error('Error deleting spell:', error)
    return { error: 'Failed to delete' }
  }

  revalidatePath('/spellbook')
  return { success: true }
}

export async function updateSpell(id: string, formData: FormData) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() }
      }
    }
  )
  
  // Security check: Ensure user is logged in
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const title = formData.get('title') as string
  const intent = formData.get('intent') as string
  const moon_phase = formData.get('moon_phase') as string
  const ingredients = formData.get('ingredients') as string
  const content = formData.get('content') as string
  const is_private = formData.get('is_private') === 'on'

  const { error } = await supabase
    .from('spells')
    .update({
      title,
      intent,
      moon_phase,
      ingredients,
      content,
      is_private
    })
    .eq('id', id)
    .eq('user_id', user.id) // Double security: Only update if they own it

  if (error) {
    console.error('Error updating spell:', error)
    return { error: 'Failed to update' }
  }

  // Refresh the data on all pages
  revalidatePath('/spellbook')
  revalidatePath('/', 'layout') // Ensures Profile pages update too
  return { success: true }
}