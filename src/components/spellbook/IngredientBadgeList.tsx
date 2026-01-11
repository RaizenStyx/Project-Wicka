'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import { Loader2 } from 'lucide-react';

interface IngredientBadgeListProps {
  ids: string[];
  // Updated table names
  tableName: 'crystals' | 'herbs' | 'candles' | 'runes' | 'essential_oils';
  label: string;
}

export default function IngredientBadgeList({ ids, tableName, label }: IngredientBadgeListProps) {
  const [items, setItems] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchNames() {
      if (!ids || ids.length === 0) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from(tableName)
        .select('id, name') 
        .in('id', ids);

      if (data) setItems(data);
      setLoading(false);
    }

    fetchNames();
  }, [ids, tableName]);

  if (!ids || ids.length === 0) return (
    <div className="mb-3">
      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-1">
        {label}
      </span>
        <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-slate-800 border border-slate-700 text-slate-300">
             No smart ingredients for {label}
            </span>
        </div>
    </div>
  );

  return (
    <div className="mb-3">
      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-1">
        {label}
      </span>
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin text-slate-600" />
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span 
              key={item.id} 
              className="inline-flex items-center px-2 py-1 rounded text-xs bg-slate-800 border border-slate-700 text-slate-300"
            >
              {item.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}