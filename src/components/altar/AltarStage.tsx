'use client'

import { ReactNode } from 'react'

interface AltarStageProps {
  children: ReactNode;
  backgroundId?: string;
  clothId?: string;
}

export default function AltarStage({ children, backgroundId = 'void', clothId = 'wood' }: AltarStageProps) {
  return (
    <div 
        className="relative w-full h-[60vh] flex justify-center items-center perspective-container z-0"
        style={{
            // This polygon draws a box that is 100% wide, but 200% tall.
            // It effectively crops the Left/Right, but lets the Bottom hang down.
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 200%, 0% 200%)'
        }}
    >
      
      {/* 1. BACKGROUND LAYER */}
      <div 
        className={`absolute inset-0 `}
        style={{
            backgroundImage: backgroundId === 'void' ? `url('/backgrounds/${backgroundId}.jpg')` : undefined,
            backgroundSize: 'cover',
            opacity: 0.5 
        }}
      />

      {/* 2. THE 3D CAMERA */}
      <div className="relative w-full h-full" style={{ perspective: '1200px' }}>
        
        {/* THE TABLE SURFACE */}
        {/* Kept the w-full md:w-[120%] logic from the previous step */}
        <div 
           className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-full md:w-[120%] h-[80%] bg-stone-900 origin-bottom shadow-2xl transition-transform duration-700 ease-out"
           style={{ 
             transform: 'rotateX(60deg) translateZ(-50px)',
             transformStyle: 'preserve-3d', 
             backgroundImage: `url('/textures/${clothId}.jpg')`,
             backgroundSize: 'cover'
           }}
        >
           {/* Surface Thickness */}
           <div className="absolute top-full left-0 w-full h-8 bg-stone-950/80 skew-x-[30deg] origin-top" />

           {/* --- 3D LEGS --- */}
           <div className="absolute top-[80%] left-[10%] w-8 h-[400px] bg-stone-950 origin-top" 
                style={{ transform: 'rotateX(-90deg)', backgroundImage: `url('/textures/${clothId}.jpg')` }} />
           <div className="absolute top-[80%] right-[10%] w-8 h-[400px] bg-stone-950 origin-top" 
                style={{ transform: 'rotateX(-90deg)', backgroundImage: `url('/textures/${clothId}.jpg')` }} />
           <div className="absolute top-[20%] left-[10%] w-8 h-[400px] bg-black origin-top" 
                style={{ transform: 'rotateX(-90deg)', backgroundImage: `url('/textures/${clothId}.jpg')` }} />
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