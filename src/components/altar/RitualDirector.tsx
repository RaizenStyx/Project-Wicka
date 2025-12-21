'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRight, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { performRitualStep, lightCandleInSlot, cleanseAltar } from '@/app/actions/altar-actions'

// Update STEPS to include the itemType so the DB knows what to add
const STEPS = [
  { id: 'setup', label: 'Prepare Space', slot: null, type: null },
  { id: 'south_place', label: 'Place Candle', slot: 'south', type: 'candle', action: 'Place Candle' },
  { id: 'south_light', label: 'Light Candle', slot: 'south', type: null, action: 'Light Fire', isLightAction: true },
  { id: 'west', label: 'Invoke Water', slot: 'west', type: 'chalice', action: 'Place Chalice' },
  { id: 'north', label: 'Invoke Earth', slot: 'north', type: 'crystal', action: 'Place Crystal' },
  { id: 'east', label: 'Invoke Air', slot: 'east', type: 'incense', action: 'Light Incense' },
  { id: 'finish', label: 'Complete', slot: null, type: null }
]

export default function RitualDirector({ ritualId }: { ritualId: string | null }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isRitualActive, setIsRitualActive] = useState(!!ritualId)
  
  const currentStep = STEPS[currentStepIndex]
  const router = useRouter()

  if (!isRitualActive) return null

  // --- SAFETY CHECK ---
  // If we went past the last step, or something is wrong, don't render.
  if (!currentStep) return null;

  const handleNextStep = async () => {
    if (!ritualId) return;

    // Step 1: CLEANSE ALTAR ---
    if (currentStep.id === 'setup') {
        await cleanseAltar();
    }

    // 1. FIRE THE SERVER ACTION
    if (currentStep.isLightAction && currentStep.slot) {
        await lightCandleInSlot(currentStep.slot);
    } 
    else if (currentStep.slot) {
        await performRitualStep(ritualId, currentStep.id, currentStep.slot, currentStep.type);
    }

    // 2. REFRESH UI
    // This forces the AltarPage to re-fetch items, so the new item appears instantly
    router.refresh(); 

    // 3. ADVANCE STEP
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1)
    } else {
      alert("Ritual Complete!")
      router.push('/altar') 
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent z-50 flex flex-col items-center pb-12">
       
       <AnimatePresence mode="wait">
         <motion.div 
            key={currentStep.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
         >
            <h2 className="text-xl font-serif text-purple-200 mb-1">{currentStep.label}</h2>
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-4">Step {currentStepIndex + 1} of {STEPS.length}</p>
            
            {currentStep.id === 'finish' ? (
               <button onClick={handleNextStep} className="px-8 py-3 bg-amber-600 text-white rounded-full font-bold shadow-lg shadow-amber-900/40 animate-pulse">
                  Close Circle
               </button>
            ) : (
               <button 
                  onClick={handleNextStep}
                  className="group relative px-6 py-3 bg-slate-800 border border-purple-500/30 text-purple-100 rounded-lg flex items-center gap-3 hover:bg-slate-700 transition-all cursor-pointer"
               >
                  <Sparkles className="w-5 h-5 text-purple-400 group-hover:rotate-12 transition-transform" />
                  <span>{currentStep.action || 'Continue'}</span>
                  <ArrowRight className="w-4 h-4 opacity-50" />
               </button>
            )}
         </motion.div>
       </AnimatePresence>

       {/* Progress Dots */}
       <div className="flex gap-2 mt-6">
          {STEPS.map((step, idx) => (
             <div 
               key={step.id} 
               className={`w-2 h-2 rounded-full transition-colors ${idx === currentStepIndex ? 'bg-purple-500' : idx < currentStepIndex ? 'bg-purple-900' : 'bg-slate-800'}`} 
             />
          ))}
       </div>
    </div>
  )
}