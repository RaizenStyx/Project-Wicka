'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { 
  Sparkles, 
  Users, 
  LayoutDashboard,
  ScrollText,
  Search
} from 'lucide-react';

// --- TYPES ---
type NavItem = {
  label: string;
  href: string;
  allowedRoles?: string[];
  isExternal?: boolean;
};

interface SidebarLinksProps {
  profile?: {
    handle?: string;
    role?: string;
  } | null;
}

// --- CONFIGURATION ---
type SectionKey = 'TOOLS' | 'KNOWLEDGE' | 'COVENS';

export default function SidebarLinks({ profile }: SidebarLinksProps) {
  const [activeSection, setActiveSection] = useState<SectionKey>('TOOLS');

  // Static Home List
  const navHome: NavItem[] = [
    { label: 'Join the Coven', href: '/join', allowedRoles: ['initiate'] },
    { label: 'Feed', href: '/' },
    { label: 'Profile', href: "/u/" + (profile?.handle || 'profile') },
    { label: 'Settings', href: '/settings' },
    { label: 'Chat', href: '/chat', allowedRoles: ['guardian', 'supporter', 'Goddess', 'Princess', 'Creator', 'admin'] },
    { label: 'Members', href: '/members', allowedRoles: ['guardian', 'supporter', 'Goddess', 'Princess', 'Creator', 'admin'] },
    { label: 'Support', href: '/support'}
  ];

  // Dynamic Sections
  const swappableSections: Record<SectionKey, { title: string; icon: any; items: NavItem[] }> = {
    TOOLS: {
      title: 'Spirit Tools',
      icon: Sparkles, 
      items: [
        { label: 'Grand Grimoire', href: '/grand-grimoire', allowedRoles: ['guardian', 'supporter', 'Goddess', 'Princess', 'Creator', 'admin']},
        { label: 'Spellbook', href: '/spellbook' },
        { label: 'Sanctuary', href: '/sanctuary'},
        { label: 'Daily Tarot', href: '/tarot-draw', allowedRoles: ['guardian', 'supporter', 'Goddess', 'Princess', 'Creator', 'admin'] },
        { label: 'Home Altar', href: '/altar' },
        { label: 'Find your Deity', href: '/deities', allowedRoles: ['guardian', 'supporter', 'Goddess', 'Princess', 'Creator', 'admin'] },
        { label: 'Oracle AI', href: 'https://ai-oracle-eight.vercel.app/access', allowedRoles: ['supporter', 'Goddess', 'Princess', 'Creator', 'admin'], isExternal: true }
      ]
    },
    KNOWLEDGE: {
      title: 'Arcanum',
      icon: Search,
      items: [
        { label: 'Crystals', href: '/crystals' },
        { label: 'Candles', href: '/candles' },
        { label: 'Herbs', href: '/herbs' },
        { label: 'Runes', href: '/runes' },
        { label: 'Essential Olis', href: '/essential-oils' },
        { label: 'Zodiac Signs', href: '/astrology' },
        { label: 'Tarot Meanings', href: '/tarot-deck', allowedRoles: ['guardian', 'supporter', 'Goddess', 'Princess', 'Creator', 'admin'] }
      ]
    },
    COVENS: {
      title: 'Covens',
      icon: Users,
      items: [
        { label: 'Coven Hub', href: '/' }
      ]
    }
  };

  const filterLinks = (items: NavItem[]) => {
    return items.filter(item => {
      if (!item.allowedRoles) return true;
      return item.allowedRoles.includes(profile?.role || 'initiate');
    });
  };

  // Get current data for the header text
  const currentSectionData = swappableSections[activeSection];

  return (
    <div className="space-y-4 select-none">
      
      {/* 1. STATIC HOME MENU */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-lg">
        <h3 className="text-slate-500 text-xs uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
           <LayoutDashboard className="w-3 h-3" /> 
           Menu
        </h3>
        <ul className="space-y-3">
          {filterLinks(navHome).map((item) => (
            <SidebarItem key={item.label} item={item} />
          ))}
        </ul>
      </div>

      {/* 2. DYNAMIC TABBED MENU */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-lg min-h-[300px] flex flex-col">
        
        {/* THE TABS ROW */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
          {(Object.keys(swappableSections) as SectionKey[]).map((key) => {
             const SectionIcon = swappableSections[key].icon;
             const isActive = activeSection === key;

             return (
               <button
                 key={key}
                 onClick={() => setActiveSection(key)}
                 title={swappableSections[key].title} // Hover tooltip
                 className={clsx(
                   "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 cursor-pointer",
                   isActive 
                    ? "bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.5)] scale-110" // Active Style
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white" // Inactive Style
                 )}
               >
                 <SectionIcon className="w-4 h-4" />
               </button>
             );
          })}
          
          {/* Label of active tab (Optional, helps context) */}
          <span className="ml-auto text-xs font-bold uppercase tracking-widest text-purple-300 animate-in fade-in">
             {currentSectionData.title}
          </span>
        </div>

        {/* THE CONTENT AREA */}
        <div className="relative flex-grow">
            <AnimatePresence mode="wait">
                <motion.ul 
                    key={activeSection} 
                    initial={{ opacity: 0, y: 10 }} // Slide up slightly
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                >
                {filterLinks(currentSectionData.items).length > 0 ? (
                    filterLinks(currentSectionData.items).map((item) => (
                        <SidebarItem key={item.label} item={item} />
                    ))
                ) : (
                    <li className="flex flex-col items-center justify-center h-20 text-slate-600 text-xs italic opacity-50">
                        <ScrollText className="w-6 h-6 mb-2" />
                        Nothing here yet...
                    </li>
                )}
                </motion.ul>
            </AnimatePresence>
        </div>
      </div>

    </div>
  );
}

// --- SUB COMPONENT ---
function SidebarItem({ item }: { item: NavItem }) {
  return (
    <li className="text-sm font-medium text-slate-400 hover:text-purple-300 transition-colors group">
      {item.isExternal ? (
        <a href={item.href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between w-full hover:translate-x-1 transition-transform duration-200">
          {item.label} 
          <span className="text-[10px] opacity-0 group-hover:opacity-50 transition-opacity">↗</span>
        </a>
      ) : (
        <Link href={item.href} className="block w-full hover:translate-x-1 transition-transform duration-200">
          {item.label}
        </Link>
      )}
    </li>
  );
}