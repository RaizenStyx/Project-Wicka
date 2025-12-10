'use server'

import { createClient } from '../utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Fetches all crystals and the current user's collection IDs.
 * We return the collection as a Set or Array of IDs for O(1) lookups on the client.
 */
export async function getCrystalsData() {
  const supabase = await createClient()

  // 1. Fetch all crystals (The Library)
  const { data: crystals, error: crystalError } = await supabase
    .from('crystals')
    .select('*')
    .order('name')

  if (crystalError) throw new Error(crystalError.message)

  // 2. Fetch user's collected IDs
  const { data: collection, error: collectionError } = await supabase
    .from('user_crystal_collection')
    .select('crystal_id')

  if (collectionError) throw new Error(collectionError.message)

  // Flatten collection to just an array of IDs
  const collectedIds = collection.map((item) => item.crystal_id)

  return { crystals, collectedIds }
}

/**
 * Toggles a crystal in the user's collection.
 * If they have it -> remove it.
 * If they don't -> add it.
 */
export async function toggleCrystalCollection(crystalId: string, isCurrentlyCollected: boolean) {
  const supabase = await createClient()
  const user = (await supabase.auth.getUser()).data.user

  if (!user) throw new Error('Unauthorized')

  if (isCurrentlyCollected) {
    // Remove from collection
    await supabase
      .from('user_crystal_collection')
      .delete()
      .match({ user_id: user.id, crystal_id: crystalId })
  } else {
    // Add to collection
    await supabase
      .from('user_crystal_collection')
      .insert({ user_id: user.id, crystal_id: crystalId })
  }

  // Revalidate the page so the UI stays in sync on refresh
  revalidatePath('/crystals')
}