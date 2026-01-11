'use client'

import { deleteSpell, updateSpell } from '@/app/actions/spell-actions'
import { Lock, Globe, Moon, Pencil, Save, X, Flame, Eye, Scroll, Download, BookOpen, Loader2, Sparkles, Feather } from 'lucide-react' 
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { usePathname } from 'next/navigation'
import { ExtendedSpell } from '@/app/types/database'
import SmartIngredientSelector from './SmartIngredientSelector'
import IngredientBadgeList from './IngredientBadgeList'
import { createClient } from '@/app/utils/supabase/client'

interface SpellCardProps {
  spell: ExtendedSpell
  readOnly?: boolean 
  showAuthor?: boolean
  userRole?: string
}

export default function SpellCard({ 
  spell, 
  readOnly = false, 
  showAuthor = false, 
  userRole = spell.profiles?.role || 'initiate' 
}: SpellCardProps) {

  // 1. SETUP & UTILS
  const pathname = usePathname()
  const supabase = createClient()
  
  const isGrandGrimoire = pathname?.includes('/grand-grimoire')
  const showPublicBadge = spell.is_published && !isGrandGrimoire
  
  // 2. LOGIC: Check for Ingredients
  const hasSmartIngredients = [
    spell.linked_crystals, 
    spell.linked_herbs, 
    spell.linked_candles, 
    spell.linked_essential_oils, 
    spell.linked_runes
  ].some(list => list && list.length > 0);

  const hasExtraIngredients = !!spell.ingredients && spell.ingredients.trim().length > 0;

  // 3. LOCAL STATE
  const [isBurning, setIsBurning] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isReading, setIsReading] = useState(false) 
  const [isLoading, setIsLoading] = useState(false) 
  const [isDownloading, setIsDownloading] = useState(false) 

  // Tab State: Default to Smart if available, else Extra
  const [activeTab, setActiveTab] = useState<'smart' | 'extra'>(hasSmartIngredients ? 'smart' : 'extra')

  // --- EDIT MODE STATE ---
  const [isRitual, setIsRitual] = useState(spell.is_ritual || false)
  const [linkedCrystals, setLinkedCrystals] = useState<string[]>(spell.linked_crystals || [])
  const [linkedHerbs, setLinkedHerbs] = useState<string[]>(spell.linked_herbs || [])
  const [linkedCandles, setLinkedCandles] = useState<string[]>(spell.linked_candles || [])
  const [linkedOils, setLinkedOils] = useState<string[]>(spell.linked_essential_oils || [])
  const [linkedRunes, setLinkedRunes] = useState<string[]>(spell.linked_runes || [])
  
  const canPublish = userRole !== 'initiate';

  const getInitialVisibility = () => {
      if (spell.is_published) return 'community';
      if (spell.is_private) return 'private';
      return 'profile';
  }

  const [editVisibility, setEditVisibility] = useState(getInitialVisibility())

  // Ensure tab state updates if props change (unlikely but safe)
  useEffect(() => {
     if (hasSmartIngredients) setActiveTab('smart');
     else if (hasExtraIngredients) setActiveTab('extra');
  }, [hasSmartIngredients, hasExtraIngredients]);

  // --- ACTIONS ---

  const handleUpdate = async (formData: FormData) => {
    try {
        setIsLoading(true)
        
        const isPrivate = editVisibility === 'private'
        const isPublished = editVisibility === 'community'

        formData.set('is_private', isPrivate ? 'on' : 'off')
        formData.set('is_published', isPublished ? 'on' : 'off')

        formData.set('is_ritual', isRitual ? 'true' : 'false')
        formData.set('linked_crystals', JSON.stringify(linkedCrystals))
        formData.set('linked_herbs', JSON.stringify(linkedHerbs))
        formData.set('linked_candles', JSON.stringify(linkedCandles))
        formData.set('linked_essential_oils', JSON.stringify(linkedOils))
        formData.set('linked_runes', JSON.stringify(linkedRunes))

        if (isRitual) {
            const hasEarth = linkedCrystals.length > 0 || linkedHerbs.length > 0;
            const hasFire = linkedCandles.length > 0;
            if (!hasEarth || !hasFire) {
                alert("Rituals require at least one Earth item (Crystal/Herb) and one Fire item (Candle).");
                setIsLoading(false);
                return;
            }
        }

        const result = await updateSpell(spell.id, formData)

        if (result?.error) {
            alert(`Error: ${result.error}`)
        } else {
            setIsEditing(false) 
        }
    } catch (error) {
        console.error("Critical Update Error:", error);
        alert("Something went wrong updating the spell.");
    } finally {
        setIsLoading(false) 
    }
  }

  const handleBurn = async () => {
    if (readOnly) return;
    if (!confirm("Burn this page? The energy will be released and the record destroyed.")) return;
    setIsBurning(true)
    setTimeout(async () => {
        await deleteSpell(spell.id)
    }, 800) 
  }

  const fetchNames = async (ids: string[], table: string) => {
    if (!ids || ids.length === 0) return 'None';
    const { data } = await supabase.from(table).select('name').in('id', ids);
    if (!data || data.length === 0) return 'None';
    return data.map(item => item.name).join(', ');
  }

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const [crystals, herbs, candles, oils, runes] = await Promise.all([
        fetchNames(spell.linked_crystals, 'crystals'),
        fetchNames(spell.linked_herbs, 'herbs'),
        fetchNames(spell.linked_candles, 'candles'),
        fetchNames(spell.linked_essential_oils, 'essential_oils'),
        fetchNames(spell.linked_runes, 'runes'),
      ]);

      const textContent = `
=== ${spell.title} ===
Intent: ${spell.intent || 'N/A'}
Phase: ${spell.moon_phase || 'Any'}
Scribed By: ${spell.profiles?.username || 'Unknown'}

--- Arcana (Linked Items) --- 
Candles: ${candles}
Crystals: ${crystals}
Oils: ${oils}
Herbs: ${herbs}
Runes: ${runes}

--- Materials (Notes) ---
${spell.ingredients || 'None'}

--- Content ---
${spell.content}
      `.trim();

      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${spell.title.replace(/\s+/g, '_').toLowerCase()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Download failed', error);
      alert('Failed to compile spell data.');
    } finally {
      setIsDownloading(false);
    }
  }

  // --- RENDER: EDIT MODE ---
  if (isEditing) {
    return (
      <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border-2 border-purple-500/50 rounded-xl p-6 relative shadow-2xl overflow-y-auto max-h-[600px] custom-scrollbar"
      >
         <form action={handleUpdate}>
            <div className="mb-4 space-y-3">
               <input name="title" defaultValue={spell.title} required className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 font-serif font-bold focus:border-purple-500 outline-none" placeholder="Spell Title"/>
               <div className="flex gap-2">
                   <input name="intent" defaultValue={spell.intent || ''} className="flex-1 bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-300 focus:border-purple-500 outline-none" placeholder="Intent"/>
                   <select name="moon_phase" defaultValue={spell.moon_phase || 'Any'} className="bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-300 focus:border-purple-500 outline-none">
                     <option value="Any">Any Phase</option>
                     <option value="New Moon">New Moon</option>
                     <option value="Waxing">Waxing</option>
                     <option value="Full Moon">Full Moon</option>
                     <option value="Waning">Waning</option>
                   </select>
               </div>
            </div>

            <div className="mb-4 p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2 mb-4">
                    <input 
                        type="checkbox" 
                        id={`ritual-check-${spell.id}`}
                        checked={isRitual}
                        onChange={(e) => setIsRitual(e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded bg-slate-800 border-slate-600"
                    />
                    <label htmlFor={`ritual-check-${spell.id}`} className="text-sm font-bold text-slate-300">Mark as Ritual</label>
                </div>
                <SmartIngredientSelector tableName="crystals" label="Crystals" selectedIds={linkedCrystals} onSelectionChange={setLinkedCrystals} />
                <SmartIngredientSelector tableName="herbs" label="Herbs" selectedIds={linkedHerbs} onSelectionChange={setLinkedHerbs} />
                <SmartIngredientSelector tableName="candles" label="Candles" selectedIds={linkedCandles} onSelectionChange={setLinkedCandles} />
                <SmartIngredientSelector tableName="essential_oils" label="Essential Oils" selectedIds={linkedOils} onSelectionChange={setLinkedOils} />
                <SmartIngredientSelector tableName="runes" label="Runes" selectedIds={linkedRunes} onSelectionChange={setLinkedRunes} />
            </div>

            <div className="mb-4">
                 <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1 font-bold">Extra Ingredients / Notes</label>
                 <input name="ingredients" type="text" defaultValue={spell.ingredients || ''} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-300 focus:border-purple-500 outline-none" placeholder="Specific oils, personal items..."/>
            </div>

            <textarea name="content" defaultValue={spell.content || ''} rows={5} required className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-300 font-serif focus:border-purple-500 outline-none mb-4 resize-none" placeholder="Ritual steps..."/>

             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <button type="button" onClick={() => setEditVisibility('private')} className={clsx("cursor-pointer px-3 py-1 text-xs rounded-md transition-all flex items-center gap-1", editVisibility === 'private' ? "bg-slate-800 text-white shadow" : "text-slate-500 hover:text-slate-300")}>
                      <Lock className="w-3 h-3" /> Private
                    </button>
                    <button type="button" onClick={() => setEditVisibility('profile')} className={clsx("cursor-pointer px-3 py-1 text-xs rounded-md transition-all flex items-center gap-1", editVisibility === 'profile' ? "bg-slate-800 text-white shadow" : "text-slate-500 hover:text-slate-300")}>
                      <Eye className="w-3 h-3" /> Profile
                    </button>
                    <button type="button" onClick={() => canPublish ? setEditVisibility('community') : alert("Initiate Role Required")} className={clsx("cursor-pointer px-3 py-1 text-xs rounded-md transition-all flex items-center gap-1", editVisibility === 'community' ? "bg-purple-600 text-white shadow" : "text-slate-500 hover:text-slate-300", !canPublish && "opacity-50 cursor-not-allowed")}>
                      <Globe className="w-3 h-3" /> Community
                    </button>
                </div>
                <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setIsEditing(false)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
                    <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded transition-colors shadow-lg shadow-purple-900/20 cursor-pointer">
                        {isLoading ? 'Saving...' : <><Save className="w-3 h-3" /> Save</>}
                    </button>
                </div>
             </div>
         </form>
      </motion.div>
    )
  }

// --- RENDER: VIEW MODE ---
  return (
    <>
        <motion.div 
            layout
            animate={isBurning ? { opacity: 0, scale: 0.9, y: -50, filter: "brightness(0) blur(4px)", transition: { duration: 0.8 } } : { opacity: 1, scale: 1, y: 0, filter: "brightness(1) blur(0px)" }}
            className={clsx("bg-slate-900 border border-slate-800 rounded-xl p-6 relative group transition-all duration-300 flex flex-col h-[500px]", !isBurning && "hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-900/10")}
        >
            {/* Header / Badges */}
            <div className={clsx("flex justify-end mb-2 sm:absolute sm:top-6 sm:right-6 sm:mb-0", "flex-row items-center gap-2")}>
                {showPublicBadge && (
                    <span className="flex items-center gap-1 text-[10px] text-purple-300 border border-purple-900 bg-purple-900/40 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold shadow-sm shadow-purple-900/50">
                    <Globe className="w-3 h-3" /> Public
                    </span>
                )}
                {spell.is_ritual && (
                    <span className="flex items-center gap-1 text-[10px] text-amber-300 border border-amber-900 bg-amber-900/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold shadow-sm">
                    <Scroll className="w-3 h-3" /> Ritual
                    </span>
                )}
                {!spell.is_published && (
                    <>
                        {spell.is_private && <Lock className="w-4 h-4 text-slate-600" />}
                        {!spell.is_private && <Eye className="w-4 h-4 text-slate-500" />}
                    </>
                )}
            </div>

            {/* Author */}
            {showAuthor && spell.profiles && (
                <div className="mb-2 flex items-center gap-2 pb-2 border-b border-slate-800/50 shrink-0">
                    <span className="text-xs text-slate-500">Scribed by</span>
                    <span className="text-sm font-bold text-purple-400 font-serif">{spell.profiles.username}</span>
                    <button 
                        onClick={handleDownload} 
                        disabled={isDownloading}
                        className="p-2 text-slate-500 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50 cursor-pointer" 
                        title="Download Spell"
                    >
                        {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    </button>
                </div>
            )}

            <h3 className="text-xl font-bold text-slate-200 font-serif mb-3 shrink-0">{spell.title}</h3>
            
            {/* --- METADATA GRID --- */}
            <div className="flex flex-col gap-2 mb-4 shrink-0">
                {/* Intention */}
                <div className="bg-slate-950/30 p-2 rounded-lg border border-slate-800/50 flex flex-col gap-1">
                    <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Intention</span>
                    <span className="text-xs text-slate-200 font-medium leading-relaxed font-serif">
                        {spell.intent || 'No specific intention set'}
                    </span>
                </div>
                
                {/* Moon Phase */}
                <div className="bg-slate-950/30 p-2 rounded-lg border border-slate-800/50 flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Moon Phase</span>
                    <span className="text-xs text-slate-300 flex items-center gap-2 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                         <Moon className="w-3 h-3 text-purple-400" />
                         {spell.moon_phase === 'Any' || !spell.moon_phase ? 'Any Phase' : spell.moon_phase}
                    </span>
                </div>
            </div>

            {/* --- TABBED INGREDIENTS SYSTEM --- */}
            {(hasSmartIngredients || hasExtraIngredients) && (
                <div className="flex flex-col mb-2 shrink-0 h-[150px]">
                    {/* Render Tabs ONLY if both exist, otherwise just show content */}
                    {hasSmartIngredients && hasExtraIngredients ? (
                        <div className="flex items-center gap-4 border-b border-slate-800 mb-2 px-1">
                            <button 
                                onClick={() => setActiveTab('smart')}
                                className={clsx("text-[10px] font-bold uppercase tracking-wider pb-1 border-b-2 transition-colors flex items-center gap-1", activeTab === 'smart' ? "text-purple-400 border-purple-400" : "text-slate-600 border-transparent hover:text-slate-400")}
                            >
                                <Sparkles className="w-3 h-3" /> Arcana
                            </button>
                            <button 
                                onClick={() => setActiveTab('extra')}
                                className={clsx("text-[10px] font-bold uppercase tracking-wider pb-1 border-b-2 transition-colors flex items-center gap-1", activeTab === 'extra' ? "text-purple-400 border-purple-400" : "text-slate-600 border-transparent hover:text-slate-400")}
                            >
                                <Feather className="w-3 h-3" /> Materials
                            </button>
                        </div>
                    ) : (
                        // Header for single item type
                        <div className="mb-2 px-1">
                             <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                {hasSmartIngredients ? "Required Arcana" : "Required Materials"}
                             </span>
                        </div>
                    )}

                    {/* Content Area */}
                    <div className="overflow-y-auto custom-scrollbar flex-1 pr-1">
                        {activeTab === 'smart' && hasSmartIngredients && (
                            <div className="space-y-1">
                                <IngredientBadgeList ids={spell.linked_crystals} tableName="crystals" label="Crystals" />
                                <IngredientBadgeList ids={spell.linked_herbs} tableName="herbs" label="Herbs" />
                                <IngredientBadgeList ids={spell.linked_candles} tableName="candles" label="Candles" />
                                <IngredientBadgeList ids={spell.linked_essential_oils} tableName="essential_oils" label="Oils" />
                                <IngredientBadgeList ids={spell.linked_runes} tableName="runes" label="Runes" />
                            </div>
                        )}
                        {activeTab === 'extra' && hasExtraIngredients && (
                             <p className="text-xs text-slate-400 italic leading-relaxed font-serif">{spell.ingredients}</p>
                        )}
                    </div>
                </div>
            )}

            {/* --- OPEN SCROLL BUTTON --- */}
            <div className="flex-1 flex items-center justify-center pb-2">
                <button 
                    onClick={() => setIsReading(true)}
                    className="group flex items-center justify-center gap-2 text-slate-500 hover:text-purple-300 transition-all w-full py-3 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-slate-800"
                >
                    <BookOpen className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-all" />
                    <span className="text-[10px] uppercase tracking-widest font-bold">Open Scroll</span>
                </button>
            </div>

            {/* Footer Controls */}
            {!readOnly && (
                <div className="absolute bottom-4 right-4 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 z-10 bg-slate-900/80 backdrop-blur-sm rounded-lg p-1">
                    <button 
                        onClick={handleDownload} 
                        disabled={isDownloading}
                        className="p-2 text-slate-500 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50 cursor-pointer" 
                        title="Download Spell"
                    >
                        {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setIsEditing(true)} className="p-2 text-slate-500 hover:text-purple-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer" title="Edit Spell"><Pencil className="w-4 h-4" /></button>
                    <button onClick={handleBurn} disabled={isBurning} className="p-2 text-slate-500 hover:text-orange-500 hover:bg-orange-950/30 rounded-lg transition-colors cursor-pointer" title="Burn Page"><Flame className={clsx("w-4 h-4", isBurning && "animate-pulse text-orange-500")} /></button>
                </div>
            )}
        </motion.div>

        {/* --- READING MODAL --- */}
        <AnimatePresence>
            {isReading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        onClick={() => setIsReading(false)}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-slate-900 w-full max-w-2xl max-h-[80vh] rounded-2xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden"
                    >
                        <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-950">
                            <div>
                                <h2 className="text-2xl font-serif font-bold text-purple-200">{spell.title}</h2>
                                {spell.profiles && <p className="text-sm text-slate-500">by {spell.profiles.username}</p>}
                            </div>
                            <button onClick={() => setIsReading(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-[url('/textures/paper-noise.png')] bg-repeat">
                             <div className="prose prose-invert prose-p:text-slate-300 prose-headings:text-purple-300 max-w-none">
                                <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-slate-200">
                                    {spell.content}
                                </div>
                             </div>
                        </div>

                        <div className="p-4 border-t border-slate-800 bg-slate-950 text-center">
                            <span className="text-xs text-slate-600 uppercase tracking-widest">End of Record</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    </>
  )
}