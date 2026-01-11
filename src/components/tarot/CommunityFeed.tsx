'use client';

import { HydratedTarotReading } from '@/app/types/database';
import Image from 'next/image';
import { clsx } from 'clsx';
import { Sparkles, Calendar, Globe } from 'lucide-react';

export default function CommunityFeed({ readings }: { readings: HydratedTarotReading[] }) {
  
  if (readings.length === 0) {
    return (
        <div className="text-center py-20 opacity-50">
            <p>The collective consciousness is quiet.</p>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {readings.map((reading) => {
        const date = new Date(reading.created_at).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        return (
            <div key={reading.id} className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden hover:border-indigo-500/30 transition-all group">
                {/* Anonymous Header */}
                <div className="px-4 py-3 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
                    <div className="flex items-center gap-2 text-indigo-300">
                        <Globe className="w-3 h-3" />
                        <span className="text-xs font-bold uppercase tracking-wider">Anonymous Witch</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{date}</span>
                </div>

                <div className="p-6 space-y-6">
                    {/* Intent */}
                    <div className="text-center">
                        <h3 className="text-purple-200 font-serif text-lg">{reading.spread_name}</h3>
                        {reading.query && <p className="text-sm text-slate-400 italic mt-1">"{reading.query}"</p>}
                    </div>

                    {/* Cards */}
                    <div className="grid grid-cols-3 gap-2">
                        {reading.cards.map((card, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-2">
                                <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
                                    {card.info.image_url && (
                                        <Image 
                                            src={card.info.image_url} 
                                            alt={card.info.name} 
                                            fill 
                                            className={clsx("object-cover", card.reversed && "rotate-180")}
                                        />
                                    )}
                                </div>
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider text-center leading-tight">
                                    {card.position_name}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Notes (If they exist) */}
                    {reading.notes && (
                        <div className="bg-indigo-950/20 p-4 rounded-lg border border-indigo-500/10">
                            <Sparkles className="w-3 h-3 text-indigo-400 mb-2" />
                            <p className="text-sm text-slate-300 italic leading-relaxed">"{reading.notes}"</p>
                        </div>
                    )}
                </div>
            </div>
        );
      })}
    </div>
  );
}