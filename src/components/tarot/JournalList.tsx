'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronDown, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import type { HydratedTarotReading } from '@/app/types/database'; 
import Image from 'next/image';

export default function JournalList({ initialReadings }: { initialReadings: HydratedTarotReading[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!initialReadings || initialReadings.length === 0) {
    return (
      <div className="text-center p-12 border border-dashed border-slate-800 rounded-xl text-slate-500">
        <Sparkles className="w-8 h-8 mx-auto mb-4 opacity-50" />
        <p>Your journal is empty. Scribe your first fate in the Divination Room.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {initialReadings.map((reading) => {
        const date = new Date(reading.created_at).toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        const isExpanded = expandedId === reading.id;

        return (
          <div key={reading.id} className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden transition-colors hover:border-slate-700">
            
            {/* Header / Trigger */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : reading.id)}
              className="w-full flex items-center justify-between p-6 text-left"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-indigo-400 uppercase tracking-wider font-bold">
                  <Calendar className="w-3 h-3" />
                  {date}
                </div>
                <h3 className="text-lg font-serif text-slate-200">{reading.spread_name}</h3>
                {reading.query && (
                  <p className="text-sm text-slate-500 italic">"{reading.query}"</p>
                )}
              </div>
              
              <ChevronDown className={clsx("w-5 h-5 text-slate-500 transition-transform", isExpanded && "rotate-180")} />
            </button>

            {/* Expanded Content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-slate-950/30 border-t border-slate-800"
                >
                  <div className="p-6">
                     {/* Dynamic Grid Layout */}
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {reading.cards && Array.isArray(reading.cards) ? (
                            reading.cards.map((card, idx) => (
                                <div key={idx} className="flex flex-col gap-2 p-4 bg-slate-900 rounded-lg border border-slate-800 items-center text-center">
                                    {/* Position Label */}
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                                        {card.position_name || `Card ${idx+1}`}
                                    </p>
                                    
                                    {/* Image (Small Thumbnail) */}
                                    {card.info.image_url && (
                                        <div className="relative w-24 h-36 rounded-md overflow-hidden border border-slate-700 my-2">
                                            <Image 
                                                src={card.info.image_url} 
                                                alt={card.info.name} 
                                                fill 
                                                className={clsx("object-cover", card.reversed && "rotate-180")}
                                            />
                                        </div>
                                    )}

                                    {/* Card Name */}
                                    <p className="text-indigo-300 font-serif text-lg">
                                        {card.info.name}
                                    </p>
                                    
                                    {/* Status / Keywords */}
                                    <div className="flex flex-col gap-1">
                                         {card.reversed && <span className="text-[10px] text-amber-500/80 uppercase tracking-widest font-bold">Reversed</span>}
                                         <span className="text-xs text-slate-500">{card.info.numerical_keyword}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-500 col-span-3 text-center">Card data unavailable.</p>
                        )}
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        );
      })}
    </div>
  );
}