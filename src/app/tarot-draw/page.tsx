import { createClient } from '@/app/utils/supabase/server';
import TarotDrawFlow from '@/components/tarot/TarotDrawFlow';
import Link from 'next/link'; 
import { History } from 'lucide-react'; 

export const metadata = {
  title: 'Divination Room | Nyxus',
  description: 'Consult the cards and scribe your fate.',
};

export default async function TarotDrawPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Fetch User Role
  let userRole = 'user';
  if (user) {
    const { data: profile } = await supabase
      .from('profiles') 
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (profile?.role) {
        userRole = profile.role;
    }
  }

  // 2. Fetch entire deck
  const { data: rawDeck, error } = await supabase
    .from('tarot_cards')
    .select('*')
    .order('id', { ascending: true });

  if (error || !rawDeck) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        The spirits are silent. (Database Error)
      </div>
    );
  }

  // 3. EXTRACT CARD BACK
  // Adjust this filter based on your exact data. 
  // You mentioned "Card Back" is a card with a null number or specific name.
  const cardBackEntry = rawDeck.find(c => c.name === 'card-back' || c.number === null);
  const cardBackUrl = cardBackEntry?.image_url || 'tarot_card_backs/card-back.png'; 

  console.log("DEBUG: Found Card Back?", cardBackEntry?.name, cardBackEntry?.image_url);
  // 4. FILTER PLAYABLE DECK
  // We don't want the user to actually "draw" the card back in a spread.
  const playableDeck = rawDeck.filter(c => c.id !== cardBackEntry?.id);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-purple-500/30">
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        
        {/* Header with Journal Link */}
        <header className="mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-indigo-200 drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              The Divination Room
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              Focus your intent. Shuffle the deck. Reveal your path.
            </p>
          </div>

          <Link 
            href="/tarot-draw/journal"
            className="group flex items-center gap-3 px-5 py-3 rounded-full bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all hover:bg-slate-900/80"
          >
            <div className="p-2 bg-slate-800 rounded-full group-hover:bg-purple-500/20 transition-colors">
                <History className="w-4 h-4 text-slate-400 group-hover:text-purple-300" />
            </div>
            <span className="text-sm font-medium text-slate-300 group-hover:text-white">View Journal</span>
          </Link>
        </header>

        {/* 4. Pass filtered deck AND cardBackUrl */}
        <TarotDrawFlow fullDeck={playableDeck} cardBackUrl={cardBackUrl} userRole={userRole} />
      </div>
    </div>
  );
}