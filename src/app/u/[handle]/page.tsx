import { createClient } from '@/app/utils/supabase/server'
import { notFound } from 'next/navigation'
import PostCard from '@/components/ui/PostCard'
import { Cannabis, Cat, Shield } from 'lucide-react'
import SpellCard from '@/components/spellbook/SpellCard'
import Link from 'next/link'
import { signOut } from '@/app/actions/authActions'
import { clsx } from 'clsx'
import ProfileHeader from '@/components/profile/ProfileHeader'

export default async function ProfilePage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ handle: string }>,
  searchParams: Promise<{ view?: string }> 
}) {
  
  const { handle } = await params
  const { view } = await searchParams
  
  // Default to 'posts' if no view is specified
  const currentView = view === 'spells' ? 'spells' : 'posts';

  const supabase = await createClient();

  // 1. Fetch the Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('handle', handle)
    .single()

  if (!profile) return notFound()

  // 2. DATA FETCHING SPLIT
  // We only fetch what we need based on 'currentView'
  
  let posts = null;
  let spells = null;

  if (currentView === 'posts') {
    const { data } = await supabase
      .from('posts')
      .select('*, profiles(username, role, avatar_url)')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });
    posts = data;
  } else if (currentView === 'spells') {
    const { data } = await supabase
      .from('spells')
      .select('*')
      .eq('user_id', profile.id)
      .eq('is_private', false) // IMPORTANT: Only show public spells
      .order('created_at', { ascending: false });
    spells = data;
  }

  // 3. Check Ownership & Roles
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  const isOwner = currentUser?.id === profile.id
  const isSupporter = ['supporter', 'admin', 'verified', 'Goddess'].includes(profile.role);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* --- HEADER SECTION --- */}
        <div className="relative mb-10">
          <div className="h-48 w-full bg-gradient-to-r from-indigo-900 to-purple-900 rounded-xl mb-12 opacity-50"></div>

          {/* Action Buttons */}
          {isOwner && (
            <div className="absolute -top-4 left-4">
              <Link href="/settings">
                <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg border border-slate-700 text-sm font-medium transition-colors cursor-pointer">
                  Edit Profile
                </button>
              </Link>
            </div>
          )}

          {isOwner && (
            <div className="absolute -top-4 right-4">
             <form action={signOut}>
                <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg border border-slate-700 block w-full text-left text-sm text-red-400 hover:text-red-300 cursor-pointer">Sign Out</button>
             </form>
             </div>
          )}
          
          <div className="absolute -bottom-6 left-8 flex items-end gap-6">
            
            <ProfileHeader profile={profile} isOwnProfile={isOwner} />
            
            <div className="mb-2">
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                {profile.username}
                {isSupporter && (
                  <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full" title="Verified Witch">✓</span>
                )}
              </h1>
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
          </div>
        </div>

        {/* --- MAIN CONTENT GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* LEFT COL: Info Widget */}
          <div className="md:col-span-1 space-y-6">
             <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
               <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-4 font-bold">Grimoire Info</h3>
               <div className="space-y-3 text-sm">
                 <div className="flex justify-between border-b border-slate-800 pb-2">
                   <span className="text-slate-500">Affinity</span>
                   <span className="text-purple-300">{profile.moon_phase || 'Unknown'}</span>
                 </div>
                 <div className="flex justify-between border-b border-slate-800 pb-2">
                   <span className="text-slate-500">Website</span>
                   {profile.website ? (
                     <a href={profile.website} target="_blank" className="text-purple-400 hover:underline truncate max-w-[120px]">
                       Link
                     </a>
                   ) : (
                     <span className="text-slate-600">-</span>
                   )}
                 </div>
                 <div className="pt-2">
                   <span className="text-slate-500 block mb-1">Joined</span>
                   <span className="text-slate-300">{new Date(profile.updated_at || profile.created_at).toLocaleDateString()}</span>
                 </div>
               </div>
             </div>
             <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
               <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-4 font-bold">Coven Info</h3>
               <div className="space-y-3 text-sm">
                 <div className="flex justify-between pb-2">
                   <span className="text-slate-500">Coven:</span>
                   <p className="text-slate-400">{profile.coven_name || 'Solitary Practitioner'}</p>
                  </div>
               </div>
             </div>
          </div>

          {/* RIGHT COL: Feed/Spells */}
          <div className="md:col-span-2">
             
             {/* --- TABS NAVIGATION --- */}
             <div className="flex items-center gap-6 mb-6 border-b border-slate-800">
                <Link 
                  href={`/u/${handle}`} // Default link (Posts)
                  scroll={false} // Prevents scroll jump
                  className={clsx(
                    "pb-3 text-sm font-medium transition-colors border-b-2",
                    currentView === 'posts' 
                      ? "text-white border-purple-500" 
                      : "text-slate-500 border-transparent hover:text-slate-300"
                  )}
                >
                  Recent Posts
                </Link>

                <Link 
                  href={`/u/${handle}?view=spells`} 
                  scroll={false}
                  className={clsx(
                    "pb-3 text-sm font-medium transition-colors border-b-2",
                    currentView === 'spells' 
                      ? "text-white border-purple-500" 
                      : "text-slate-500 border-transparent hover:text-slate-300"
                  )}
                >
                  Public Grimoire
                </Link>
             </div>
             
             {/* --- CONTENT AREA --- */}

             {/* VIEW: POSTS */}
             {currentView === 'posts' && (
               <>
                 {posts?.map((post) => (
                    <PostCard 
                      key={post.id}
                      username={post.profiles?.username || 'Unknown Witch'}
                      avatar_url={post.profiles?.avatar_url || null}
                      timeAgo={new Date(post.created_at).toLocaleDateString()} 
                      content={post.content}
                      currentUserRole={profile?.role} 
                    />
                 ))}
                 {posts?.length === 0 && (
                   <EmptyState text="This witch hasn't posted anything yet." />
                 )}
               </>
             )}

             {/* VIEW: SPELLS */}
             {currentView === 'spells' && (
               <div className="space-y-4">
                 {spells?.map((spell) => (
                   <SpellCard 
                     key={spell.id} 
                     spell={spell} 
                     readOnly={!isOwner} 
                   />
                 ))}
                 {spells?.length === 0 && (
                   <EmptyState text="This grimoire is private or empty." />
                 )}
               </div>
             )}

          </div>

        </div>
      </main>
    </div>
  )
}

// Simple Helper for empty states
function EmptyState({ text }: { text: string }) {
  return (
    <div className="p-12 rounded-xl border border-slate-800 border-dashed text-center">
       <p className="text-slate-600 italic">{text}</p>
    </div>
  )
}