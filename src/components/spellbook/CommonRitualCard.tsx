'use client'

import { Scroll, Clock, BarChart, Moon, ArrowRight } from 'lucide-react'
import { CommonRitual } from '@/app/types/database'
import IngredientBadgeList from './IngredientBadgeList'
import { clsx } from 'clsx'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function CommonRitualCard({ ritual }: { ritual: CommonRitual }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-slate-900 border border-amber-900/30 rounded-xl p-6 relative group hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-900/10 transition-all"
    >
      {/* "Official" Badge */}
      <div className="absolute top-0 right-0 bg-amber-950/50 text-amber-500 text-[10px] px-3 py-1 rounded-bl-xl border-b border-l border-amber-900/30 font-bold uppercase tracking-wider flex items-center gap-1">
        <Scroll className="w-3 h-3" /> Grand Grimoire
      </div>

      {/* Header Info */}
      <div className="mb-4 pr-8">
        <h3 className="text-2xl font-bold text-slate-100 font-serif mb-2">{ritual.title}</h3>
        <p className="text-sm text-slate-400 italic mb-3">{ritual.description}</p>
        
        {/* Meta Tags */}
        <div className="flex flex-wrap gap-2 text-xs">
           {/* Intent */}
           <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">
             {ritual.intent}
           </span>
           
           {/* Difficulty */}
           <span className={clsx(
             "px-2 py-1 rounded border flex items-center gap-1",
             ritual.difficulty === 'Beginner' ? "bg-green-900/20 text-green-400 border-green-900/30" :
             ritual.difficulty === 'Intermediate' ? "bg-blue-900/20 text-blue-400 border-blue-900/30" :
             "bg-red-900/20 text-red-400 border-red-900/30"
           )}>
             <BarChart className="w-3 h-3" /> {ritual.difficulty}
           </span>

           {/* Time */}
           {ritual.estimated_time && (
             <span className="bg-slate-800 text-slate-400 px-2 py-1 rounded flex items-center gap-1 border border-slate-700">
               <Clock className="w-3 h-3" /> {ritual.estimated_time}
             </span>
           )}
           
           {/* Moon */}
           {ritual.moon_phase && (
             <span className="bg-slate-800 text-slate-400 px-2 py-1 rounded flex items-center gap-1 border border-slate-700">
               <Moon className="w-3 h-3" /> {ritual.moon_phase}
             </span>
           )}
        </div>
      </div>

      {/* Smart Ingredients (Reusing your Badge List!) */}
      <div className="mb-6 p-4 bg-slate-950/50 rounded-lg border border-slate-800/50">
          <IngredientBadgeList ids={ritual.linked_crystals} tableName="crystals" label="Required Crystals" />
          <IngredientBadgeList ids={ritual.linked_herbs} tableName="herbs" label="Required Herbs" />
          <IngredientBadgeList ids={ritual.linked_candles} tableName="candles" label="Required Candles" />
      </div>

      {/* Content */}
      <div className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed font-serif prose prose-invert max-w-none">
        {ritual.content}
      </div>
      
      {/* Action Area */}
      <div className="mt-6 pt-4 border-t border-slate-800/50 flex justify-between items-center">
        <span className="text-xs text-slate-500 font-serif italic">
            Prepare your sanctuary before entering.
        </span>
        
        <Link 
            href={`/altar?ritual_id=${ritual.id}`}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-amber-900/20 hover:shadow-amber-900/40"
        >
            Enter Altar <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

    </motion.div>
  )
}