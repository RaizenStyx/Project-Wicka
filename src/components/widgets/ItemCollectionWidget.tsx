import React from 'react';
import { createClient } from '@/app/utils/supabase/server';
import WidgetFrame from './WidgetFrame'; 
import Link from 'next/link';
import { PackageOpen } from 'lucide-react';
import ItemWidgetClient, { WidgetCollectionItem } from './ItemWidgetClient';

export default async function ItemCollectionWidget() {
  const supabase = await createClient();

  // 1. Check Auth
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <WidgetFrame title="Sanctuary Items">
        <div className="p-4 text-center">
          <PackageOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-slate-400 text-xs mb-3">Login to view your collection.</p>
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

  // 2. Fetch All Collections in Parallel
  const [
    { data: crystals },
    { data: herbs },
    { data: candles },
    { data: runes },
    { data: oils }
  ] = await Promise.all([
    supabase.from('user_crystals').select('id, user_image_url, is_owned, is_wishlisted, crystals(*)').eq('user_id', user.id).or('is_owned.eq.true,is_wishlisted.eq.true'),
    supabase.from('user_herbs').select('id, user_image_url, is_owned, is_wishlisted, herbs(*)').eq('user_id', user.id).or('is_owned.eq.true,is_wishlisted.eq.true'),
    supabase.from('user_candles').select('id, user_image_url, is_owned, is_wishlisted, candles(*)').eq('user_id', user.id).or('is_owned.eq.true,is_wishlisted.eq.true'),
    supabase.from('user_runes').select('id, user_image_url, is_owned, is_wishlisted, runes(*)').eq('user_id', user.id).or('is_owned.eq.true,is_wishlisted.eq.true'),
    supabase.from('user_oils').select('id, user_image_url, is_owned, is_wishlisted, essential_oils(*)').eq('user_id', user.id).or('is_owned.eq.true,is_wishlisted.eq.true'),
  ]);

  // 3. Helper to normalize data structure
  const mapItems = (items: any[], type: WidgetCollectionItem['type']): WidgetCollectionItem[] => {
      if (!items) return [];
      return items.map(item => {
          // The join key name matches the table name (e.g., item.crystals, item.herbs)
          // We find the object key that isn't the standard fields to get the data object
          const dataKey = type === 'oils' ? 'essential_oils' : type; 
          const itemData = Array.isArray(item[dataKey]) ? item[dataKey][0] : item[dataKey];

          return {
              id: item.id,
              user_image_url: item.user_image_url,
              is_owned: item.is_owned,
              is_wishlisted: item.is_wishlisted,
              type: type,
              data: {
                  id: itemData?.id,
                  name: itemData?.name,
                  image_url: itemData?.image_url,
                  color: itemData?.color || itemData?.hex_code, // Crystal/Candle fallback
                  meaning: itemData?.meaning,
                  description: itemData?.description
              }
          };
      });
  };

  // 4. Combine All Data
  const allItems: WidgetCollectionItem[] = [
      ...mapItems(crystals || [], 'crystals'),
      ...mapItems(herbs || [], 'herbs'),
      ...mapItems(candles || [], 'candles'),
      ...mapItems(runes || [], 'runes'),
      ...mapItems(oils || [], 'oils'),
  ];

  return (
    <WidgetFrame title="Magical Inventory">
      <ItemWidgetClient items={allItems} />
    </WidgetFrame>
  );
}