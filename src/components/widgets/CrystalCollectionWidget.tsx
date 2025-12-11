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

  // 1. Fetch Raw Data
  const { data: rawCollection } = await supabase
    .from('user_crystal_collection')
    .select(`
      id,
      user_image_url,
      is_owned,      
      is_wishlisted, 
      crystals (*)
    `)
    .eq('user_id', user.id)
    .or('is_owned.eq.true,is_wishlisted.eq.true')
    .limit(50); 

  // 2. Transform Data to fix the "Array vs Object" type mismatch
  const formattedCollection = (rawCollection || []).map((item: any) => ({
    id: item.id,
    user_image_url: item.user_image_url,
    is_owned: item.is_owned,
    is_wishlisted: item.is_wishlisted,
    crystals: Array.isArray(item.crystals) ? item.crystals[0] : item.crystals
  }));

  // 3. Count for the badge
  const ownedCount = formattedCollection.length;

  return (
    <WidgetFrame title={
      <div className="flex items-center gap-2">
        <Gem className="w-3 h-3 text-purple-400" />
        Satchel
        <span className="bg-slate-800 text-slate-500 text-[9px] px-1.5 py-0.5 rounded-full border border-slate-700">
          {ownedCount}
        </span>
      </div>
    }>
      <CrystalWidgetClient collection={formattedCollection} />
    </WidgetFrame>
  );
}