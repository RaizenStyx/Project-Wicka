import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

// 1. Anon Client for Static Generation
const getPublicClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// 2. Generate Static Params (Build all 78 pages)
export async function generateStaticParams() {
  const supabase = getPublicClient();
  
  // UPDATED: Filter out the 'Card Back' or any incomplete entries using .not('slug', 'is', null)
  const { data: cards } = await supabase
    .from('tarot_cards')
    .select('slug')
    .not('slug', 'is', null);

  return (
    cards?.map((card) => ({
      slug: card.slug,
    })) || []
  );
}

// 3. Metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  // Safety check
  if (!slug || slug === 'null') return { title: 'Tarot Card' };

  const title = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  return {
    title: `${title} | Tarot Meaning`,
    description: `Discover the upright and reversed meanings of ${title}.`,
  };
}

// 4. Page Component
export default async function TarotCardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = getPublicClient();

  const { data: card, error } = await supabase
    .from('tarot_cards')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !card) {
    notFound();
  }

  // Visual Theme Helpers
  const isMajor = card.arcana_type === 'Major';
  const suitColor = 
    card.suit === 'Cups' ? 'text-blue-400 bg-blue-900/20 border-blue-500/20' :
    card.suit === 'Wands' ? 'text-red-400 bg-red-900/20 border-red-500/20' :
    card.suit === 'Pentacles' ? 'text-emerald-400 bg-emerald-900/20 border-emerald-500/20' :
    card.suit === 'Swords' ? 'text-slate-300 bg-slate-700/20 border-slate-500/20' :
    'text-purple-400 bg-purple-900/20 border-purple-500/20'; // Major

  return (
    <main className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      
      {/* Navbar / Back Button */}
      <nav className="mx-auto max-w-6xl px-6 pt-8">
        <Link 
          href="/tarot-deck"
          className="group inline-flex items-center text-sm font-medium text-slate-400 transition-colors hover:text-white"
        >
          <svg className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Deck
        </Link>
      </nav>

      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-12 lg:grid-cols-12">
        
        {/* --- Left Column: The Card Visual --- */}
        <div className="lg:col-span-4 lg:col-start-2">
          <div className="sticky top-24">
            <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-[0_0_50px_rgba(168,85,247,0.15)]">
              {card.image_url ? (
                 <Image 
                 src={card.image_url} 
                 alt={card.name}
                 className="h-full w-full object-cover"
                 fill
                 sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
               />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-600">
                  <span className="text-xs uppercase tracking-widest">Image Coming Soon</span>
                </div>
              )}
              
              {/* Overlay Border */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
            </div>

            {/* Quick Keywords */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
               <Badge text={card.arcana_type} />
               {card.suit && <Badge text={card.suit} />}
               {card.element && <Badge text={card.element} />}
               {card.astrology && <Badge text={card.astrology} />}
            </div>
          </div>
        </div>

        {/* --- Right Column: The Wisdom --- */}
        <div className="lg:col-span-6">
          
          <header className="mb-10">
            <h1 className="mb-2 font-serif text-5xl font-bold text-white md:text-6xl">
              {card.name}
            </h1>
            <p className="text-xl text-purple-200/80">{card.numerical_keyword || `Number ${card.number}`}</p>
          </header>

          <div className="space-y-10">
            
            {/* General Description */}
            <div className="prose prose-invert leading-relaxed text-slate-300">
              <p>{card.description}</p>
            </div>

            {/* Upright Meaning */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-emerald-100">Upright Meaning</h3>
              </div>
              <p className="text-slate-300">
                {card.meaning_upright}
              </p>
            </div>

            {/* Reversed Meaning */}
            <div className="rounded-2xl border border-red-500/20 bg-red-950/10 p-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-red-100">Reversed Meaning</h3>
              </div>
              <p className="text-slate-300">
                {card.meaning_reversed}
              </p>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span className="rounded-md border border-white/5 bg-white/5 px-3 py-1 text-xs font-medium text-slate-400">
      {text}
    </span>
  );
}