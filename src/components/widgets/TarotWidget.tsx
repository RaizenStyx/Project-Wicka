'use client';

import React, { useState } from 'react';
import WidgetFrame from './WidgetFrame'; 
import { Sparkles, RefreshCw, Layers } from 'lucide-react';
import { drawWidgetCard } from '@/app/actions/tarot'; 
import Image from 'next/image';

type TarotCard = {
  id: number;
  name: string;
  meaning_upright: string;
  description: string;
  image_url?: string | null; 
};

const TarotWidget = () => {
  const [card, setCard] = useState<TarotCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [emptyMessage, setEmptyMessage] = useState<string | null>(null);

  const handleDraw = async () => {
    if (loading) return;
    
    setLoading(true);
    setIsFlipped(false); 
    
    await new Promise(r => setTimeout(r, 600));
    
    const response = await drawWidgetCard();

    // 1. Check for specific error key first
    if ('error' in response) {
        console.error(response.error);
        setLoading(false);
        return;
    }

    // 2. Check for empty message
    if (response.message) {
        setEmptyMessage(response.message);
        setRemaining(0);
        setLoading(false);
        return;
    }

    // 3. Success
    if (response.card) {
      setCard(response.card);
      setRemaining(response.remaining ?? 0); 
      setIsFlipped(true); 
    }
    
    setLoading(false);
  };

  return (
    <WidgetFrame title="Card of the Day">
      <p>TODO: Make first draw an intentional card, save to profile for the day?</p>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col items-center justify-center min-h-[340px]">
      
        {/* Header */}
        <div className="flex w-full justify-between items-start mb-4">
            <h3 className="text-slate-400 text-xs font-bold tracking-[0.2em] uppercase flex gap-2 items-center">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Daily Draw
            </h3>
            {/* Remaining Counter */}
            {remaining !== null && (
                <div className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-800 px-2 py-1 rounded-full">
                    <Layers className="w-3 h-3" />
                    <span>{remaining} left</span>
                </div>
            )}
        </div>

        {/* Empty Deck State */}
        {emptyMessage ? (
            <div className="flex flex-col items-center justify-center h-40 text-center animate-in fade-in">
                <div className="bg-slate-800 p-4 rounded-full mb-3">
                    <Layers className="w-6 h-6 text-slate-500" />
                </div>
                <p className="text-slate-300 font-medium text-sm">{emptyMessage}</p>
                <p className="text-slate-500 text-xs mt-1">Refills at midnight</p>
            </div>
        ) : (
            <>
                {/* The Card Area */}
                <div className="relative w-40 h-64 perspective-1000 mb-6 group">
                    {/* CARD BACK (Not Flipped) */}
                    {!isFlipped ? (
                    <div 
                        onClick={handleDraw}
                        className={`
                        w-full h-full rounded-lg border-2 border-indigo-900/50 bg-slate-950 
                        flex items-center justify-center cursor-pointer hover:border-indigo-500 transition-all shadow-xl
                        ${loading ? 'animate-pulse' : 'hover:-translate-y-1'}
                        `}
                        style={{
                            backgroundImage: 'linear-gradient(135deg, #1e1b4b 25%, transparent 25%), linear-gradient(225deg, #1e1b4b 25%, transparent 25%), linear-gradient(45deg, #1e1b4b 25%, transparent 25%), linear-gradient(315deg, #1e1b4b 25%, #0f172a 25%)',
                            backgroundSize: '20px 20px'
                        }}
                    >
                        <span className="text-indigo-400 font-serif font-bold text-2xl">?</span>
                    </div>
                    ) : (
                    /* CARD FRONT (Revealed) */
                    <div className="relative w-full h-full bg-slate-800 rounded-lg border border-slate-700 overflow-hidden flex flex-col items-center justify-between text-center animate-in flip-in-y duration-700 shadow-2xl shadow-indigo-500/10">
                        {card?.image_url ? (
                            // IF Image exists in DB
                            <div className="absolute inset-0">
                                <Image src={card.image_url} alt={card.name} fill className="object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                                <div className="absolute bottom-2 left-0 w-full text-center">
                                     <span className="text-white font-serif font-bold drop-shadow-md">{card.name}</span>
                                </div>
                            </div>
                        ) : (
                            // FALLBACK (Text Only)
                            <div className="p-4 h-full flex flex-col justify-between">
                                <span className="text-xs uppercase text-slate-500">Arcana</span>
                                <div className="font-serif text-lg text-indigo-300 leading-tight my-auto">
                                    {card?.name}
                                </div>
                                <p className="text-[10px] text-slate-400 line-clamp-4 leading-relaxed">
                                    {card?.description}
                                </p>
                            </div>
                        )}
                    </div>
                    )}
                </div>

                {/* Footer / Action */}
                {isFlipped && card ? (
                    <div className="text-center space-y-3 animate-in slide-in-from-bottom-2 w-full">
                    <p className="text-sm font-medium text-slate-200">
                        {card.meaning_upright}
                    </p>
                    <button 
                        onClick={handleDraw}
                        className="text-xs text-slate-500 hover:text-indigo-400 flex items-center gap-1 mx-auto transition-colors border border-slate-800 rounded-full px-3 py-1 hover:border-indigo-500/50"
                    >
                        <RefreshCw className="w-3 h-3" /> Draw Another
                    </button>
                    </div>
                ) : (
                    <p className="text-xs text-slate-500 italic">
                    {loading ? "Consulting the spirits..." : "Tap the deck to draw"}
                    </p>
                )}
            </>
        )}
      </div>
    </WidgetFrame>
  );
};

export default TarotWidget;