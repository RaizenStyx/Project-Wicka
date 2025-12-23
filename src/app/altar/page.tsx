import { getAltarItems, getAltarSettings, addFreeItem, clearAltar } from '@/app/actions/altar-actions'
import AltarStage from '@/components/altar/AltarStage'
import RitualDirector from '@/components/altar/RitualDirector'
import AltarCandle from '@/components/altar/AltarCandle' 
import AltarCrystal from '@/components/altar/AltarCrystal'
import AltarItemWrapper from '@/components/altar/AltarItemWrapper'

export const metadata = {
  title: 'Altar | Nyxus',
  description: 'Your sacred digital space.',
};

export default async function AltarPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ ritual_id?: string }> 
}) {
  const params = await searchParams;
  const urlRitualId = params?.ritual_id;

  // 1. Fetch Data
  const [items, settings] = await Promise.all([
    getAltarItems(),
    getAltarSettings()
  ])

  const activeRitualId = urlRitualId || settings?.active_ritual_id || null;

  // 2. Position Helper
  const getItemPosition = (item: any) => {
    const safeSlot = item.slot ? item.slot.toLowerCase() : null;
    switch (safeSlot) {
      case 'north': return { top: '30%', left: '50%' }; 
      case 'south': return { top: '80%', left: '50%' }; 
      case 'east':  return { top: '50%', left: '80%' }; 
      case 'west':  return { top: '50%', left: '20%' }; 
      case 'center': return { top: '50%', left: '50%' };
      default: return { 
        top: `${item.position_y}%`, 
        left: `${item.position_x}%` 
      };
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      
      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-6 text-center z-20 pointer-events-none">
         <h1 className="text-3xl font-serif text-purple-200 drop-shadow-md">Home Altar</h1>
         <p className="text-slate-400 text-sm">A sacred space that persists through time.</p>
      </div>

      {/* 3D Stage */}
      <AltarStage 
        backgroundId={settings?.background_id || 'void'} 
        clothId={settings?.cloth_id || 'wood'}
      >
        {/* --- SINGLE LOOP START --- */}
        {items.map((item) => {
           const position = getItemPosition(item);
           
           return (
             <AltarItemWrapper 
               key={item.id}
               top={position.top}
               left={position.left}
               zIndex={item.slot === 'south' ? 50 : 20}
             >
                {/* Visual Switcher */}
                {item.item_type === 'candle' && <AltarCandle item={item} details={item.details} />}
                {item.item_type === 'crystal' && <AltarCrystal item={item} details={item.details} />}
                
                {/* Fallbacks */}
                {item.item_type === 'chalice' && (
                  <div className="relative w-14 h-20 drop-shadow-2xl filter" title="Chalice">
                    {/* Golden Goblet Shape */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-br from-yellow-200 via-amber-500 to-amber-900"
                      style={{ 
                        // Creates the Cup, Stem, and Base silhouette
                        clipPath: 'polygon(0% 0%, 100% 0%, 85% 50%, 55% 60%, 55% 90%, 80% 100%, 20% 100%, 45% 90%, 45% 60%, 15% 50%)' 
                      }} 
                    />
                    
                    {/* Inner "Liquid" or Shadow depth at the top */}
                    <div 
                      className="absolute top-0 left-[10%] w-[80%] h-2 bg-amber-900/40 blur-[2px] rounded-full" 
                    />
                    
                    {/* White Reflection/Shine on the left side */}
                    <div className="absolute top-2 left-3 w-1.5 h-8 bg-white/40 blur-[1px] rounded-full -rotate-12" />
                  </div>
                )}
                {item.item_type === 'incense' && (
                  <div className="relative w-8 h-24 flex flex-col items-center justify-end" title="Incense">
                    {/* The Smoke Trail */}
                    <div className="w-1.5 h-12 bg-gradient-to-t from-slate-400 via-slate-300/50 to-transparent blur-sm rounded-full animate-pulse origin-bottom -mb-1" />
                    
                    {/* The Glowing Ember */}
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_2px_rgba(239,68,68,0.8)] z-10" />
                    
                    {/* The Stick */}
                    <div className="w-0.5 h-8 bg-amber-900" />
                    
                    {/* The Ash/Holder Base */}
                    <div className="w-6 h-2 bg-stone-600 rounded-full mt-[-1px] shadow-lg border-t border-stone-500" />
                  </div>
                )}
                {item.item_type === 'herb' && <div className="text-4xl filter drop-shadow-lg">🌿</div>}
             </AltarItemWrapper>
           )
        })}
        {/* --- SINGLE LOOP END --- */}
      </AltarStage>

      {/* FREE MODE CONTROLS */}
      {/* Only show if NO ritual is active */}
      {!activeRitualId && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-50">
             <form action={addFreeItem.bind(null, 'candle', 'White Candle')}>
                <button className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-full text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                   + Candle
                </button>
             </form>
             <form action={addFreeItem.bind(null, 'crystal', 'Rose Quartz')}>
                <button className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-full text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                   + Crystal
                </button>
             </form>
             <form action={clearAltar}>
                <button className="px-4 py-2 bg-red-900/50 border border-red-800 rounded-full text-xs text-red-300 hover:bg-red-900 hover:text-white transition-colors">
                   Clear Altar
                </button>
             </form>
          </div>
      )}

      {/* Ritual Overlay */}
      <RitualDirector ritualId={activeRitualId} />

    </div>
  )
}