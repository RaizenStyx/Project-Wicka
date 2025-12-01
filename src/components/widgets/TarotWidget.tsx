'use client';

import React from 'react';
import WidgetFrame from './WidgetFrame';
import { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { drawRandomCard } from '@/app/actions/tarot';

// Define the type based on your DB schema
type TarotCard = {
  id: number;
  name: string;
  meaning_upright: string;
  description: string;
};


const TarotWidget = () => {
  const [card, setCard] = useState<TarotCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleDraw = async () => {
    setLoading(true);
    setIsFlipped(false); // Reset flip
    
    // Slight artificial delay for "mystique"
    await new Promise(r => setTimeout(r, 800));
    
    const newCard = await drawRandomCard();
    if (newCard) {
      setCard(newCard);
      setIsFlipped(true);
    }
    setLoading(false);
  };

  return (
    <WidgetFrame title="Card of the Day">

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col items-center justify-center min-h-[300px]">
      
      {/* Header */}
      <h3 className="text-slate-400 text-xs font-bold tracking-[0.2em] uppercase mb-4 flex gap-2">
        <Sparkles className="w-3 h-3 text-indigo-400" />
        Daily Draw
      </h3>

      {/* The Card Area */}
      <div className="relative w-40 h-64 perspective-1000 mb-6">
        {/* If no card is drawn yet, show the "Back" of the card */}
        {!isFlipped ? (
          <div 
            onClick={!loading ? handleDraw : undefined}
            className={`
              w-full h-full rounded-lg border-2 border-indigo-900/50 bg-slate-950 
              flex items-center justify-center cursor-pointer hover:border-indigo-500 transition-all
              ${loading ? 'animate-pulse' : ''}
            `}
            style={{
                backgroundImage: 'linear-gradient(135deg, #1e1b4b 25%, transparent 25%), linear-gradient(225deg, #1e1b4b 25%, transparent 25%), linear-gradient(45deg, #1e1b4b 25%, transparent 25%), linear-gradient(315deg, #1e1b4b 25%, #0f172a 25%)',
                backgroundSize: '20px 20px'
            }}
          >
            <span className="text-indigo-400 font-serif font-bold text-2xl">?</span>
          </div>
        ) : (
          /* The Revealed Card */
          <div className="w-full h-full bg-slate-800 rounded-lg border border-slate-700 p-4 flex flex-col items-center justify-between text-center animate-in fade-in zoom-in duration-500">
            <span className="text-xs uppercase text-slate-500">Arcana</span>
            <div className="font-serif text-lg text-indigo-300 leading-tight">
              {card?.name}
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-4">
              {card?.description}
            </p>
          </div>
        )}
      </div>

      {/* Meaning / Action */}
      {isFlipped && card ? (
        <div className="text-center space-y-3 animate-in slide-in-from-bottom-2">
          <p className="text-sm font-medium text-slate-200">
            {card.meaning_upright}
          </p>
          <button 
            onClick={handleDraw}
            className="text-xs text-slate-500 hover:text-indigo-400 flex items-center gap-1 mx-auto transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Draw Again
          </button>
        </div>
      ) : (
        <p className="text-sm text-slate-500 italic">
          {loading ? "Shuffling the deck..." : "Focus your energy and click to draw."}
        </p>
      )}

    </div>
    
    </WidgetFrame>
  );
};

export default TarotWidget;