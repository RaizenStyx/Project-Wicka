'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ZodiacSign } from '@/app/types/database';

interface ZodiacCardProps {
  sign: ZodiacSign;
  index: number;
}

export default function ZodiacCard({ sign, index }: ZodiacCardProps) {
  // Stagger animation based on index
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { delay: index * 0.05, duration: 0.5 }
    }
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.05, rotate: 1 }}
      className="group"
    >
      <Link href={`/astrology/${sign.name.toLowerCase()}`}>
        <div className="relative h-full overflow-hidden rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-md transition-colors hover:border-purple-500/50 hover:bg-black/60 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]">
          
          {/* Background Glow Effect */}
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-purple-900/20 blur-3xl transition-all group-hover:bg-purple-600/20" />

          {/* Icon / Symbol */}
          <div className="mb-4 flex items-center justify-between">
            <span className="text-4xl">{sign.symbol}</span>
            <span className="rounded-full bg-white/5 px-2 py-1 text-xs font-medium uppercase tracking-wider text-gray-400">
              {sign.element}
            </span>
          </div>

          {/* Content */}
          <h3 className="mb-1 text-xl font-bold text-white group-hover:text-purple-300">
            {sign.name}
          </h3>
          <p className="mb-3 text-sm text-gray-400">{sign.date_display}</p>
          
          <p className="line-clamp-2 text-sm leading-relaxed text-gray-300/80">
            {sign.description}
          </p>

          {/* Keywords (Pills) */}
          <div className="mt-4 flex flex-wrap gap-2">
            {sign.keywords.slice(0, 2).map((keyword) => (
              <span 
                key={keyword} 
                className="text-[10px] rounded-md border border-white/5 bg-white/5 px-2 py-1 text-gray-400"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}