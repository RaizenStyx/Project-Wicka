'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache';

// Helper: 78 Card Deck
const FULL_DECK_IDS = Array.from({ length: 78 }, (_, i) => i + 1);

export async function drawWidgetCard() {
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

// Keep your getDailySpread function exactly as it was, it was correct!
export async function getDailySpread() {
    // ... (Your existing getDailySpread code goes here) ...
    // I am omitting it here to save space, but keep the code you posted!
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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const today = new Date().toISOString().split('T')[0]; 

    let { data: userState } = await supabase
    .from('user_daily_tarot')
    .select('*')
    .eq('user_id', user.id)
    .single();

    if (!userState) {
        const { data: newState } = await supabase
            .from('user_daily_tarot')
            .insert({ user_id: user.id })
            .select()
            .single();
        userState = newState;
    }

    if (userState.spread_date === today && userState.spread_card_ids?.length > 0) {
    const { data: cards } = await supabase
        .from('tarot_cards')
        .select('*')
        .in('id', userState.spread_card_ids);
    return { cards, isNew: false };
    }

    const shuffled = [...FULL_DECK_IDS].sort(() => 0.5 - Math.random());
    const selectedIds = shuffled.slice(0, 3);

    await supabase
    .from('user_daily_tarot')
    .upsert({
        user_id: user.id,
        spread_date: today,
        spread_card_ids: selectedIds
    });

    const { data: cards } = await supabase
    .from('tarot_cards')
    .select('*')
    .in('id', selectedIds);

    return { cards, isNew: true };
}