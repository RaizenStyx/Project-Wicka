'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function drawRandomCard() {
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

    const today = new Date().toISOString().split('T')[0]; // "2023-10-27"
  
  // 1. Get the count of cards
  const { count } = await supabase
    .from('tarot_cards')
    .select('*', { count: 'exact', head: true });

  // 1. Check if we already drew today
//   const { data: existingDraw } = await supabase
//     .from('daily_draws')
//     .select('*, tarot_cards(*)') // Join with card details
//     .eq('user_id', user.id)
//     .eq('date_key', today)
//     .single();

  if (!count) return null;
//   if (existingDraw) {
//     return { card: existingDraw.tarot_cards, isNew: false };
//   }

  // 2. Pick a random offset
  const randomIndex = Math.floor(Math.random() * count);

  // 2. If not, draw a new random card
  // (Using the random logic from before)
//   const { count } = await supabase.from('tarot_cards').select('*', { count: 'exact', head: true });
//   const randomIndex = Math.floor(Math.random() * (count || 78));
  
//   const { data: newCard } = await supabase
//     .from('tarot_cards')
//     .select('*')
//     .range(randomIndex, randomIndex)
//     .single();

//   if (!newCard) return null;  

  // 3. Fetch that single card
  const { data, error } = await supabase
    .from('tarot_cards')
    .select('*')
    .range(randomIndex, randomIndex)
    .single();

  // 3. Save to History
//   await supabase.from('daily_draws').insert({
//     user_id: user.id,
//     card_id: newCard.id,
//     date_key: today
//   });

  if (error) {
    console.error('Error drawing card:', error);
    return null;
  }
   // revalidatePath('/'); // Revalidate the homepage to reflect new draw

  return data;

//return { card: newCard, isNew: true };
}