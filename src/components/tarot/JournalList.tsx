'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronDown, Sparkles, Globe, Lock } from 'lucide-react';
import { clsx } from 'clsx';
import type { HydratedTarotReading } from '@/app/types/database'; 
import Image from 'next/image';
import { togglePublicStatus } from '@/app/actions/tarot-actions';

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

  // Helper to handle toggle
  const handleTogglePublic = async (readingId: string, currentStatus: boolean) => {
     // Optimistic UI update could go here, but for simplicity we'll just wait for server
     await togglePublicStatus(readingId, !currentStatus);
     // You might want to trigger a router.refresh() here or use a localized state update 
     // if you want instant feedback without full page reload.
  };

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
              className="w-full flex items-center justify-between p-4 md:p-6 text-left"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] md:text-xs text-indigo-400 uppercase tracking-wider font-bold">
                  <Calendar className="w-3 h-3" />
                  {date}
                </div>
                <h3 className="text-base md:text-lg font-serif text-slate-200">{reading.spread_name}</h3>
                {reading.query && (
                  <p className="text-xs md:text-sm text-slate-500 italic line-clamp-1">"{reading.query}"</p>
                )}
              </div>
              
              <ChevronDown className={clsx("w-5 h-5 text-slate-500 transition-transform shrink-0 ml-4", isExpanded && "rotate-180")} />
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
                  <div className="p-4 md:p-6">
                     
                     {/* CARDS GRID: 3 Columns always */}
                     <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
                        {reading.cards && Array.isArray(reading.cards) ? (
                            reading.cards.map((card, idx) => (
                                <div key={idx} className="flex flex-col items-center gap-2">
                                    {/* Position Label */}
                                    <p className="text-[9px] md:text-xs text-slate-500 uppercase font-bold tracking-wider text-center h-5">
                                        {card.position_name || `Card ${idx+1}`}
                                    </p>
                                    
                                    {/* Image Container (Aspect Ratio 2/3) */}
                                    <div className="relative w-full aspect-[2/3] rounded-md overflow-hidden border border-slate-700 bg-slate-900 shadow-sm">
                                        {card.info.image_url ? (
                                            <Image 
                                                src={card.info.image_url} 
                                                alt={card.info.name} 
                                                fill 
                                                sizes="(max-width: 768px) 33vw, 200px"
                                                className={clsx("object-cover", card.reversed && "rotate-180")}
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-[8px] text-slate-600 p-1 text-center">
                                                No Image
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Name */}
                                    <p className="text-indigo-200 font-serif text-[10px] md:text-sm text-center leading-tight">
                                        {card.info.name}
                                    </p>
                                    
                                    {/* Reversed Badge */}
                                    {card.reversed && (
                                        <span className="text-[8px] text-amber-500/80 uppercase tracking-widest font-bold">
                                            Rev
                                        </span>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-500 col-span-3 text-center">Card data unavailable.</p>
                        )}
                     </div>

                     {/* Interpretation Text */}
                     <div className="space-y-3 bg-slate-900/50 p-4 rounded-lg border border-slate-800/50">
                        {reading.cards.map((card, idx) => (
                            <div key={idx}>
                                <span className="text-xs text-indigo-400 font-bold uppercase mr-2">
                                    {card.position_name}:
                                </span>
                                <span className="text-xs md:text-sm text-slate-400">
                                    {card.reversed ? card.info.meaning_reversed : card.info.meaning_upright}
                                </span>
                            </div>
                        ))}
                     </div>

                     {/* SHOW SAVED NOTES IF THEY EXIST */}
                     {reading.notes && (
                        <div className="mt-6 p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-lg">
                            <h4 className="text-xs text-indigo-400 font-bold uppercase mb-2">My Notes</h4>
                            <p className="text-sm text-slate-300 italic whitespace-pre-wrap">{reading.notes}</p>
                        </div>
                     )}

                     {/* COMMUNITY TOGGLE */}
                     <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-200">Community Visibility</span>
                            <span className="text-xs text-slate-500">
                                {reading.is_public 
                                    ? "Visible in Community (Anonymous)" 
                                    : "Private (Only you can see this)"}
                            </span>
                        </div>

                        <button
                            onClick={() => handleTogglePublic(reading.id, reading.is_public || false)}
                            className={clsx(
                                "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all",
                                reading.is_public 
                                    ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/20" 
                                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                            )}
                        >
                            {reading.is_public ? (
                                <> <Globe className="w-3 h-3" /> Shared </>
                            ) : (
                                <> <Lock className="w-3 h-3" /> Private </>
                            )}
                        </button>
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