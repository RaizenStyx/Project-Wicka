'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronDown, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import type { TarotReadingRow } from '@/app/types/database'; // Ensure this matches your types

export default function JournalList({ initialReadings }: { initialReadings: any[] }) {
  // Using 'any' temporarily for the prop, strictly you should use the return type of getReadingHistory
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
                    {/* NOTE: In a real implementation, you might want to fetch the FULL card details 
                      here if you haven't stored the card names in the JSONB. 
                      Assuming your JSONB has basic info or you fetch it on expand.
                      For now, we'll list the positions if available.
                    */}
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {reading.cards && Array.isArray(reading.cards) ? (
                            reading.cards.map((card: any, idx: number) => (
                                <div key={idx} className="p-4 bg-slate-900 rounded-lg border border-slate-800 text-center">
                                    <p className="text-xs text-slate-500 uppercase mb-1">{card.position_name || `Card ${idx+1}`}</p>
                                    <p className="text-indigo-300 font-serif">
                                        {/* Ideally we have the Name stored, otherwise we only have ID */}
                                        {/* If you only stored ID, we need to join data. 
                                            For this UI to work perfectly, update saveReading to store 'card_name' in the JSON too 
                                            OR fetch full history with a join. */}
                                        Card #{card.card_id} 
                                    </p>
                                    {card.reversed && <span className="text-[10px] text-amber-500/80 uppercase tracking-widest">Reversed</span>}
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-500">Card data unavailable.</p>
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