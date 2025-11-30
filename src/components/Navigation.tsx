'use client';

import React from "react";
import Link from "next/link";
import { signOut } from '@/app/actions/authActions'
import { useState } from "react";

type Profile = {
    username?: string;
    handle?: string;
    avatar_url?: string | null;
    id: string;
};
type NavigationProps = {
    profile?: Profile | null;
};

const Navigation: React.FC<NavigationProps> = ({ profile }) => {
    const username = profile?.handle ?? "profile";
    const firstLetter = profile?.handle?.[0]?.toUpperCase() ?? "U";
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                {/* 1. Title */}
                <div className="text-2xl font-serif text-purple-400 tracking-wider font-bold">
                    COVEN
                </div>

                {/* 2. Old code for other nav items that may be potentially added */}
                {/* <div className="hidden md:flex space-x-6 text-sm font-medium text-slate-400">
                    <button className="hover:text-purple-300 transition-colors" type="button">
                        Grimoire
                    </button>
                    <button className="hover:text-purple-300 transition-colors" type="button">
                        Gatherings
                    </button>
                </div> */}

                {/* 2. Welcome */}
                <div className="text-sm text-slate-400 hidden md:block">
                    Welcome, <span className="text-purple-400 font-medium">{profile?.username || 'Witch'}</span>
                </div>



                {/* 3. The Profile Avatar/Button */}
                <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center focus:outline-none transition-transform active:scale-95"
                >
                <div>
                    {profile?.avatar_url ? (
                        <div className="h-10 w-10 rounded-full bg-slate-800 border border-purple-500/30 overflow-hidden">
                            <img
                                src={profile.avatar_url}
                                alt={`${username} avatar`}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="h-10 w-10 rounded-full bg-indigo-900 flex items-center justify-center text-indigo-400 font-bold">
                            {firstLetter}
                        </div>
                    )}
                </div>
            </button>
            {/* 3. The Dropdown Menu */}
            {/* We only render this div if isOpen is true */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-slate-700 z-50">
                <div className="py-1">
                    
                    {/* Settings Link */}
                    <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-purple-400"
                    onClick={() => setIsOpen(false)} // Close menu when clicked
                    >
                    Settings
                    </Link>

                    {/* Divider */}
                    <div className="border-t border-slate-700 my-1"></div>

                    {/* Sign Out Button */}
                    <form action={signOut}>
                        <button className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 hover:text-red-300">Sign Out</button>
                    </form>
                </div>
            </div>
            )}
            </div>
        </div>
    </nav>
    );
};

export default Navigation;