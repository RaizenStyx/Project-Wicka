import React from 'react';
import { createClient } from '@/app/utils/supabase/server';
import WidgetFrame from './WidgetFrame'; 
import Link from 'next/link';
import { Gem } from 'lucide-react';
import CrystalWidgetClient from './CrystalWidgetClient';

export default async function CrystalCollectionWidget() {
  const supabase = await createClient();

  // 1. Check Auth
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <WidgetFrame title="Crystal Satchel">
        <div className="p-4 text-center">
          <Gem className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-slate-400 text-xs mb-3">Start your collection.</p>
          <Link 
            href="/login" 
            className="block w-full py-1.5 bg-purple-900/50 hover:bg-purple-900 border border-purple-800 rounded text-[10px] uppercase font-bold text-purple-200 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </WidgetFrame>
    );
  }

  // 2. Fetch User's Collection with Crystal Details
  const { data: collection } = await supabase
    .from('user_crystal_collection')
    .select(`
      id,
      user_image_url,
      crystals (*)
    `)
    .eq('user_id', user.id)
    .limit(9); // Limit to 9 for a 3x3 grid, or however many fit

    const formattedCollection = collection as any[];

  return (
    <WidgetFrame title={
      <div className="flex items-center gap-2">
        <Gem className="w-3 h-3 text-purple-400" />
        Satchel
        <span className="bg-slate-800 text-slate-500 text-[9px] px-1.5 py-0.5 rounded-full border border-slate-700">
          {collection?.length || 0}
        </span>
        WishList Tab?
      </div>
    }>
    {/* Hand off the rendering to the Client Component */}
      <CrystalWidgetClient collection={formattedCollection || []} />
    </WidgetFrame>
  );
}