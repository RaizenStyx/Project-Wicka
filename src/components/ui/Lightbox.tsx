'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import Image from 'next/image'
import { useEffect } from 'react'

interface LightboxProps {
  src: string | null
  alt: string
  onClose: () => void
}

export default function Lightbox({ src, alt, onClose }: LightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (src) {
        window.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden'; // Lock scroll
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [src, onClose]);

  return (
    <AnimatePresence>
      {src && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 h-full"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white z-10 p-2 bg-black/50 rounded-full cursor-pointer">
            <X className="w-8 h-8" />
          </button>
          
          <motion.div
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             exit={{ scale: 0.9, opacity: 0 }}
             className="relative w-full h-full max-w-5xl max-h-[90vh]"
             onClick={(e) => e.stopPropagation()}
          >
             <Image 
                src={src} 
                alt={alt}
                fill
                className="object-contain"
                sizes="100vw"
             />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}