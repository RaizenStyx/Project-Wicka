'use server'

import { createClient } from '../utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function performRitualStep(
  ritualId: string, 
  stepId: string, 
  slot: string | null, 
  itemType: string | null
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // 1. Fetch Ritual Config
  const { data: ritual } = await supabase
    .from('common_rituals')
    .select('*')
    .eq('id', ritualId)
    .single()

  if (!ritual) return { error: 'Ritual not found' }

  // 2. Determine Item ID and Name (for the variant column)
  let referenceId = null;
  let variantName = itemType || 'Standard'; // Default name

  if (itemType === 'candle' && ritual.linked_candles?.length > 0) {
     referenceId = ritual.linked_candles[0];
     // Fetch the name for the variant column
     const { data: c } = await supabase.from('candles').select('name').eq('id', referenceId).single();
     if (c) variantName = c.name;

  } else if (itemType === 'crystal' && ritual.linked_crystals?.length > 0) {
     referenceId = ritual.linked_crystals[0];
     const { data: c } = await supabase.from('crystals').select('name').eq('id', referenceId).single();
     if (c) variantName = c.name;

  } else if (itemType === 'herb' && ritual.linked_herbs?.length > 0) {
     referenceId = ritual.linked_herbs[0];
     const { data: h } = await supabase.from('herbs').select('name').eq('id', referenceId).single();
     if (h) variantName = h.name;
  }

  // 3. Update or Insert (Atomic Version)
  if (slot) {
     const payload = {
        user_id: user.id,
        slot: slot, 
        item_type: itemType || 'misc',
        variant: variantName, 
        reference_id: referenceId,
        position_x: 50, 
        position_y: 50,
        active_since: null
        // active_since: new Date().toISOString()
     };

     // THE FIX: Single Upsert Command
     // onConflict matches the Constraint we just made: (user_id, slot)
     const { error } = await supabase
        .from('altar_items')
        .upsert(payload, { onConflict: 'user_id, slot' });
        
     if (error) {
        console.error("Altar Upsert Error:", error);
     }
  }

  revalidatePath('/altar')
  return { success: true }
}

// Special Action just for Lighting (Updates state without moving items)
export async function lightCandleInSlot(slot: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null;
    
    // We update 'active_since' to NOW to start the burn timer
    // We could also add a specific 'is_lit' boolean to the table if you prefer
    await supabase
        .from('altar_items')
        .update({ active_since: new Date().toISOString() }) 
        .eq('user_id', user.id)
        .eq('slot', slot)
        .eq('item_type', 'candle')

    revalidatePath('/altar')
}

export async function getAltarItems() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // 1. Get the raw placement items
  const { data: rawItems } = await supabase
    .from('altar_items')
    .select('*')
    .eq('user_id', user.id);

  if (!rawItems || rawItems.length === 0) return [];

  // 2. Fetch details for the linked items
  // We need to fetch from crystals/candles/herbs based on the IDs we found.
  
  // Extract IDs
  const candleIds = rawItems.filter(i => i.item_type === 'candle' && i.reference_id).map(i => i.reference_id);
  const crystalIds = rawItems.filter(i => i.item_type === 'crystal' && i.reference_id).map(i => i.reference_id);
  const herbIds = rawItems.filter(i => i.item_type === 'herb' && i.reference_id).map(i => i.reference_id);

  // Parallel Fetch
  const [candles, crystals, herbs] = await Promise.all([
    candleIds.length ? supabase.from('candles').select('id, name, hex_code').in('id', candleIds) : { data: [] },
    crystalIds.length ? supabase.from('crystals').select('id, name, image_url').in('id', crystalIds) : { data: [] },
    herbIds.length ? supabase.from('herbs').select('id, name, image_url').in('id', herbIds) : { data: [] },
  ]);

  // 3. Merge the details back into the items
  return rawItems.map(item => {
    let details = null;
    if (item.item_type === 'candle') details = candles.data?.find(c => c.id === item.reference_id);
    else if (item.item_type === 'crystal') details = crystals.data?.find(c => c.id === item.reference_id);
    else if (item.item_type === 'herb') details = herbs.data?.find(h => h.id === item.reference_id);

    return { ...item, details };
  });
}

export async function lightCandleById(itemId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
        .from('altar_items')
        .update({ active_since: new Date().toISOString() }) 
        .eq('id', itemId) // Target the specific item
        .eq('user_id', user.id)

    revalidatePath('/altar')
}

export async function getAltarSettings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('altars')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Return data or default settings if they haven't set it up yet
  return data || { background_id: 'void', cloth_id: 'wood' };
}


export async function cleanseAltar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('altar_items').delete().eq('user_id', user.id)
  
  revalidatePath('/altar')
}


export async function addFreeItem(type: 'candle' | 'crystal', variant: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Find an empty slot or random position
  // For MVP, we just insert into 'center' or random X/Y
  await supabase.from('altar_items').insert({
    user_id: user.id,
    item_type: type,
    variant: variant,
    position_x: Math.floor(Math.random() * 60) + 20, // Random X (20-80%)
    position_y: Math.floor(Math.random() * 60) + 20, // Random Y
    // No 'slot' means it's a free item!
  })
  
  revalidatePath('/altar')
}

export async function clearAltar() {
    // Re-use cleanse logic
    await cleanseAltar();
}