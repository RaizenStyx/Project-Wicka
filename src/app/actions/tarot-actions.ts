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
    .maybeSingle<TarotReadingRow>(); 

  if (!reading) return null;

  // B. Extract Card IDs to fetch static details
  const cardIds = reading.cards.map(c => c.card_id);

  // C. Fetch Static Data
  const { data: staticCards } = await supabase
    .from('tarot_cards')
    .select('*')
    .in('id', cardIds);

  if (!staticCards) return null;

  // D. Hydrate
  const hydratedCards = reading.cards.map((savedCard) => {
    const staticInfo = staticCards.find(sc => sc.id === savedCard.card_id);
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
 * NOW UPDATED: Fetches full history AND hydrates the cards.
 */
export async function getReadingHistory(): Promise<HydratedTarotReading[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // 1. Fetch RAW readings
  const { data: readings } = await supabase
    .from('user_tarot_readings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (!readings || readings.length === 0) return [];

  // 2. Collect ALL unique Card IDs from ALL readings to fetch them in one batch
  const allCardIds = new Set<number>();
  readings.forEach((r: TarotReadingRow) => {
    if (Array.isArray(r.cards)) {
        r.cards.forEach((c) => allCardIds.add(c.card_id));
    }
  });

  if (allCardIds.size === 0) return [];

  // 3. Fetch Static Data for all involved cards
  const { data: staticCards } = await supabase
    .from('tarot_cards')
    .select('*')
    .in('id', Array.from(allCardIds));

  if (!staticCards) return [];

  // Create a quick lookup map
  const cardMap = new Map(staticCards.map(c => [c.id, c]));

  // 4. Hydrate every reading
  const history: HydratedTarotReading[] = readings.map((r: TarotReadingRow) => {
    const hydratedCards = (r.cards || []).map((savedCard) => {
        const staticInfo = cardMap.get(savedCard.card_id);
        
        // Graceful fallback if card data is missing (shouldn't happen)
        const fallbackInfo: TarotCard = staticInfo || {
            id: savedCard.card_id,
            name: "Unknown Card",
            suit: null,
            arcana_type: "Major",
            number: 0,
            slug: "unknown",
            meaning_upright: "Card data not found",
            meaning_reversed: "Card data not found",
            description: null,
            image_url: null,
            element: null,
            astrology: null,
            numerical_keyword: null
        };

        return {
            info: fallbackInfo,
            reversed: savedCard.reversed,
            position_name: savedCard.position_name
        };
    });

    return {
        id: r.id,
        spread_name: r.spread_name,
        query: r.query,
        created_at: r.created_at,
        cards: hydratedCards
    };
  });

  return history;
}

export async function drawWidgetCard() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const today = new Date().toISOString().split('T')[0];

  const [cardBackResult, deckResult] = await Promise.all([
    supabase
      .from('tarot_cards')
      .select('*')
      .or('number.is.null,name.eq.card-back') 
      .limit(1)
      .maybeSingle(),
    
    supabase
      .from('tarot_cards')
      .select('id')
      .not('number', 'is', null) 
  ]);

  const cardBack = cardBackResult.data;
  const playableIds = deckResult.data?.map(c => c.id) || [];

  if (playableIds.length === 0) {
    return { error: "Deck configuration error: No playable cards found." };
  }

  let { data: userState } = await supabase
    .from('user_daily_tarot')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle(); 

  if (!userState) {
    const { data: newState } = await supabase
        .from('user_daily_tarot')
        .insert({ user_id: user.id })
        .select()
        .single();
    userState = newState;
  }

  let alreadyDrawn: number[] = userState.widget_drawn_ids || [];
  
  if (userState.widget_date !== today) {
    alreadyDrawn = []; 
  }

  const availableIds = playableIds.filter(id => !alreadyDrawn.includes(id));

  if (availableIds.length === 0) {
    return { 
        card: null, 
        cardBack, 
        remaining: 0, 
        message: "The deck is empty. Come back tomorrow." 
    };
  }

  const randomId = availableIds[Math.floor(Math.random() * availableIds.length)];

  await supabase
    .from('user_daily_tarot')
    .upsert({
      user_id: user.id,
      widget_date: today,
      widget_drawn_ids: [...alreadyDrawn, randomId]
    });

  const { data: card } = await supabase
    .from('tarot_cards')
    .select('*')
    .eq('id', randomId)
    .single();

  revalidatePath('/'); 
  
  return { 
      card, 
      cardBack, 
      remaining: availableIds.length - 1, 
      message: null 
  };
}