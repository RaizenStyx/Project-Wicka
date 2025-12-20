import { createClient } from '@/app/utils/supabase/server';
import { createServerClient } from '@supabase/ssr';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

// 1. Generate all 12 static paths at build time
export async function generateStaticParams() {
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return [];
                },
                setAll() {},
            },
        }
    );

  const { data: signs } = await supabase.from('zodiac_signs').select('name');

  return (
    signs?.map((sign) => ({
      slug: sign.name.toLowerCase(),
    })) || []
  );
}

// 2. Dynamic SEO Metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  // Capitalize for title
  const title = slug.charAt(0).toUpperCase() + slug.slice(1);
  return {
    title: `${title} | Astrology Grimoire`,
    description: `Detailed meanings and magical correspondences for ${title}.`,
  };
}

// 3. The Main Page Component
export default async function ZodiacDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch the specific sign. 
  // We use ilike for case-insensitive matching just to be safe.
  const { data: sign, error } = await supabase
    .from('zodiac_signs')
    .select(`
      *,
      planets (
        name
      )
    `)
    .ilike('name', slug)
    .single();

  if (error || !sign) {
    notFound();
  }

  // Helper color map for elements to add visual distinction
  const elementColors: Record<string, string> = {
    Fire: 'text-red-400 bg-red-900/20 border-red-500/20',
    Water: 'text-blue-400 bg-blue-900/20 border-blue-500/20',
    Air: 'text-teal-300 bg-teal-900/20 border-teal-500/20',
    Earth: 'text-emerald-400 bg-emerald-900/20 border-emerald-500/20',
  };

  const themeColor = elementColors[sign.element] || 'text-purple-400 bg-purple-900/20 border-purple-500/20';

  return (
    <main className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      
      {/* Navigation Breadcrumb */}
      <nav className="mx-auto max-w-4xl px-6 pt-10">
        <Link 
          href="/astrology"
          className="group inline-flex items-center text-sm font-medium text-gray-400 transition-colors hover:text-white"
        >
          <svg className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Zodiac
        </Link>
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Header Section */}
        <header className="relative mb-16 overflow-hidden rounded-3xl border border-white/10 bg-white/5 px-8 py-16 text-center backdrop-blur-md">
          {/* Background Decor */}
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-purple-600/10 blur-[100px]" />
          <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-blue-600/10 blur-[100px]" />

          <div className="relative z-10">
            <div className="mb-4 text-8xl font-thin tracking-tighter opacity-90">{sign.symbol}</div>
            <h1 className="mb-2 text-5xl font-extrabold tracking-tight text-white md:text-6xl">
              {sign.name}
            </h1>
            <p className="text-xl font-light text-purple-200">{sign.date_display}</p>
          </div>
        </header>

        {/* Quick Stats Grid */}
        <div className="mb-16 grid gap-6 sm:grid-cols-3">
          <StatCard title="Element" value={sign.element} colorClass={themeColor} />
          <StatCard title="Modality" value={sign.modality} colorClass="text-purple-300 bg-purple-900/10 border-purple-500/20" />
          <StatCard 
            title="Ruling Planet" 
            value={Array.isArray(sign.planets) ? sign.planets[0]?.name : sign.planets?.name} 
            colorClass="text-amber-200 bg-amber-900/10 border-amber-500/20" 
            />
        </div>

        {/* Deep Dive Section */}
        <div className="grid gap-12 lg:grid-cols-3">
          
          {/* Main Description */}
          <div className="lg:col-span-2">
            <h2 className="mb-6 text-2xl font-bold text-white">The Archetype</h2>
            <div className="prose prose-invert max-w-none text-lg leading-relaxed text-gray-300">
              <p>{sign.description}</p>
              <p className="mt-4 text-gray-400">
                {/* Note: Since we only seeded a short description, this is a placeholder 
                   for where you might want to add a 'long_description' column later 
                   for a full 500-word essay on the sign.
                */}
                As a {sign.modality} {sign.element} sign, {sign.name} embodies the energy of {Array.isArray(sign.planets) ? sign.planets[0]?.name : sign.planets?.name}. 
                This combination creates a unique force in the zodiac, driving them to express themselves 
                through {sign.keywords.slice(0, 2).join(' and ')} actions.
              </p>
              <p><strong>(This area will turn into a longer type of description for each sign.)</strong></p>
            </div>

            {/* Keywords */}
            <div className="mt-10">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">Keywords</h3>
              <div className="flex flex-wrap gap-3">
                {sign.keywords.map((word: string) => (
                  <span 
                    key={word} 
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-white/10"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Body Parts */}
            <div className="mt-10">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">Anatomical Rulers</h3>
              <div className="flex flex-wrap gap-3">
                {sign.body_part.map((word: string) => (
                  <span 
                    key={word} 
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-white/10"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
            
          </div>

          {/* Sidebar / Correspondences */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm">
            <h3 className="mb-6 border-b border-white/10 pb-2 text-lg font-semibold text-white">
              Magical Associations
            </h3>
            
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex justify-between">
                <span>Polarity</span>
                <span className="text-white">{['Aries', 'Gemini', 'Leo', 'Libra', 'Sagittarius', 'Aquarius'].includes(sign.name) ? 'Yang / Masculine' : 'Yin / Feminine'}</span>
              </li>
              <li className="flex justify-between">
                <span>House</span>
                <span className="text-white">{getHouseNumber(sign.name)} House</span>
              </li>
              <li className="flex justify-between">
                <span>Season</span>
                <span className="text-white">{getSeason(sign.name)}</span>
              </li>
            </ul>

            <div className="mt-8 rounded-xl bg-purple-900/20 p-4 text-center">
              <p className="mb-2 text-xs uppercase tracking-widest text-purple-300">Daily Affirmation</p>
              <p className="italic text-white">
                "I embrace the energy of {sign.name} to guide my path today."
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

// --- Sub-components & Helpers ---

function StatCard({ title, value, colorClass }: { title: string, value: string, colorClass: string }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl border p-6 text-center backdrop-blur-sm ${colorClass}`}>
      <span className="mb-1 text-xs font-semibold uppercase tracking-widest opacity-70">{title}</span>
      <span className="text-2xl font-bold">{value}</span>
    </div>
  );
}

function getHouseNumber(signName: string) {
  const map: Record<string, string> = {
    Aries: '1st', Taurus: '2nd', Gemini: '3rd', Cancer: '4th',
    Leo: '5th', Virgo: '6th', Libra: '7th', Scorpio: '8th',
    Sagittarius: '9th', Capricorn: '10th', Aquarius: '11th', Pisces: '12th'
  };
  return map[signName] || 'Unknown';
}

function getSeason(signName: string) {
  if (['Aries', 'Taurus', 'Gemini'].includes(signName)) return 'Spring';
  if (['Cancer', 'Leo', 'Virgo'].includes(signName)) return 'Summer';
  if (['Libra', 'Scorpio', 'Sagittarius'].includes(signName)) return 'Autumn';
  return 'Winter';
}