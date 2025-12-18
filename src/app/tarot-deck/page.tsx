import { createClient } from '../utils/supabase/server';
import TarotGallery from '@/components/tarot/TarotGallery';

export const metadata = {
  title: 'Tarot Deck | Coven',
  description: 'Explore the 78 keys of wisdom.',
};

export default async function TarotPage() {
  const supabase = await createClient();

  // Fetch the entire deck.
  // We sort by number (0-21 Major) then by Suit/Number for Minor usually.
  // Adjust sorting logic as needed for your DB.
  const { data: cards, error } = await supabase
    .from('tarot_cards')
    .select('*')
    .order('arcana_type', { ascending: true }) // Majors first usually
    .order('number', { ascending: true });

  if (error) {
  // Use JSON.stringify to reveal the hidden error message object
  console.error("Tarot fetch error:", JSON.stringify(error, null, 2));
  return <div className="p-20 text-center text-red-400">The cards are refusing to show themselves today.</div>;
}

  return (
    <main className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="bg-gradient-to-r from-purple-200 via-white to-purple-200 bg-clip-text text-5xl font-extrabold text-transparent sm:text-6xl">
            The Tarot
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            Consult the ancient archetypes. Filter by Arcana or Suit to study the deck.
          </p>
        </div>

        {/* The Interactive Client Component */}
        <TarotGallery initialCards={cards || []} />
        
      </div>
    </main>
  );
}