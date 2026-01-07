'use server'

import { createClient } from '../utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { CommonRitual } from '../types/database';
import { link } from 'fs';

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
  const linkedCrystals = JSON.parse(formData.get('linked_crystals') as string || '[]');
  const linkedHerbs = JSON.parse(formData.get('linked_herbs') as string || '[]');
  const linkedCandles = JSON.parse(formData.get('linked_candles') as string || '[]');
  const linkedDeities = JSON.parse(formData.get('linked_deities') as string || '[]');
  const linkedRunes = JSON.parse(formData.get('linked_runes') as string || '[]');
  const linkedEssentialOils = JSON.parse(formData.get('linked_essential_oils') as string || '[]');
  const isRitual = formData.get('is_ritual') === 'true';

  // 2. The Check: If they are an initiate, they cannot publish
  if (is_published && profile?.role === 'initiate') {
      return { error: "Initiates must master their craft in private and become verified before publishing to the Archives." }
  }

  // Logic check: You can't publish a private spell
  if (is_private && is_published) {
     return { error: "You cannot publish a private spell to the community." }
  }

  // --- NEW SERVER VALIDATION ---
  if (isRitual) {
    const hasEarth = linkedCrystals.length > 0 || linkedHerbs.length > 0;
    const hasFire = linkedCandles.length > 0;
    
    if (!hasEarth || !hasFire) {
      return { error: "Incomplete Ritual: You must provide Earth (Crystal/Herb) and Fire (Candle) components." };
    }
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
      is_published,
      // NEW FIELDS
      is_ritual: isRitual,
      linked_crystals: linkedCrystals,
      linked_herbs: linkedHerbs,
      linked_candles: linkedCandles,
      linked_deities: linkedDeities,
      linked_runes: linkedRunes,
      linked_essential_oils: linkedEssentialOils
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
  const linkedCrystals = JSON.parse(formData.get('linked_crystals') as string || '[]');
  const linkedHerbs = JSON.parse(formData.get('linked_herbs') as string || '[]');
  const linkedCandles = JSON.parse(formData.get('linked_candles') as string || '[]');
  const linkedDeities = JSON.parse(formData.get('linked_deities') as string || '[]');
  const linkedRunes = JSON.parse(formData.get('linked_runes') as string || '[]');
  const linkedEssentialOils = JSON.parse(formData.get('linked_essential_oils') as string || '[]');
  const isRitual = formData.get('is_ritual') === 'true';

  // Logic check: You can't publish a private spell
  if (is_private && is_published) {
     return { error: "You cannot publish a private spell to the community." }
  }

  // --- NEW SERVER VALIDATION ---
  if (isRitual) {
    const hasEarth = linkedCrystals.length > 0 || linkedHerbs.length > 0;
    const hasFire = linkedCandles.length > 0;
    
    if (!hasEarth || !hasFire) {
      return { error: "Incomplete Ritual: You must provide Earth (Crystal/Herb) and Fire (Candle) components." };
    }
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
      is_published,
      // NEW FIELDS
      is_ritual: isRitual,
      linked_crystals: linkedCrystals,
      linked_herbs: linkedHerbs,
      linked_candles: linkedCandles,
      linked_deities: linkedDeities,
      linked_runes: linkedRunes,
      linked_essential_oils: linkedEssentialOils
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

export async function getCommonRituals(): Promise<CommonRitual[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('common_rituals')
    .select('*')
    .order('title', { ascending: true }); // Alphabetical usually better for reference lists

  if (error) {
    console.error('Error fetching common rituals:', error);
    return [];
  }

  return data as CommonRitual[];
}