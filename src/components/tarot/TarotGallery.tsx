'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { TarotCard } from '@/app/types/database'; 
import { Search, ChevronDown, Sparkles, ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';

interface TarotGalleryProps {
  initialCards: TarotCard[];
  cardBack?: TarotCard | null; // NEW PROP
}

type ArcanaFilter = 'All' | 'Major' | 'Minor';
type SuitFilter = 'All' | 'Wands' | 'Cups' | 'Swords' | 'Pentacles';

const ITEMS_PER_PAGE = 10;

export default function TarotGallery({ initialCards, cardBack }: TarotGalleryProps) {
  const [search, setSearch] = useState('');
  const [arcana, setArcana] = useState<ArcanaFilter>('All');
  const [suit, setSuit] = useState<SuitFilter>('All');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // --- CARD BACK ROTATION ---
  // true = sideways (90deg), false = upright (0deg)
  const [isBackSideways, setIsBackSideways] = useState(true);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, arcana, suit]);

  // Unified Filter Logic
  const filteredCards = useMemo(() => {
    return initialCards.filter((card) => {
      // 1. Search Query
      const matchesSearch = card.name.toLowerCase().includes(search.toLowerCase()) || 
                            card.meaning_upright?.toLowerCase().includes(search.toLowerCase());

      // 2. Arcana Filter
      const matchArcana = arcana === 'All' || card.arcana_type === arcana;
      
      // 3. Suit Filter (Only relevant if not Major)
      const matchSuit = 
        suit === 'All' || 
        (arcana === 'Major') || 
        card.suit === suit;
        
      return matchesSearch && matchArcana && matchSuit;
    });
  }, [initialCards, search, arcana, suit]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredCards.length / ITEMS_PER_PAGE);
  const paginatedCards = filteredCards.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
          setCurrentPage(newPage);
          window.scrollTo({ top: 500, behavior: 'smooth' });
      }
  }

  return (
    <div className="space-y-12">

      {/* --- NEW SECTION: CARD BACK SHOWCASE --- */}
      {cardBack && (
        <section className="flex flex-col items-center justify-center pb-8 border-b border-white/10">
            <div className="relative group cursor-pointer" onClick={() => setIsBackSideways(!isBackSideways)}>
                
                {/* Visual Hint */}
                <div className="absolute -right-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 flex flex-col items-center gap-1">
                    <RotateCw size={16} />
                    <span className="text-[10px] uppercase tracking-widest">Turn</span>
                </div>

                {/* The Card */}
                <motion.div
                    initial={false}
                    animate={{ rotate: isBackSideways ? 90 : 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="relative w-48 rounded-xl shadow-[0_0_50px_-10px_rgba(168,85,247,0.3)] overflow-hidden border border-white/10 bg-slate-900"
                    style={{ aspectRatio: '2/3' }} // Force standard tarot ratio
                >
                    {cardBack.image_url ? (
                        <img 
                            src={cardBack.image_url} 
                            alt="Tarot Card Back" 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                            <Sparkles className="text-purple-900" />
                        </div>
                    )}
                </motion.div>
            </div>
            <p className="mt-6 text-slate-500 text-sm font-serif italic opacity-70">
                The hidden face. Click to turn.
            </p>
        </section>
      )}
      
      {/* --- Filter & Search Bar --- */}
      <div className="sticky top-20 z-30 flex flex-col gap-4 rounded-xl border border-white/10 bg-black/80 p-4 backdrop-blur-md lg:flex-row lg:items-center">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search cards or meanings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 pl-10 pr-4 text-slate-100 placeholder-slate-500 transition-colors focus:border-purple-500 focus:outline-none"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Arcana Toggles */}
          <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-700">
            {['All', 'Major', 'Minor'].map((type) => (
              <button
                key={type}
                onClick={() => {
                    setArcana(type as ArcanaFilter);
                    if (type === 'Major') setSuit('All');
                }}
                className={`rounded-md px-4 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                  arcana === type 
                    ? 'bg-purple-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Styled Suit Dropdown (Hidden for Major Arcana) */}
          <AnimatePresence>
            {arcana !== 'Major' && (
              <motion.div 
                initial={{ opacity: 0, width: 0, scale: 0.9 }} 
                animate={{ opacity: 1, width: 'auto', scale: 1 }}
                exit={{ opacity: 0, width: 0, scale: 0.9 }}
                className="relative max-w-[100px]"
              >
                <div className="relative">
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <select
                    value={suit}
                    onChange={(e) => setSuit(e.target.value as SuitFilter)}
                    className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-900 py-2 pl-4 pr-10 text-sm text-slate-100 focus:border-purple-500 focus:outline-none cursor-pointer"
                  >
                    <option value="All">Suits</option>
                    <option value="Wands">櫨 Wands</option>
                    <option value="Cups">挑 Cups</option>
                    <option value="Swords">暢 Swords</option>
                    <option value="Pentacles">訣 Pentacles</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- Card Grid --- */}
      <motion.div 
        layout
        className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      >
        <AnimatePresence mode="popLayout">
          {paginatedCards.map((card) => (
            <motion.div
              layout
              key={card.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Link href={`/tarot-deck/${card.slug}`}>
                <div className="group relative aspect-[2/3] overflow-hidden rounded-xl border border-white/10 bg-gray-900 transition-all hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                  
                  {card.image_url ? (
                    <img 
                      src={card.image_url} 
                      alt={card.name}
                      loading="lazy" 
                      className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-slate-900 p-4 text-center opacity-60">
                      <Sparkles className="mb-2 h-8 w-8 text-purple-900" />
                      <div className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase text-gray-500">
                        {card.arcana_type}
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/60 to-transparent" />

                  <div className="absolute bottom-0 left-0 w-full p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-purple-400">
                      {card.number !== undefined ? `#${card.number}` : ''}
                    </p>
                    <h3 className="font-serif text-lg font-bold text-white group-hover:text-purple-200">
                      {card.name}
                    </h3>
                  </div>

                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* --- Pagination Controls --- */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8 pt-8 border-t border-slate-800 animate-in fade-in">
            <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                <ChevronLeft size={20} />
            </button>
            
            <span className="text-slate-400 font-serif">
                Page <span className="text-purple-300 font-bold">{currentPage}</span> of {totalPages}
            </span>

            <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                <ChevronRight size={20} />
            </button>
        </div>
      )}
    </div>
  );
}