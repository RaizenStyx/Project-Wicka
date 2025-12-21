'use client'

import { ReactNode } from 'react'

interface AltarStageProps {
  children: ReactNode;
  backgroundId?: string;
  clothId?: string;
}

export default function AltarStage({ children, backgroundId = 'void', clothId = 'wood' }: AltarStageProps) {
  return (
    <div className="relative w-full h-[60vh] flex justify-center items-center  perspective-container">
      
      {/* 1. BACKGROUND LAYER (Fixed Z-Index) */}
      <div 
        className={`absolute inset-0 `}
        style={{
            // If you have background images later, render them here
            backgroundImage: backgroundId === 'void' ? `url('/backgrounds/${backgroundId}.jpg')` : undefined,
            backgroundSize: 'cover',
            opacity: 0.5 // Dim it slightly so the table pops
        }}
      />

      {/* 2. THE 3D CAMERA */}
      <div className="relative w-full h-full" style={{ perspective: '1200px' }}>
        
        {/* THE TABLE SURFACE */}
        <div 
           className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[120%] h-[80%] bg-stone-900 origin-bottom shadow-2xl transition-transform duration-700 ease-out"
           style={{ 
             transform: 'rotateX(65deg) translateZ(-50px)',
             transformStyle: 'preserve-3d', 
             backgroundImage: `url('/textures/${clothId}.jpg')`,
             backgroundSize: 'cover'
           }}
        >
           {/* Surface Thickness */}
           <div className="absolute top-full left-0 w-full h-8 bg-stone-950/80 skew-x-[30deg] origin-top" />

           {/* --- NEW: 3D LEGS --- */}
           {/* Front Left */}
           <div className="absolute top-[80%] left-[10%] w-8 h-[400px] bg-stone-950 origin-top" 
                style={{ transform: 'rotateX(-90deg)', backgroundImage: `url('/textures/${clothId}.jpg')` }} />
           {/* Front Right */}
           <div className="absolute top-[80%] right-[10%] w-8 h-[400px] bg-stone-950 origin-top" 
                style={{ transform: 'rotateX(-90deg)', backgroundImage: `url('/textures/${clothId}.jpg')` }} />
           {/* Back Left (Darker for depth) */}
           <div className="absolute top-[20%] left-[10%] w-8 h-[400px] bg-black origin-top" 
                style={{ transform: 'rotateX(-90deg)', backgroundImage: `url('/textures/${clothId}.jpg')` }} />
           {/* Back Right */}
           <div className="absolute top-[20%] right-[10%] w-8 h-[400px] bg-black origin-top" 
                style={{ transform: 'rotateX(-90deg)', backgroundImage: `url('/textures/${clothId}.jpg')` }} />

           {/* ITEMS CONTAINER */}
           <div className="absolute inset-0 p-10" style={{ transformStyle: 'preserve-3d' }}>
              {children}
           </div>
        </div>
      </div>
    </div>
  )
}