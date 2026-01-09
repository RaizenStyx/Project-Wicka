'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { TarotCard, SavedCardData, DrawnCard, TarotDrawFlowProps } from '@/app/types/database';
import { saveReading } from '@/app/actions/tarot-actions';
import { SPREAD_CATEGORIES, ALL_SUPPORTER_ROLES } from '@/app/utils/constants';
import { SpreadTemplate } from '@/app/types/database';
import Image from 'next/image';
import { Sparkles, Save, RotateCcw, Lock, ChevronRight, LayoutGrid, Layers } from 'lucide-react';
import { clsx } from 'clsx';

// Flatten all for "Custom" view
const ALL_TEMPLATES = Object.values(SPREAD_CATEGORIES).flat();

type Stage = 'SPREAD_TYPE_SELECT' | 'CATEGORY_SELECT' | 'TEMPLATE_SELECT' | 'SHUFFLE' | 'DRAW' | 'REFLECTION';

interface ExtendedProps extends TarotDrawFlowProps {
  userRole?: string; 
}

export default function TarotDrawFlow({ fullDeck, cardBackUrl, userRole = 'user' }: ExtendedProps) {
  
  // --- STATE ---
  // If supporter, start at type select. If not, jump straight to 3-card category select.
  const [stage, setStage] = useState<Stage>(
    (ALL_SUPPORTER_ROLES.includes(userRole)) ? 'SPREAD_TYPE_SELECT' : 'CATEGORY_SELECT'
  );

  const [selectedSpreadType, setSelectedSpreadType] = useState<'3-Card' | 'Celtic Cross' | 'Zodiac'>('3-Card');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<SpreadTemplate>(SPREAD_CATEGORIES['Daily Guidance'][0]);
  const [customQuery, setCustomQuery] = useState(''); // For the "Custom" input box

  const [shuffledDeck, setShuffledDeck] = useState<TarotCard[]>([]);
  const [isCharging, setIsCharging] = useState(false);
  const [chargeLevel, setChargeLevel] = useState(0); 
  
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]); 
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const deckControls = useAnimation();
  const chargeInterval = useRef<NodeJS.Timeout | null>(null);

  // --- ACTIONS ---

  const handleSpreadTypeSelect = (type: '3-Card' | 'Celtic Cross' | 'Zodiac') => {
    setSelectedSpreadType(type);
    if (type === '3-Card') {
      setStage('CATEGORY_SELECT');
    } else {
      // Placeholder for future logic
      alert("This spread is coming in a future update!");
    }
  };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setStage('TEMPLATE_SELECT');
  };

  const handleTemplateSelect = (template: SpreadTemplate) => {
    setSelectedTemplate(template);
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
      // Fisher-Yates shuffle
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
    // Safety check using selectedTemplate
    if (drawnCards.length >= selectedTemplate.positions.length) return;

    const nextIndex = drawnCards.length;
    const card = shuffledDeck[nextIndex]; 
    const isReversed = Math.random() > 0.8; 

    const newCard: DrawnCard = {
      cardInfo: card,
      reversed: isReversed,
      position: selectedTemplate.positions[nextIndex]
    };

    setDrawnCards([...drawnCards, newCard]);

    if (drawnCards.length + 1 === selectedTemplate.positions.length) {
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

    // Use custom query if provided, otherwise the Template Name
    const finalIntention = customQuery || `${selectedCategory} - ${selectedTemplate.name}`;
    
    const result = await saveReading(selectedSpreadType, finalIntention, dbCards);

    if (result.error) {
        setSaveMessage(result.error);
    } else {
        setSaveMessage("Fate scribed successfully.");
    }
    setIsSaving(false);
  };

  const resetRitual = () => {
    // Reset to the appropriate start based on role
    setStage(ALL_SUPPORTER_ROLES.includes(userRole) ? 'SPREAD_TYPE_SELECT' : 'CATEGORY_SELECT');
    setDrawnCards([]);
    setChargeLevel(0);
    setSaveMessage(null);
    setCustomQuery('');
  };

  // --- RENDERS ---

  return (
    <div className="w-full min-h-[600px] flex flex-col items-center justify-center relative bg-slate-900/40 rounded-3xl border border-slate-800 p-4 md:p-10 overflow-hidden shadow-2xl">
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950/60 to-slate-950 pointer-events-none" />

      <AnimatePresence mode="wait">

        {/* STAGE 0: SPREAD TYPE (SUPPORTER ONLY) */}
        {stage === 'SPREAD_TYPE_SELECT' && (
           <motion.div 
           key="type-select"
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0, x: -20 }}
           className="flex flex-col items-center gap-6 z-10 w-full max-w-2xl"
         >
           <h2 className="text-2xl font-serif text-slate-200">Select Ritual Configuration</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
             
             {/* 3-CARD (Available) */}
             <button
               onClick={() => handleSpreadTypeSelect('3-Card')}
               className="group relative p-6 bg-indigo-950/50 border border-indigo-500/30 rounded-xl hover:bg-indigo-900/40 hover:border-indigo-400 transition-all text-left"
             >
               <Layers className="w-8 h-8 text-indigo-400 mb-3" />
               <h3 className="text-lg font-bold text-slate-200 group-hover:text-white">Triad Spread</h3>
               <p className="text-xs text-slate-400 mt-2">Past, Present, Future & other 3-card insights.</p>
             </button>

             {/* CELTIC CROSS (Disabled) */}
             <button disabled className="relative p-6 bg-slate-900/30 border border-slate-800 rounded-xl opacity-60 cursor-not-allowed text-left">
                <LayoutGrid className="w-8 h-8 text-slate-600 mb-3" />
                <h3 className="text-lg font-bold text-slate-500">Celtic Cross</h3>
                <p className="text-xs text-slate-600 mt-2">The classic 10-card situation analysis.</p>
                <div className="absolute top-3 right-3"><Lock className="w-4 h-4 text-slate-600" /></div>
             </button>

             {/* ZODIAC (Disabled) */}
             <button disabled className="relative p-6 bg-slate-900/30 border border-slate-800 rounded-xl opacity-60 cursor-not-allowed text-left">
                <Sparkles className="w-8 h-8 text-slate-600 mb-3" />
                <h3 className="text-lg font-bold text-slate-500">Zodiac Wheel</h3>
                <p className="text-xs text-slate-600 mt-2">12-card astrological year ahead.</p>
                <div className="absolute top-3 right-3"><Lock className="w-4 h-4 text-slate-600" /></div>
             </button>
           </div>
           (This text will be removed. The Celtic Cross and Zodiac spreads are coming in future updates. This page itself is also a supporter perk. Normal memebers will only see the 3-card category select.)
         </motion.div>
        )}

        {/* STAGE 1: CATEGORY SELECT */}
        {stage === 'CATEGORY_SELECT' && (
          <motion.div 
            key="category"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center gap-6 z-10 w-full max-w-2xl"
          >
            <h2 className="text-2xl font-serif text-slate-200">What is your focus?</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              {Object.keys(SPREAD_CATEGORIES).map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className="px-6 py-4 bg-slate-800 border border-slate-700 hover:border-purple-500/50 hover:bg-slate-800/80 rounded-xl transition-all text-slate-300 hover:text-purple-200 flex justify-between items-center group"
                >
                  <span>{cat}</span>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
              
              {/* Custom / View All Option */}
              <button
                 onClick={() => handleCategorySelect('Custom')}
                 className="px-6 py-4 bg-slate-900 border border-dashed border-slate-700 hover:border-indigo-500 rounded-xl transition-all text-slate-400 hover:text-indigo-300 col-span-1 sm:col-span-2"
              >
                 All Templates / Custom Intent
              </button>
            </div>
          </motion.div>
        )}

        {/* STAGE 2: TEMPLATE SELECT */}
        {stage === 'TEMPLATE_SELECT' && (
          <motion.div 
            key="template"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center gap-6 z-10 w-full max-w-2xl"
          >
            <div className="w-full flex items-center justify-between">
                <button onClick={() => setStage('CATEGORY_SELECT')} className="text-xs text-slate-500 hover:text-slate-300 uppercase tracking-wider">← Back</button>
                <h2 className="text-xl font-serif text-slate-200">{selectedCategory === 'Custom' ? 'All Layouts' : selectedCategory}</h2>
                <div className="w-8" /> {/* Spacer */}
            </div>
            
            {/* Custom Input (Only if Custom is selected) */}
            {selectedCategory === 'Custom' && (
                <div className="w-full">
                    <input 
                        type="text" 
                        placeholder="Type your specific question here (Optional)..."
                        value={customQuery}
                        onChange={(e) => setCustomQuery(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
                    />
                </div>
            )}

            <div className="grid grid-cols-1 gap-3 w-full max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {(selectedCategory === 'Custom' ? ALL_TEMPLATES : SPREAD_CATEGORIES[selectedCategory]).map((template, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTemplateSelect(template)}
                  className="p-4 bg-slate-800/50 border border-slate-700/50 hover:bg-indigo-900/20 hover:border-indigo-500/50 rounded-xl transition-all text-left group"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-slate-300 group-hover:text-indigo-300">{template.name}</span>
                    <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-500">{template.positions.length} Cards</span>
                  </div>
                  <div className="flex gap-2 text-xs text-slate-500 group-hover:text-slate-400">
                    {template.positions.map((pos, i) => (
                        <span key={i} className="flex items-center">
                            {pos}
                            {i < template.positions.length - 1 && <span className="mx-1 opacity-30">•</span>}
                        </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STAGE 3: SHUFFLE (Same as before, just updated key/transition) */}
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
                <p className="text-sm text-indigo-300/80 italic">"{customQuery || selectedTemplate.name}"</p>
            </div>
            
            <motion.button
              onMouseDown={startCharging}
              onMouseUp={stopCharging}
              onTouchStart={startCharging}
              onTouchEnd={stopCharging}
              animate={deckControls}
              className="relative w-40 h-64 md:w-48 md:h-72 rounded-xl bg-indigo-950 border-4 border-indigo-900 shadow-2xl cursor-grab active:cursor-grabbing group overflow-hidden"
            >
               {/* ... (Existing Image Logic) ... */}
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
             {/* Progress Bar */}
            <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
                <motion.div className="h-full bg-purple-500" style={{ width: `${chargeLevel}%` }} />
            </div>
          </motion.div>
        )}

        {/* STAGE 4, 5: DRAW TABLE (MOBILE REFACTOR) */}
        {(stage === 'DRAW' || stage === 'REFLECTION') && (
          <motion.div 
            key="table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full flex flex-col items-center z-10 h-full max-w-5xl"
          >
            {/* HEADER */}
            <div className="w-full flex justify-between items-center mb-4 md:mb-8 px-2 md:px-4 h-8 shrink-0">
                <span className="text-[10px] md:text-xs text-slate-400 font-bold tracking-widest uppercase flex items-center gap-2">
                    {stage === 'DRAW' ? `Draw ${selectedTemplate.positions.length} Cards` : "The Wisdom of the Cards"}
                </span>
                {stage === 'DRAW' && (
                     <span className="text-xs text-indigo-400">{selectedTemplate.name}</span>
                )}
            </div>

            {/* MAIN PLAY AREA */}
            <div className="flex flex-col items-center w-full gap-6 md:gap-10">
                
                {/* 1. DRAW PILE (Now always on top for mobile, left on desktop logic if needed, but let's center it top for consistency based on request) */}
                {stage === 'DRAW' && (
                    <div className="shrink-0 h-[180px] md:h-[240px] flex items-center justify-center">
                        <motion.button 
                            layoutId="deck"
                            onClick={drawNextCard}
                            whileTap={{ scale: 0.95 }}
                            whileHover={{ scale: 1.05 }}
                            className="w-28 h-44 md:w-40 md:h-60 bg-indigo-950 rounded-xl border-2 border-indigo-800 shadow-xl flex items-center justify-center cursor-pointer hover:border-purple-500 transition-colors overflow-hidden relative"
                        >
                            <Image src={cardBackUrl} alt="Draw Pile" fill className="object-cover" />
                        </motion.button>
                    </div>
                )}

                {/* 2. CARD SLOTS (Grid layout for responsiveness) */}
                <div className="grid grid-cols-3 gap-2 md:gap-8 w-full">
                {selectedTemplate.positions.map((posName, index) => {
                    const card = drawnCards[index];

                   return (
                        <div key={index} className="flex flex-col items-center gap-2 md:gap-3 w-full">
                            
                            {/* Card Slot Container - Responsive Aspect Ratio */}
                            <div className="relative w-full aspect-[2/3] max-w-[160px]" style={{ perspective: '1000px' }}>
                                {/* Empty Slot Outline */}
                                {!card && (
                                <div className="absolute inset-0 border border-dashed border-slate-700 rounded-lg flex items-center justify-center bg-slate-900/30">
                                    <span className="text-slate-600 text-lg md:text-2xl opacity-20">{index + 1}</span>
                                </div>
                                )}

                                {/* Drawn Card Container */}
                                {card && (
                                <motion.div
                                    layoutId={`card-${index}`}
                                    initial={{ opacity: 0, y: -50, scale: 0.8 }} // Fall from deck
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    className="w-full h-full"
                                >
                                    <motion.div
                                    initial={{ rotateY: 180 }}
                                    animate={{ rotateY: 0 }}
                                    transition={{ delay: 0.2, duration: 0.6 }}
                                    className="w-full h-full relative rounded-lg md:rounded-xl shadow-lg"
                                    style={{ transformStyle: 'preserve-3d' }}
                                    >
                                    {/* FRONT */}
                                    <div className="absolute inset-0 backface-hidden">
                                        
                                        {/* Floating Label (Desktop Only - too cramped on mobile) */}
                                        <div className="hidden md:flex absolute -top-8 inset-x-0 justify-center pb-2">
                                            <div className="bg-slate-900/90 border border-slate-600 border-b-0 rounded-t-lg px-3 py-1.5 shadow-lg">
                                                <p className="text-[9px] font-bold uppercase text-indigo-300 tracking-widest whitespace-nowrap">
                                                    {card.cardInfo.name}
                                                    {card.reversed && " (Rev)"  }
                                                </p>
                                            </div>
                                        </div>

                                        <div className="relative h-full w-full rounded-lg md:rounded-xl overflow-hidden border border-slate-600 bg-slate-800 shadow-sm z-10">
                                                {card.cardInfo.image_url ? (
                                                <Image 
                                                    src={card.cardInfo.image_url} 
                                                    alt={card.cardInfo.name} 
                                                    fill 
                                                    sizes="(max-width: 768px) 33vw, 200px"
                                                    className={clsx("object-cover", card.reversed && "rotate-180")} 
                                                />
                                                ) : (
                                                    // Fallback Text
                                                    <div className="p-1 md:p-4 text-center h-full flex flex-col justify-center bg-slate-800">
                                                        <h3 className="text-[10px] md:text-sm text-purple-300 font-serif leading-tight">{card.cardInfo.name}</h3>
                                                    </div>
                                                )}
                                        </div>
                                    </div>

                                    {/* BACK */}
                                    <div 
                                        className="absolute inset-0 bg-indigo-950 rounded-lg md:rounded-xl border border-indigo-900 overflow-hidden"
                                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                                    >
                                        <Image src={cardBackUrl} alt="Card Back" fill className="object-cover" />
                                    </div>
                                    </motion.div>
                                </motion.div>
                                )}
                            </div>
                            
                            {/* Position Label */}
                            <span className="text-[10px] md:text-xs text-slate-500 uppercase font-medium text-center leading-tight h-8 flex items-start justify-center">
                                {posName}
                            </span>
                        </div>
                    );
                })}
                </div>
            </div>

            {/* STAGE 5: REFLECTION PANEL (No changes needed logic-wise, just style) */}
            {stage === 'REFLECTION' && (
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full mt-4 md:mt-8 bg-slate-950/80 border border-slate-800 rounded-xl p-4 md:p-6 backdrop-blur-md"
                >
                    <h3 className="text-lg md:text-xl font-serif text-purple-200 mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5"/>
                        Interpretation
                    </h3>
                    <p className="text-sm text-slate-400 mb-6 italic">Intent: "{customQuery || selectedTemplate.name}"</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {drawnCards.map((c, i) => (
                            <div key={i} className="space-y-1 md:space-y-2 bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
                                <h4 className="text-indigo-400 font-bold text-xs md:text-sm uppercase">{c.position}: {c.cardInfo.name} {c.reversed ? "(Rev)" : ""}</h4>
                                <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
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
                    </div>
                </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}