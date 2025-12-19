'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Moon, Sparkles, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Shell({
  children,
  leftSidebar,
  rightSidebar
}: {
  children: React.ReactNode;
  leftSidebar: React.ReactNode;
  rightSidebar: React.ReactNode;
}) {
  const pathname = usePathname(); 
  const [showLeft, setShowLeft] = useState(true);
  const [showRight, setShowRight] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Handle Screen Resize & Initial Mount
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // On Desktop, default sidebars to OPEN if they haven't been touched yet
      if (mobile) {
        setShowLeft(false);
        setShowRight(false);
      } else {
        setShowLeft(true);
        setShowRight(true);
      }
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lock body scroll ONLY on mobile when menu is open
  useEffect(() => {
    if (isMobile && (showLeft || showRight)) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobile, showLeft, showRight]);
  
  // Close menus on route change (Mobile only)
  useEffect(() => {
    if (isMobile) {
      setShowLeft(false);
      setShowRight(false);
    }
  }, [pathname, isMobile]);

  // --- TOGGLE HANDLERS ---
  const toggleLeft = () => {
    if (isMobile && !showLeft) {
      // If we are about to OPEN the left menu on mobile, force close the right one
      setShowRight(false);
    }
    setShowLeft(!showLeft);
  };

  const toggleRight = () => {
    if (isMobile && !showRight) {
      // If we are about to OPEN the right menu on mobile, force close the left one
      setShowLeft(false);
    }
    setShowRight(!showRight);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col">
      
      {/* --- UNIFIED GLOBAL HEADER --- */}
      <header className="sticky top-0 z-50 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 shadow-md">
        
        {/* Left Toggle */}
        <button 
          onClick={toggleLeft} // Uses new handler
          className={`p-2 rounded-full transition-colors cursor-pointer ${showLeft ? 'bg-slate-800 text-purple-400' : 'hover:bg-slate-800 text-slate-400'}`}
          aria-label="Toggle Navigation"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Logo / Title */}
        <div className="flex items-center">
          {pathname !== '/' && (
            <Link 
              href="/" 
              className="group flex items-center gap-1 pr-3 mr-3 border-r border-slate-700/50 text-slate-400 hover:text-purple-400 transition-colors"
            > 
              <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm font-medium tracking-wide uppercase">Feed</span>
            </Link>
          )}

          <Link href="/" className="flex items-center gap-2 group">
          <Image src={'/icon.png'} alt='Nocta Logo' width={50} height={50} />
            <span className="font-serif text-xl font-bold tracking-wider text-slate-100 group-hover:text-white transition-colors">
              NOCTA
            </span>
            <Sparkles className="w-5 h-5 text-purple-500 group-hover:text-purple-400 transition-colors" />
          </Link>
        </div>

        {/* Right Toggle */}
        <button 
          onClick={toggleRight} // Uses new handler
          className={`p-2 rounded-full transition-colors cursor-pointer ${showRight ? 'bg-slate-800 text-indigo-400' : 'hover:bg-slate-800 text-slate-400'}`}
          aria-label="Toggle Grimoire"
        >
          <Moon className="w-6 h-6" />
        </button>
      </header>

      {/* --- MAIN LAYOUT CONTAINER --- */}
      <div className="flex flex-1 relative">

        {/* --- LEFT SIDEBAR --- */}
        <aside 
          className={`
            bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out
            
            ${isMobile ? 'fixed inset-y-0 left-0 z-40 w-72 pt-16' : ''} 
            ${isMobile && !showLeft ? '-translate-x-full' : 'translate-x-0'}

            ${!isMobile ? 'sticky top-16 h-[calc(100vh-4rem)]' : ''}
            ${!isMobile && showLeft ? 'w-72 border-r' : ''}
            ${!isMobile && !showLeft ? 'w-0 border-none overflow-hidden' : ''}
          `}
        >
          <div className="w-72 p-4">
              {leftSidebar}
          </div>
        </aside>

        {/* --- BACKDROP (Mobile Only) --- */}
        {isMobile && (showLeft || showRight) && (
          <div 
            className="fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
            onClick={() => { setShowLeft(false); setShowRight(false); }}
          />
        )}

        {/* --- FEED / CONTENT --- */}
        <main className="flex-1 w-full min-w-0 bg-slate-950">
          {children}
        </main>

        {/* --- RIGHT SIDEBAR --- */}
        <aside 
          className={`
            bg-slate-900/50 border-l border-slate-800 overflow-y-auto overflow-hidden transition-all duration-300 ease-in-out
            
            ${isMobile ? 'fixed inset-y-0 right-0 z-40 w-80 pt-16' : ''} 
            ${isMobile && !showRight ? 'translate-x-full' : 'translate-x-0'}

            ${!isMobile ? 'sticky top-16 h-[calc(100vh-4rem)]' : ''}
            ${!isMobile && showRight ? 'w-80 border-l' : ''}
            ${!isMobile && !showRight ? 'w-0 border-none overflow-hidden' : ''}
          `}
        >
          <div className="w-80 p-4">
            {rightSidebar}
          </div>
        </aside>

      </div>
    </div>
  );
}