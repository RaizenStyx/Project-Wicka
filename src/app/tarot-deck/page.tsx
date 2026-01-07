import { createClient } from '../utils/supabase/server';
import TarotGallery from '@/components/tarot/TarotGallery';

export const metadata = {
  title: 'Tarot Deck | Coven',
  description: 'Explore the 78 keys of wisdom.',
};

export default async function TarotPage() {
  const supabase = await createClient();

  // Fetch the entire deck.
  const { data: cards, error } = await supabase
    .from('tarot_cards')
    .select('*')
    //.not('slug', 'is', null) 
    .order('arcana_type', { ascending: true }) 
    .order('number', { ascending: true });

  if (error) {
    console.error("Tarot fetch error:", JSON.stringify(error, null, 2));
    return <div className="p-20 text-center text-red-400">The cards are refusing to show themselves today.</div>;
  }

  // Find the Card Back 
  // Assuming 'Card Back' might have a specific ID or Name if slug is null:
  const cardBack = cards?.find(c => c.name === 'Card Back') || null;

  // Filter the rest of the deck (Normal Cards)
  const deck = cards?.filter(c => c.name !== 'Card Back') || [];

  return (
    <main className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="bg-gradient-to-r from-purple-200 via-white to-purple-200 bg-clip-text text-5xl font-extrabold text-transparent sm:text-6xl">
            The Tarot
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            Consult the ancient archetypes. Filter by Arcana or Suit to study the deck.
          </p>
        </div>

        {/* Gallery */}
        <TarotGallery initialCards={deck} cardBack={cardBack} />
        
        {/* --- ATTRIBUTION FOOTER --- */}
        <footer className="mt-24 border-t border-white/5 pt-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="font-serif text-sm text-slate-500">
                Tarot imagery provided by courtesy of{' '}
                <a 
                    href="https://www.tarottraveler.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-purple-400 hover:text-purple-300 hover:underline transition-colors decoration-purple-500/30 underline-offset-4"
                >
                    Tarot Traveler
                </a>
                .
            </p>
            <p className="mt-2 text-xs text-slate-600">
                May the cards guide your path.
            </p>
        </footer>

      </div>
    </main>
  );
}