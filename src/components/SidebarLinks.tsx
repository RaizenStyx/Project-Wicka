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
  userRole: string;
}

const SidebarLinks = ({ userRole }: SidebarLinksProps) => {
  
  // THE CONFIGURATION OBJECT
  const navItems: NavItem[] = [
    { 
      label: 'Join the Coven', 
      href: '/join', 
      allowedRoles: ['initiate']
    },
    {
      label: 'Chat - NO LINK YET TODO',
      href: '/',
    },
    { 
      label: 'Home Altar - NO LINK YET TODO', 
      href: '/' 
    },
    { 
      label: 'Spellbook - NO LINK YET TODO', 
      href: '/' 
    },
    { 
      label: 'Crystal Log - NO LINK YET TODO', 
      href: '/' 
    },
    { 
      label: 'Tarot Daily - NO LINK YET TODO', 
      href: '/' 
    },
    { 
      label: 'Oracle AI Chat', 
      href: 'https://ai-oracle-eight.vercel.app/access', 
      allowedRoles: ['supporter', 'admin'],
      isExternal: true
    }
  ];

  // Logic: Filter the list based on the current user's role
  const visibleItems = navItems.filter(item => {
    // 1. If no roles specified, show it
    if (!item.allowedRoles) return true;
    // 2. If roles specified, check if user has one of them
    return item.allowedRoles.includes(userRole);
  });

  return (
    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-lg">
      <h3 className="text-slate-500 text-xs uppercase tracking-widest font-bold mb-4">Navigation</h3>
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
  );
};

export default SidebarLinks;