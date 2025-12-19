import { getAltarItems, lightCandle } from '@/app/actions/altar-actions'
import AltarCandle from '@/components/altar/AltarCandle'
import { Sparkles } from 'lucide-react'

export const metadata = {
  title: 'Altar | Nocta',
  description: 'Come here to place collectable items on your Nocta home altar!',
};

export default async function AltarPage() {
  const items = await getAltarItems()
  
  // Find the candle in the items array
  const candle = items.find(i => i.item_type === 'candle')

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      
      {/* Header Info */}
      <div className="p-6 text-center z-10">
         <h1 className="text-3xl font-serif text-purple-200">Home Altar</h1>
         <p className="text-slate-400 text-sm">A sacred space that persists through time.</p>
      </div>

      {/* --- THE ALTAR TABLE CONTAINER --- */}
      <div className="flex-grow relative overflow-hidden flex items-end justify-center pb-20">
         
         {/* Background (Wall) */}
         <div className="absolute inset-0 bg-slate-900 z-0" />

         {/* The Table Surface */}
         <div 
           className="absolute bottom-0 w-full h-[35vh] z-0 shadow-[0_-10px_50px_rgba(0,0,0,0.5)]"
           style={{
             background: 'linear-gradient(to bottom, #3E2723, #271612)', 
             borderTop: '4px solid #5D4037'
           }}
         >
            {/* Wood Grain Texture Overlay - USING INLINE STYLES */}
            <div 
                className="w-full h-full opacity-10"
                style={{ 
                    backgroundImage: "url('https://www.transparenttextures.com/patterns/wood-pattern.png')" 
                }} 
            />
         </div>

         {/* --- ITEMS AREA --- */}
         {/* This area sits on top of the table. width/height match the table surface somewhat */}
         <div className="relative w-full max-w-4xl h-[40vh] z-10">
            
            {candle ? (
              <AltarCandle item={candle} />
            ) : (
              // Empty State: Button to place first candle
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                 <form action={lightCandle}>
                    <button className="flex flex-col items-center gap-2 text-slate-400 hover:text-amber-200 transition-colors animate-pulse cursor-pointer">
                       <Sparkles className="w-8 h-8" />
                       <span className="text-sm font-serif">Light your candle</span>
                    </button>
                 </form>
              </div>
            )}

         </div>

      </div>
    </div>
  )
}