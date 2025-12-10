'use server'

import { createClient } from '../utils/supabase/server'
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
  is_published: boolean
  created_at: string
}

export async function getSpells() {
  const supabase = await createClient();
  
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
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

    // 1. Fetch the user's role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const title = formData.get('title') as string
  const intent = formData.get('intent') as string
  const moon_phase = formData.get('moon_phase') as string
  const ingredients = formData.get('ingredients') as string
  const content = formData.get('content') as string
  const is_private = formData.get('is_private') === 'on'
  const is_published = formData.get('is_published') === 'on'

  // 2. The Check: If they are an initiate, they cannot publish
  if (is_published && profile?.role === 'initiate') {
      return { error: "Initiates must master their craft in private and become verified before publishing to the Archives." }
  }

  // Logic check: You can't publish a private spell
  if (is_private && is_published) {
     return { error: "You cannot publish a private spell to the community." }
  }

  const { error } = await supabase
    .from('spells')
    .insert({
      user_id: user.id,
      title,
      intent,
      moon_phase,
      ingredients,
      content,
      is_private,
      is_published
    })

  if (error) {
    console.error('Error creating spell:', error)
    throw new Error('Failed to create spell')
  }

  revalidatePath('/spellbook')
  return { success: true }
}

export async function deleteSpell(spellId: string) {
  const supabase = await createClient();
  
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
  const supabase = await createClient();
  
  // Security check: Ensure user is logged in
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const title = formData.get('title') as string
  const intent = formData.get('intent') as string
  const moon_phase = formData.get('moon_phase') as string
  const ingredients = formData.get('ingredients') as string
  const content = formData.get('content') as string
  const is_private = formData.get('is_private') === 'on'
  const is_published = formData.get('is_published') === 'on'

  // Logic check: You can't publish a private spell
  if (is_private && is_published) {
     return { error: "You cannot publish a private spell to the community." }
  }

  const { error } = await supabase
    .from('spells')
    .update({
      title,
      intent,
      moon_phase,
      ingredients,
      content,
      is_private,
      is_published
    })
    .eq('id', id)
    .eq('user_id', user.id) // Double security: Only update if they own it

  if (error) {
    console.error('Error updating spell:', error)
    return { error: 'Failed to update' }
  }

  // Refresh the data on all pages
  revalidatePath('/spellbook')
  revalidatePath('/', 'layout') 
  return { success: true }
}

export async function getCommunitySpells() {
  const supabase = await createClient()
  
  console.log("Fetching community spells..."); // Debug Log

  const { data } = await supabase
    .from('spells')
    .select(`
      *,
      profiles (
        username,
        handle,
        avatar_url
      )
    `)
    .eq('is_published', true)
    .eq('is_private', false)
    .order('created_at', { ascending: false })
    .limit(50)
  
  return data || []
}