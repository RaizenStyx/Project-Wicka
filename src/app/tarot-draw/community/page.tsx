import { getCommunityReadings } from '@/app/actions/tarot-actions';
import CommunityFeed from '@/components/tarot/CommunityFeed';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Community Spreads | Nyxus',
  description: 'Anonymous glimpses into the fates of others.',
};

export const revalidate = 60; // Refresh every minute

export default async function CommunityPage() {
  const readings = await getCommunityReadings();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        
        <header className="mb-10 flex flex-col gap-4">
          <Link 
            href="/tarot-draw" 
            className="text-xs text-slate-500 hover:text-indigo-400 flex items-center gap-2 transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Divination
          </Link>
          
          <div>
            <h1 className="text-3xl md:text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-indigo-200">
                The Collective
            </h1>
            <p className="text-slate-400 mt-2">
                Anonymous threads of fate woven by the coven.
            </p>
          </div>
        </header>

        <CommunityFeed readings={readings} />
      </div>
    </div>
  );
}