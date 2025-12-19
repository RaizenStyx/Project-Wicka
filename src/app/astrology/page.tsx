import { createClient } from '../utils/supabase/client';
import ZodiacCard from '@/components/astrology/ZodiacCard';
import { ZodiacSign } from '../types/database';


/* METADATA */
export const metadata = {
  title: 'Astrology | Nocta',
  description: 'Explore the 12 Zodiac signs and their cosmic meanings.',
};

export default async function AstrologyPage() {
  const supabase = await createClient();

  // Fetch all signs, ordered by Month/Day to start with Aries (March)
  const { data: signs, error } = await supabase
    .from('zodiac_signs')
    .select('*')
    .order('start_month', { ascending: true })
    .order('start_day', { ascending: true });

  if (error) {
    console.error('Error fetching zodiacs:', error);
    return <div className="p-10 text-center text-red-400">Failed to load the stars.</div>;
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-16 text-center">
          <h1 className="bg-gradient-to-r from-purple-200 via-white to-purple-200 bg-clip-text text-5xl font-extrabold text-transparent sm:text-6xl">
            The Zodiac
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            Discover the archetypes of the stars. Select a sign to reveal its deeper mysteries.
          </p>
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {signs?.map((sign: ZodiacSign, index: number) => (
            <ZodiacCard key={sign.id} sign={sign} index={index} />
          ))}
        </div>
        
      </div>
    </main>
  );
}