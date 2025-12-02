import React from 'react';
import Link from 'next/link';

// Define the shape of a Navigation Item
type NavItem = {
  label: string;
  href: string;
  // If 'roles' is missing, everyone sees it. 
  // If present, only listed roles see it.
  allowedRoles?: string[]; 
  isExternal?: boolean;
};

interface SidebarLinksProps {
  //userRole: string;
  profile?: {
    handle?: string;
    // avatar_url?: string | null;
    // id: string;
    role?: string;
  } | null;
}

const SidebarLinks = ({ profile }: SidebarLinksProps) => {
  
  // THE CONFIGURATION OBJECTS
  const navHome: NavItem[] = [
    { 
      label: 'Join the Coven', 
      href: '/join', 
      allowedRoles: ['initiate']
    },
    {
      label: 'Feed',
      href: '/',
    },
    {
      label: 'Profile',
      href: "/u/" + (profile?.handle || 'profile'),
    },
    {
      label: 'Settings',
      href: '/settings',
    },
    {
      label: 'Chat - TBD',
      href: '/chat',
    },
   {
      label: 'Members List - 5',
      href: '/members',
    }
  ];

  const navTools: NavItem[] = [
    { 
      label: 'Home Altar - 2', 
      href: '/altar' 
    },
    { 
      label: 'Spellbook - 4', 
      href: '/spellbook' 
    },
    { 
      label: 'Crystal Log - 3', 
      href: '/crystal-log' 
    },
    { 
      label: 'Tarot Draw - 1', 
      href: '/tarot-draw' 
    },
    { 
      label: 'Oracle AI Chat', 
      href: 'https://ai-oracle-eight.vercel.app/access', 
      allowedRoles: ['supporter', 'admin'],
      isExternal: true
    }
  ];

  const navGroups: NavItem[] = [
    { 
      label: 'Coven Hub - NO LINK YET TODO', 
      href: '/', 
    }
  ];

  const navDBs: NavItem[] = [
    { 
      label: 'Crystals Database', 
      href: '/crystals-db', 
    },
    { 
      label: 'Herbs Database', 
      href: '/herbs-db', 
    },
    { 
      label: 'Runes Database', 
      href: '/runes-db', 
    },
    { 
      label: 'Tarot Database', 
      href: '/tarot-db', 
    }
  ];

  // Logic: Filter the list based on the current user's role
  const visibleItems = navHome.filter(item => {
    // 1. If no roles specified, show it
    if (!item.allowedRoles) return true;
    // 2. If roles specified, check if user has one of them
    return item.allowedRoles.includes(profile?.role || 'initiate');
  });

  // Logic: Filter the list based on the current user's role
  const visibleItems2 = navTools.filter(item => {
    // 1. If no roles specified, show it
    if (!item.allowedRoles) return true;
    // 2. If roles specified, check if user has one of them
    return item.allowedRoles.includes(profile?.role || 'initiate');
  });

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 shadow-lg">
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-lg">
        <h3 className="text-slate-500 text-xs uppercase tracking-widest font-bold mb-4">Tools</h3>
        <ul className="space-y-3">
          {visibleItems2.map((item) => (
            <li key={item.label} className="cursor-pointer text-slate-300 hover:text-purple-400 hover:pl-2 transition-all duration-200">
              {item.isExternal ? (
                // External Link
                <a href={item.href} target="_blank" rel="noopener noreferrer" className="block w-full h-full flex items-center gap-2">
                  {item.label} <span className="text-[10px] opacity-50">↗</span>
                </a>
              ) : (
                // Internal Next.js Link
                <Link href={item.href} className="block w-full h-full">
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-lg">
        <h3 className="text-slate-500 text-xs uppercase tracking-widest font-bold mb-4">Home</h3>
        <ul className="space-y-3">
          {visibleItems.map((item) => (
            <li key={item.label} className="cursor-pointer text-slate-300 hover:text-purple-400 hover:pl-2 transition-all duration-200">
              {item.isExternal ? (
                // External Link
                <a href={item.href} target="_blank" rel="noopener noreferrer" className="block w-full h-full flex items-center gap-2">
                  {item.label} <span className="text-[10px] opacity-50">↗</span>
                </a>
              ) : (
                // Internal Next.js Link
                <Link href={item.href} className="block w-full h-full">
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-lg">
        <h3 className="text-slate-500 text-xs uppercase tracking-widest font-bold mb-4">Knowledge - In Development</h3>
        <ul className="space-y-3">
          {navDBs.map((item) => (
            <li key={item.label} className="cursor-pointer text-slate-300 hover:text-purple-400 hover:pl-2 transition-all duration-200">
              {item.isExternal ? (
                // External Link
                <a href={item.href} target="_blank" rel="noopener noreferrer" className="block w-full h-full flex items-center gap-2">
                  {item.label} <span className="text-[10px] opacity-50">↗</span>
                </a>
              ) : (
                // Internal Next.js Link
                <Link href={item.href} className="block w-full h-full">
                  {item.label}
                </Link>
              )}
            </li>
          ))}

        </ul>
      </div>
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-lg">
        <h3 className="text-slate-500 text-xs uppercase tracking-widest font-bold mb-4">Covens - In Development</h3>
        <ul className="space-y-3">
          {navGroups.map((item) => (
            <li key={item.label} className="cursor-pointer text-slate-300 hover:text-purple-400 hover:pl-2 transition-all duration-200">
              {item.isExternal ? (
                // External Link
                <a href={item.href} target="_blank" rel="noopener noreferrer" className="block w-full h-full flex items-center gap-2">
                  {item.label} <span className="text-[10px] opacity-50">↗</span>
                </a>
              ) : (
                // Internal Next.js Link
                <Link href={item.href} className="block w-full h-full">
                  {item.label}
                </Link>
              )}
            </li>
          ))}

        </ul>
      </div>
    </div>
  );
};

export default SidebarLinks;