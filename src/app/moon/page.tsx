import { getMoonData } from '../lib/astrology';
import Link from 'next/link';

export const metadata = {
  title: 'Moon Phase & Astrology | Coven',
  description: 'Current lunar phase, zodiac placement, and magical correspondences.',
};

export default function MoonPage() {
  const moon = getMoonData();

  // Mapping "Moon in [Sign]" to Witchy Advice
  // This is hardcoded for now, but could be moved to DB later
  const signAdvice: Record<string, string> = {
    Aries: "A time for action, new spells, and bold moves. Watch your temper.",
    Taurus: "Focus on money magic, grounding, and self-care rituals.",
    Gemini: "Communication spells are potent. Write in your grimoire.",
    Cancer: "Home protection and emotional healing work is favored.",
    Leo: "Glamour magic and confidence spells shine brightly now.",
    Virgo: "Cleanse your altar and organize your magical tools.",
    Libra: "Love spells and harmony rituals are boosted.",
    Scorpio: "Deep shadow work and divination are extremely powerful.",
    Sagittarius: "Travel protection and seeking wisdom.",
    Capricorn: "Career spells and long-term manifestation planning.",
    Aquarius: "Community rituals and breaking bad habits.",
    Pisces: "Dream work, psychic development, and intuition.",
  };

  const advice = signAdvice[moon.zodiacSign] || "Trust your intuition.";

  return (
    <main className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      <div className="mx-auto max-w-5xl px-6 py-20">
        
        {/* Back Link */}
        {/* <Link href="/" className="text-sm text-gray-500 hover:text-white mb-8 block">&larr; Back to Dashboard</Link> */}

        <div className="grid gap-12 lg:grid-cols-2 items-center">
          
          {/* Left Column: Visuals */}
          <div className="relative flex flex-col items-center justify-center p-10 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-sm aspect-square">
             {/* Dynamic Glow based on illumination */}
             <div 
               className="absolute inset-0 rounded-full bg-purple-500 blur-[100px] transition-opacity duration-1000"
               style={{ opacity: moon.illumination / 200 }} // Max 0.5 opacity at 100%
             />
             
             <div className="text-9xl relative z-10 drop-shadow-2xl">
               {moon.emoji}
             </div>
             
             <div className="mt-8 text-center relative z-10">
                <h1 className="text-4xl font-serif font-bold tracking-wide">{moon.phaseName}</h1>
                <p className="text-purple-300 text-xl mt-2 font-medium">in {moon.zodiacSign}</p>
             </div>
          </div>

          {/* Right Column: Data & Magic */}
          <div className="space-y-8">
            
            {/* Advice Card */}
            <div className="p-8 rounded-2xl border border-purple-500/30 bg-purple-900/10">
              <h2 className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">
                Current Energy
              </h2>
              <p className="text-xl font-light leading-relaxed text-gray-100">
                "{advice}"
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
               <StatBox label="Illumination" value={`${moon.illumination}%`} />
               <StatBox label="Next Phase" value={moon.nextPhase} sub={ `in ${moon.daysToNextPhase} days`} />
               {/* Link to the Zodiac Detail Page we just built! */}
               <Link href={`/astrology/${moon.zodiacSign.toLowerCase()}`} className="col-span-2">
                 <div className="group flex items-center justify-between p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Ruling Sign</div>
                      <div className="text-lg font-semibold text-white group-hover:text-purple-300">Read about {moon.zodiacSign} &rarr;</div>
                    </div>
                 </div>
               </Link>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}

// Simple Helper Component
function StatBox({ label, value, sub }: { label: string, value: string, sub?: string }) {
  return (
    <div className="p-6 rounded-xl border border-white/10 bg-white/5">
      <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-semibold text-white">{value}</div>
      {sub && <div className="text-sm text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}