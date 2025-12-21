'use client'

import { ReactNode } from 'react'

interface AltarItemWrapperProps {
  children: ReactNode;
  top: string;
  left: string;
  zIndex: number;
}

export default function AltarItemWrapper({ children, top, left, zIndex }: AltarItemWrapperProps) {
  return (
    <div 
      className="absolute transition-all duration-700 ease-out"
      style={{ 
        top: top, 
        left: left,
        zIndex: zIndex,
        
        // --- THE FIX ---
        // 1. origin-bottom: Ensures we rotate from the "feet", not the waist.
        transformOrigin: 'bottom center',
        
        // 2. translate(-50%, -100%): Moves the element UP so its bottom edge touches the target point.
        // 3. rotateX(-40deg): Counter-rotates to stand up (match your table's angle).
        transform: 'translate(-50%, -100%) rotateX(-40deg)', 
        
        transformStyle: 'preserve-3d',
        
        // 4. pointer-events-none: Prevents the empty wrapper box from blocking clicks 
        // (we'll re-enable clicks on the children if needed)
        // Actually, for lighting candles, we need clicks, so keep it auto or omit this.
      }}
    >
      {/* Shadow to ground it */}
      {/* Moved shadow slightly lower so it looks like it's ON the table */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-4 bg-black/40 blur-md rounded-[100%] scale-y-50 origin-bottom" />
      
      {children}
    </div>
  )
}