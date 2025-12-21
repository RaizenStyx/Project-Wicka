'use client'

import Image from 'next/image'

export default function AltarCrystal({ item, details }: { item: any, details: any }) {
  return (
    <div className="relative group w-16 h-16 flex items-end justify-center">
       {details?.image_url ? (
          <div className="relative w-full h-full drop-shadow-2xl">
              {/* Ensure you configure domain in next.config.js for images */}
              <Image 
                src={details.image_url} 
                alt={details.name}
                fill
                className="object-contain"
              />
          </div>
       ) : (
          // Fallback Crystal Shape (CSS Diamond)
          <div className="w-10 h-14 bg-purple-300/40 border border-purple-200 backdrop-blur-sm clip-path-crystal shadow-lg" 
               style={{ 
                clipPath: 'polygon(30% 0%, 60% 15%, 85% 5%, 100% 40%, 75% 85%, 50% 100%, 25% 85%, 0% 40%)' 
                }}
          >
             <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent" />
          </div>
       )}

      {/* Label */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-50">
        {details?.name || 'Crystal'}
      </div>
    </div>
  )
}