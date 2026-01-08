import { createClient } from '@/app/utils/supabase/server';
import { getReadingHistory } from '@/app/actions/tarot-actions';
import JournalList from '@/components/tarot/JournalList';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Construction from '@/components/ui/Construction';

export const metadata = {
  title: 'Tarot Journal | Nyxus',
  description: 'A history of your scribed fates.',
};

export default async function TarotJournalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div className="p-8 text-center text-slate-500">Please log in to view your journal.</div>;
  }

  // Fetch the simple list (ID, Date, Spread Name, Query)
  // We will fetch full details on-demand or pass simplified data if preferred.
  // Ideally, update getReadingHistory to return the cards JSONB too if the list isn't huge.
  const history = await getReadingHistory();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <Construction title="Tarot Journal" 
        description='A history of your scribed fates. This page is done but data is not connected all the way, so page is under maintenance.' />
    
        <header className="mb-10 flex flex-col gap-4">
          <Link 
            href="/tarot-draw" 
            className="text-xs text-slate-500 hover:text-indigo-400 flex items-center gap-2 transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Divination
          </Link>
          
          <div>
            <h1 className="text-3xl md:text-4xl font-serif text-purple-200">Tarot Journal</h1>
            <p className="text-slate-400 mt-2">The threads of fate you have woven.</p>
          </div>
        </header>

        {/* The Client Component for the List */}
        <JournalList initialReadings={history} />
      </div>
    </div>
  );
}