'use server'

import { createClient } from '@/app/utils/supabase/server'
import { revalidatePath } from 'next/cache';
import { SavedCardData, TarotReadingRow, HydratedTarotReading, TarotCard } from '@/app/types/database';

/**
 * 1. SAVE READING (The "Scribe Fate" Action)
 * Enforces the "One Save Per Day" rule.
 */
export async function saveReading(
  spreadName: string, 
  intention: string, 
  cards: SavedCardData[]
) {
  const supabase = await createClient();
  
  // A. Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to scribe your fate." };

  // B. Date Check (UTC)
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const todayString = todayStart.toISOString();

  // Check if a reading already exists for today >= todayStart
  const { data: existing } = await supabase
    .from('user_tarot_readings')
    .select('id')
    .eq('user_id', user.id)
    .gte('created_at', todayString) 
    .maybeSingle();

  if (existing) {
    return { error: "You have already scribed your fate for today. Try again tomorrow." };
  }

  // C. Insert Data
  const { error } = await supabase
    .from('user_tarot_readings')
    .insert({
      user_id: user.id,
      spread_name: spreadName,
      query: intention, // Storing "Intention" in the query column
      cards: cards,     // JSONB array
    });

  if (error) {
    console.error("Save Error:", error);
    return { error: "Failed to scribe reading." };
  }

  revalidatePath('/profile');
  revalidatePath('/tarot-draw');
  return { success: true };
}

/**
 * 2. GET LATEST READING (For Profile Widget)
 * Fetches the most recent reading and "hydrates" it with full card details.
 */
export async function getLatestReading(): Promise<HydratedTarotReading | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // A. Fetch the RAW reading row
  const { data: reading } = await supabase
    .from('user_tarot_readings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle<TarotReadingRow>(); // Use the Generic to type the return

  if (!reading) return null;

  // B. Extract Card IDs to fetch static details
  // reading.cards is already typed as SavedCardData[] thanks to the generic above
  const cardIds = reading.cards.map(c => c.card_id);

  // C. Fetch Static Data
  const { data: staticCards } = await supabase
    .from('tarot_cards')
    .select('*')
    .in('id', cardIds);

  if (!staticCards) return null;

  // D. Hydrate (Merge the two data sets)
  // We map over the SAVED cards to preserve order and position data
  const hydratedCards = reading.cards.map((savedCard) => {
    const staticInfo = staticCards.find(sc => sc.id === savedCard.card_id);
    
    // Fallback if card not found (shouldn't happen)
    if (!staticInfo) throw new Error(`Card ID ${savedCard.card_id} missing`);

    return {
      info: staticInfo as TarotCard,
      reversed: savedCard.reversed,
      position_name: savedCard.position_name
    };
  });

  return {
    id: reading.id,
    spread_name: reading.spread_name,
    query: reading.query,
    created_at: reading.created_at,
    cards: hydratedCards
  };
}

/**
 * 3. GET HISTORY (For the Journal Page)
 * Simplified fetch for a list view
 */
export async function getReadingHistory() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('user_tarot_readings')
    .select('id, spread_name, query, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return data || [];
}

// Helper: 78 Card Deck
const FULL_DECK_IDS = Array.from({ length: 78 }, (_, i) => i + 1);

export async function drawWidgetCard() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const today = new Date().toISOString().split('T')[0];

  // 1. Fetch State
  let { data: userState } = await supabase
    .from('user_daily_tarot')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  // Initialize if missing
  if (!userState) {
     const { data: newState } = await supabase
        .from('user_daily_tarot')
        .insert({ user_id: user.id })
        .select()
        .single();
     userState = newState;
  }

  // 2. Reset logic: If the date stored is NOT today, clear the deck
  let alreadyDrawn: number[] = userState.widget_drawn_ids || [];
  
  // If the last time we touched the widget wasn't today, reset the array
  if (userState.widget_date !== today) {
    alreadyDrawn = []; 
  }

  // 3. Calculate remaining cards
  // Filter out IDs that are inside the 'alreadyDrawn' array
  const availableIds = FULL_DECK_IDS.filter(id => !alreadyDrawn.includes(id));

  // CHECK: Is the deck empty?
  if (availableIds.length === 0) {
    return { 
        card: null, 
        remaining: 0, 
        message: "The deck is empty. Come back tomorrow." 
    };
  }

  // 4. Draw ONE random card from the available ones
  const randomId = availableIds[Math.floor(Math.random() * availableIds.length)];

  // 5. Update DB (Add the new ID to the array and set date to today)
  await supabase
    .from('user_daily_tarot')
    .upsert({
      user_id: user.id,
      widget_date: today,
      widget_drawn_ids: [...alreadyDrawn, randomId]
    });

  // 6. Fetch Card Data
  const { data: card } = await supabase
    .from('tarot_cards')
    .select('*')
    .eq('id', randomId)
    .single();

  revalidatePath('/'); 
  
  return { 
      card, 
      remaining: availableIds.length - 1, // Subtract 1 because we just drew it
      message: null 
  };
}