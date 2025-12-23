'use client'

import { useState } from 'react'
import { updateProfile } from '@/app/actions/profile-actions'
import { Pencil, Save, X, Sparkles, Loader2 } from 'lucide-react'
import { clsx } from 'clsx'

interface Profile {
  id: string
  username: string
  bio: string | null
  moon_phase: string | null
  website: string | null
  created_at: string
  
  // Update: Nested Object, not a string
  zodiac_signs: {
    name: string
    symbol: string
    // Optional: Add planets if you are fetching the ruling planet info too
    planets?: {
      name: string
      symbol: string
    } | null
  } | null
}

export default function ProfileInfoWidget({ profile, isOwner }: { profile: Profile, isOwner: boolean }) {
  const [activeTab, setActiveTab] = useState<'bio' | 'stats'>('bio')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Local state for bio to show updates immediately
  const [bioText, setBioText] = useState(profile.bio || '')

  const handleSave = async (formData: FormData) => {
    setLoading(true)
    const result = await updateProfile(null, formData)
    setLoading(false)
    
    if (result?.error) {
        alert("Failed to update bio.")
    } else {
        setIsEditing(false)
    }
  }

  const dateJoined = new Date(profile.created_at).toLocaleDateString();

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col min-h-[250px]">
      
      {/* --- TABS HEADER --- */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('bio')}
          className={clsx(
            "flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer",
            activeTab === 'bio' ? "bg-slate-800 text-purple-400" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
          )}
        >
            Biography
        </button>
        <div className="w-[1px] bg-slate-800"></div>
        <button
          onClick={() => setActiveTab('stats')}
          className={clsx(
            "flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer",
            activeTab === 'stats' ? "bg-slate-800 text-purple-400" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
          )}
        >
            Grimoire Info
        </button>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="p-6 flex-1 flex flex-col">
        
        {/* TAB: BIO */}
        {activeTab === 'bio' && (
           <div className="flex-1 relative group">
              {isEditing ? (
                 <form action={handleSave} className="flex flex-col h-full gap-3">
                    <textarea 
                        name="bio"
                        value={bioText}
                        onChange={(e) => setBioText(e.target.value)}
                        className="w-full flex-1 bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-300 focus:border-purple-500 outline-none resize-none font-serif leading-relaxed"
                        placeholder="Tell the coven about your path..."
                    />
                    <div className="flex justify-end gap-2">
                        <button 
                            type="button" 
                            onClick={() => setIsEditing(false)}
                            className="p-2 text-slate-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-500 transition-colors cursor-pointer"
                        >
                            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                            Save
                        </button>
                    </div>
                 </form>
              ) : (
                 <>
                    {bioText ? (
                        <p className="text-slate-300 text-sm leading-7 font-serif whitespace-pre-wrap">
                            {bioText}
                        </p>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 italic text-sm gap-2 min-h-[100px]">
                            <Sparkles className="w-5 h-5 opacity-50" />
                            <span>This page is yet to be written...</span>
                        </div>
                    )}

                    {/* Edit Button (Owner Only) */}
                    {isOwner && (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="absolute -top-2 -right-2 p-2 text-slate-600 hover:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200"
                            title="Edit Bio"
                        >
                            <Pencil className="w-3 h-3" />
                        </button>
                    )}
                 </>
              )}
           </div>
        )}

        {/* TAB: STATS (The original info) */}
        {activeTab === 'stats' && (
           <div className="space-y-4 animate-in fade-in duration-300">
                <div className="space-y-3 text-sm">

                    {profile?.zodiac_signs && (
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-500">Zodiac</span>
                    <span className="text-teal-300">
                    {profile.zodiac_signs.symbol}
                    {profile.zodiac_signs.name}
                    </span>
                    </div>
                    )}
                    {profile?.zodiac_signs?.planets && (
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-500">Ruling Planet</span>
                    <span className="text-purple-300">
                        {profile.zodiac_signs.planets.symbol}&nbsp;
                        {profile.zodiac_signs.planets.name}
                        </span>
                    </div>
                    )}
                    

                    {/* Check if zodiac data exists before rendering */}
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-500">Affinity</span>
                    <span className="text-purple-300">{profile.moon_phase || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-500">Website</span>
                    {profile.website ? (
                        <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:underline truncate max-w-[120px]"
                        >
                        {profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                        </a>
                    ) : (
                        <span className="text-slate-600">-</span>
                    )}
                    </div>
                    <div className="flex justify-between border-slate-800 pb-2">
                    <span className="text-slate-500 block mb-1">Joined</span>
                    <span className="text-slate-300">{dateJoined}</span>
                    </div>
                </div>
           </div>
        )}

      </div>
    </div>
  )
}