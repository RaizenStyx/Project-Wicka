'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { TarotCard, SavedCardData } from '@/app/types/database';
import { saveReading } from '@/app/actions/tarot-actions';
import Image from 'next/image';
import { Sparkles, Save, RotateCcw } from 'lucide-react';
import { clsx } from 'clsx';
import { TarotDrawFlowProps, DrawnCard } from '@/app/types/database';

// --- TYPES ---
type Stage = 'INTENTION' | 'SHUFFLE' | 'DRAW' | 'REFLECTION';

const SPREAD_POSITIONS = ['The Situation', 'The Obstacle', 'The Advice'];

export default function TarotDrawFlow({ fullDeck, cardBackUrl }: TarotDrawFlowProps) {
  // --- STATE ---
  const [stage, setStage] = useState<Stage>('INTENTION');
  const [intention, setIntention] = useState('');
  
  const [shuffledDeck, setShuffledDeck] = useState<TarotCard[]>([]);
  const [isCharging, setIsCharging] = useState(false);
  const [chargeLevel, setChargeLevel] = useState(0); 
  
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]); 
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const deckControls = useAnimation();
  const chargeInterval = useRef<NodeJS.Timeout | null>(null);

  // --- ACTIONS ---

  const handleIntentionSelect = (intent: string) => {
    setIntention(intent);
    setStage('SHUFFLE');
  };

  const startCharging = () => {
    setIsCharging(true);
    deckControls.start({
      x: [0, -2, 2, -2, 2, 0],
      y: [0, 1, -1, 1, -1, 0],
      transition: { duration: 0.1, repeat: Infinity }
    });

    chargeInterval.current = setInterval(() => {
      setChargeLevel(prev => Math.min(prev + 2, 100)); 
      const newDeck = [...fullDeck];
      for (let i = newDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
      }
      setShuffledDeck(newDeck);
    }, 50);
  };

  const stopCharging = () => {
    setIsCharging(false);
    deckControls.stop();
    if (chargeInterval.current) clearInterval(chargeInterval.current);
    deckControls.set({ x: 0, y: 0 });
    setStage('DRAW');
  };

  const drawNextCard = () => {
    if (drawnCards.length >= SPREAD_POSITIONS.length) return;

    const nextIndex = drawnCards.length;
    const card = shuffledDeck[nextIndex]; 
    const isReversed = Math.random() > 0.8; 

    const newCard: DrawnCard = {
      cardInfo: card,
      reversed: isReversed,
      position: SPREAD_POSITIONS[nextIndex]
    };

    setDrawnCards([...drawnCards, newCard]);

  // Auto-transition to REFLECTION after last card is drawn and revealed
  if (drawnCards.length + 1 === SPREAD_POSITIONS.length) {
    setTimeout(() => setStage('REFLECTION'), 1600); 
  }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const dbCards: SavedCardData[] = drawnCards.map((c, i) => ({
      card_id: c.cardInfo.id,
      reversed: c.reversed,
      position_name: c.position,
      position_index: i
    }));

    const result = await saveReading('3-Card Spread', intention, dbCards);

    if (result.error) {
        setSaveMessage(result.error);
    } else {
        setSaveMessage("Fate scribed successfully.");
    }
    setIsSaving(false);
  };

  const resetRitual = () => {
    setStage('INTENTION');
    setDrawnCards([]);
    setChargeLevel(0);
    setSaveMessage(null);
  };

  // --- RENDERS ---

  return (
    <div className="w-full min-h-[600px] flex flex-col items-center justify-center relative bg-slate-900/40 rounded-3xl border border-slate-800 p-6 md:p-10 overflow-hidden shadow-2xl">
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950/60 to-slate-950 pointer-events-none" />

      <AnimatePresence mode="wait">

        {/* STAGE 1: INTENTION */}
        {stage === 'INTENTION' && (
          <motion.div 
            key="intention"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-8 z-10 text-center"
          >
            <h2 className="text-2xl font-serif text-slate-200">What do you seek?</h2>
            <div className="grid grid-cols-2 gap-4">
              {['General Guidance', 'Love & Relationships', 'Career & Path', 'Shadow Work'].map((item) => (
                <button
                  key={item}
                  onClick={() => handleIntentionSelect(item)}
                  className="px-6 py-4 bg-slate-800 border border-slate-700 hover:border-purple-500/50 hover:bg-slate-800/80 rounded-xl transition-all text-slate-300 hover:text-purple-200"
                >
                  {item}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STAGE 2: SHUFFLE */}
        {stage === 'SHUFFLE' && (
          <motion.div 
            key="shuffle"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center gap-8 z-10"
          >
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-serif text-slate-200">Charge the Deck</h2>
                <p className="text-xs text-slate-400 uppercase tracking-widest">Hold to shuffle • Release to begin</p>
            </div>
            
            <motion.button
              onMouseDown={startCharging}
              onMouseUp={stopCharging}
              onTouchStart={startCharging}
              onTouchEnd={stopCharging}
              animate={deckControls}
              className="relative w-48 h-72 rounded-xl bg-indigo-950 border-4 border-indigo-900 shadow-2xl cursor-grab active:cursor-grabbing group overflow-hidden"
            >
              <div className="absolute inset-0">
                 <Image src={cardBackUrl} alt="Deck" fill className="object-cover" />
                 <div className="absolute inset-0 bg-indigo-950/20" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <Sparkles className={clsx("w-12 h-12 text-white drop-shadow-md transition-all duration-300", isCharging ? "animate-spin scale-125" : "opacity-70")} />
              </div>
              <motion.div 
                className="absolute inset-0 bg-purple-500 mix-blend-overlay blur-xl -z-10"
                animate={{ opacity: chargeLevel / 100 }}
              />
            </motion.button>

            <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
                <motion.div className="h-full bg-purple-500" style={{ width: `${chargeLevel}%` }} />
            </div>
          </motion.div>
        )}

        {/* STAGE 3, 4: DRAW TABLE */}
        {(stage === 'DRAW' || stage === 'REFLECTION') && (
          <motion.div 
            key="table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full flex flex-col items-center z-10 h-full"
          >
            {/* HEADER */}
            <div className="w-full flex justify-between items-center mb-8 px-4 h-8">
                <span className="text-xs text-slate-400 font-bold tracking-widest uppercase flex items-center gap-2">
                    {stage === 'DRAW' && `Draw ${SPREAD_POSITIONS.length} Cards`}
                    {stage === 'REFLECTION' && "The Wisdom of the Cards"}
                </span>
            </div>

            <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center justify-center w-full grow relative">
                
                {/* DRAW PILE */}
                {stage === 'DRAW' && (
                    <motion.button 
                        layoutId="deck"
                        onClick={drawNextCard}
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.05 }}
                        className="w-32 h-48 md:w-40 md:h-60 bg-indigo-950 rounded-xl border-2 border-indigo-800 shadow-xl flex items-center justify-center cursor-pointer hover:border-purple-500 transition-colors overflow-hidden relative"
                    >
                        <Image src={cardBackUrl} alt="Draw Pile" fill className="object-cover" />
                    </motion.button>
                )}

                {/* CARD SLOTS */}
                {SPREAD_POSITIONS.map((posName, index) => {
                    const card = drawnCards[index];

                   return (
                        <div key={index} className="flex flex-col items-center gap-3">
                        <div className="relative w-32 h-48 md:w-40 md:h-60" style={{ perspective: '1000px' }}>
                            {/* Empty Slot Outline */}
                            {!card && (
                            <div className="absolute inset-0 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center">
                                <span className="text-slate-600 text-2xl opacity-20">{index + 1}</span>
                            </div>
                            )}

                            {/* Drawn Card Container */}
                            {card && (
                            <motion.div
                                layoutId={`card-${index}`}
                                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                                animate={{ 
                                opacity: 1, 
                                scale: 1,
                                y: 0
                                }}
                                transition={{ duration: 0.4 }}
                                className="w-full h-full"
                            >
                                {/* Flip Container - Auto reveals after entrance */}
                                <motion.div
                                initial={{ rotateY: 180 }}
                                animate={{ rotateY: 0 }}
                                transition={{ 
                                    delay: 0.5, // Delay before flip starts
                                    duration: 0.6, // Smooth flip duration
                                    ease: "easeInOut"
                                }}
                                className="w-full h-full relative rounded-xl shadow-lg"
                                style={{ 
                                    transformStyle: 'preserve-3d'
                                }}
                                >
                                {/* FRONT (Face Up) */}
                                <div className="absolute inset-0 backface-hidden">
                                    
                                    {/* 1. The Floating Tab Label (Positioned Above) */}
                                    <div className="absolute -top-7 inset-x-0 flex justify-center pb-2">
                                        <div className="bg-slate-900/90 border border-slate-600 border-b-0 rounded-t-lg px-3 py-1.5 shadow-lg">
                                            <p className="text-[9px] font-bold uppercase text-indigo-300 tracking-widest whitespace-nowrap">
                                                {card.cardInfo.name} {card.reversed ? "(Rev)" : ""}
                                            </p>
                                        </div>
                                    </div>

                                    {/* 2. The Card Image Container (Main Body) */}
                                    <div className="relative h-full w-full rounded-xl overflow-hidden border border-slate-600 bg-slate-800 shadow-sm z-10">
                                            {card.cardInfo.image_url ? (
                                            <Image 
                                                src={card.cardInfo.image_url} 
                                                alt={card.cardInfo.name} 
                                                fill 
                                                sizes="(max-width: 768px) 150px, 200px"
                                                className={clsx("object-cover", card.reversed && "rotate-180")} 
                                            />
                                            ) : (
                                                <div className="p-4 text-center h-full flex flex-col justify-center">
                                                <h3 className="text-purple-300 font-serif">{card.cardInfo.name}</h3>
                                                </div>
                                            )}
                                    </div>
                                </div>

                                {/* BACK (Face Down) */}
                                <div 
                                    className="absolute inset-0 bg-indigo-950 rounded-xl border-2 border-indigo-900 overflow-hidden"
                                    style={{ 
                                    backfaceVisibility: 'hidden',
                                    WebkitBackfaceVisibility: 'hidden',
                                    transform: 'rotateY(180deg)'
                                    }}
                                >
                                    <Image src={cardBackUrl} alt="Card Back" fill className="object-cover" />
                                </div>
                                </motion.div>
                            </motion.div>
                            )}
                        </div>
                        <span className="text-xs text-slate-500 uppercase font-medium">{posName}</span>
                        </div>
                    );
                })}
            </div>

            {/* STAGE 5: REFLECTION PANEL */}
            {stage === 'REFLECTION' && (
                <motion.div 
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full mt-8 bg-slate-950/80 border border-slate-800 rounded-xl p-6 backdrop-blur-md"
                >
                    <h3 className="text-xl font-serif text-purple-200 mb-6 flex items-center gap-2">
                        <Sparkles className="w-5 h-5"/>
                        Interpretation
                    </h3>
                    <p className="text-sm text-slate-400 mb-6 italic">Intention: "{intention}"</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {drawnCards.map((c, i) => (
                            <div key={i} className="space-y-2">
                                <h4 className="text-indigo-400 font-bold text-sm uppercase">{c.position}: {c.cardInfo.name} {c.reversed ? "(Rev)" : ""}</h4>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    {c.reversed ? c.cardInfo.meaning_reversed : c.cardInfo.meaning_upright}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-slate-800 pt-6">
                        <button 
                            onClick={resetRitual}
                            className="text-slate-500 hover:text-slate-300 flex items-center gap-2 text-sm"
                        >
                            <RotateCcw className="w-4 h-4" /> Discard & Restart
                        </button>

                        <div className="flex items-center gap-4">
                            {saveMessage && (
                                <span className={clsx("text-sm font-medium", saveMessage.includes("success") ? "text-green-400" : "text-amber-400")}>
                                    {saveMessage}
                                </span>
                            )}
                            
                            {!saveMessage && (
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50 shadow-lg shadow-indigo-900/20"
                                >
                                    <Save className="w-4 h-4" />
                                    {isSaving ? "Scribing..." : "Scribe Fate (Save Daily)"}
                                </button>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 italic mt-2 sm:mt-0 text-center">
                            Your reading will be recorded in your Tarot Journal.
                        </p>
                    </div>
                </motion.div>
            )}
            <p className="text-xs text-slate-500 italic mt-10 sm:mt-5 text-center">
                This area may evolve into a AI interpretation space in future updates.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}