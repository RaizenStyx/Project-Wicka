import { createClient } from '@/app/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Bell, Settings, Shield, Cannabis, Cat } from 'lucide-react';
import RoleBadge from '../ui/RoleBadge';
import WidgetFrame from './WidgetFrame';
import Link from 'next/link';
import Avatar from '../ui/Avatar';
import ResonanceLink from '../profile/ResonanceLink';


export default async function ProfileWidget() {

    const supabase = await createClient();

    // 1. Get the current User
    const { data: { user } } = await supabase.auth.getUser()
  
    // If not logged in, render a simplified "Guest" view or return null
    if (!user) {
        return (
            <WidgetFrame title="Identity">
                <div className="p-4 text-center">
                    <p className="text-slate-400 text-sm mb-4">Join the Coven to track your journey.</p>
                    <Link href="/login" className="block w-full py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-xs font-bold text-white transition-colors">
                        Sign In
                    </Link>
                </div>
            </WidgetFrame>
        )
    }

    // 2. Get Profile Data
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
    
    if (!profile) return notFound()

    // --- NEW: Calculate "Resonance" (Unread Interactions) ---
    const lastRead = profile.last_read_notifications || new Date(0).toISOString();

    // A. Count New Likes on MY posts
    const { count: newLikes } = await supabase
        .from('likes')
        .select('posts!inner(user_id)', { count: 'exact', head: true }) // !inner filters likes where post owner is me
        .eq('posts.user_id', user.id)
        .gt('created_at', lastRead);

    // B. Count New Comments on MY posts
    // (Exclude my own comments on my own posts if you want, but for now we count all)
    const { count: newComments } = await supabase
        .from('comments')
        .select('posts!inner(user_id)', { count: 'exact', head: true })
        .eq('posts.user_id', user.id)
        .neq('user_id', user.id) // Don't count my own comments
        .gt('created_at', lastRead);

    const resonanceCount = (newLikes || 0) + (newComments || 0);

    const firstLetter = profile?.handle?.[0]?.toUpperCase() ?? "U";

    return (
        <WidgetFrame title={
                <div className="flex items-center gap-2">
                    Identity
                    <RoleBadge role={profile.role || 'initiate'} />
                </div>
            }>
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg group">
                
                {/* --- 1. MINI BANNER --- */}
                {/* A decorative gradient background */}
                <div className="h-16 w-full bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 opacity-80" />

                {/* --- 2. AVATAR & INFO --- */}
                <div className="px-5 pb-5 relative">
                    
                    {/* Avatar - Negative margin pulls it up into the banner */}
                    <div className="-mt-8 mb-3 flex justify-between items-end">
                        <Link href={`/u/${profile.handle}`} className="block">
                            <Avatar 
                                url={profile?.avatar_url || undefined} 
                                alt={profile?.username || 'User Avatar'} 
                                size={64} 
                                fallback = {firstLetter || 'M'} 
                                className = " border-slate-700 group-hover:border-purple-500 transition-colors" 
                            />
                        </Link>
                        
                        {/* Quick Settings Link */}
                        <Link href="/settings" className="mb-1 text-slate-500 hover:text-white transition-colors">
                            <Settings className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Name & Role */}
                    <div className="mb-4">
                        <Link href={`/u/${profile.handle}`} className="hover:underline decoration-purple-500/50">
                            <h2 className="text-lg font-bold text-white font-serif leading-none">
                                {profile.username}
                            </h2>
                        </Link>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                            @{profile.handle}
                            {/* Optional Role Badge */}
                            {(profile.role === 'verified' || profile.role === 'supporter') && (
                                <Shield className="w-3 h-3 text-purple-400 fill-purple-400/20" />
                            )}
                            {(profile.role === 'Goddess') && (
                                <Cannabis className="w-3 h-3 text-purple-400 fill-purple-400/20" />
                            )}
                            {(profile.role === 'Princess') && (
                                <Cat className="w-3 h-3 text-purple-400 fill-purple-400/20" />
                            )}
                        </p>
                    </div>

                    {/* --- 3. NOTIFICATIONS / ACTIONS (Chat needs to be done) --- */}
                    <div className="border-t border-slate-800 pt-3 space-y-2">
                        <ResonanceLink count={resonanceCount} handle={profile.handle} />
                        {/* Example: Unread Messages */}
                        <Link href="/chat" className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors group/item">
                            <div className="relative">
                                <Bell className="w-4 h-4 text-slate-400 group-hover/item:text-purple-400" />
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-slate-300">New Whispers</p>
                            </div>
                            <span className="text-[10px] font-bold bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">2</span>
                        </Link>

                        {/* Profile Link */}
                        {/* <Link href={`/u/${profile.handle}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors group/item">
                            <User className="w-4 h-4 text-slate-400 group-hover/item:text-purple-400" />
                            <div className="flex-1">
                                <p className="text-xs text-slate-300">View Grimoire</p>
                            </div>
                        </Link> */}

                    </div>
                </div>
            </div>
        </WidgetFrame>
    );
};

