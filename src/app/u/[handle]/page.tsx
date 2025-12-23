import { createClient } from '@/app/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Cannabis, Cat, Shield, ChevronLeft, Check } from 'lucide-react'
import { signOut } from '@/app/actions/auth-actions'
import { clsx } from 'clsx'
import RoleBadge from '@/components/ui/RoleBadge'
import ProfileInfoWidget from '@/components/profile/ProfileInfoWidget'
import ProfileHeader from '@/components/profile/ProfileHeader'
import PostCard from '@/components/feed/PostCard'
import SpellCard from '@/components/spellbook/SpellCard'
import Link from 'next/link'
import { Metadata } from 'next'

// 3. Metadata
export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  const title = handle.split('-').slice(0, -1).map(word => word.charAt(0).toUpperCase() + word.slice(1));
  return {
    title: `${title} | Public Profile`,
    description: `Discover the information of ${title}.`,
  };
}

export default async function ProfilePage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ handle: string }>,
  searchParams: Promise<{ view?: string; from?: string }> 
}) {
  
  const { handle } = await params
  const { view, from } = await searchParams
  
  // Default to 'posts' if no view is specified
  const currentView = view === 'spells' ? 'spells' : 'posts';

  const supabase = await createClient();

  // 1. Get the Current Logged-in User (The Viewer)
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) redirect('/login')

  // 2. Fetch the Viewer's Role (Needed for PostCard permissions)
  const { data: viewerProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', currentUser.id)
    .single()

  // 3. Fetch the TARGET Profile (Based on the Handle in the URL)
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      zodiac_signs (
        name,
        symbol,
        planets (
        name,
        symbol
        )
      )
    `)
    .eq('handle', handle) 
    .single()

  if (!profile) return notFound()

  // 4. DATA FETCHING SPLIT
  let posts = null;
  let spells = null;

  if (currentView === 'posts') {
    const { data } = await supabase
      .from('posts')
      .select('*, profiles(username, role, avatar_url, subtitle), likes (user_id), comments ( id )')
      .eq('user_id', profile.id) 
      .order('created_at', { ascending: false });
    posts = data;
  } else if (currentView === 'spells') {
    const { data } = await supabase
      .from('spells')
      .select('*')
      .eq('user_id', profile.id)
      .eq('is_private', false)
      .order('created_at', { ascending: false });
    spells = data;
  }

  // 5. Check Ownership
  const isOwner = currentUser.id === profile.id
  const isSupporter = ['supporter', 'admin', 'verified', 'Goddess', 'Princess'].includes(profile.role);

  const showBackButton = from === 'members';
  
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* --- HEADER SECTION --- */}
        <div className="relative mb-10">
          <div className="h-48 w-full bg-gradient-to-r from-indigo-900 to-purple-900 rounded-xl mb-12 opacity-50"></div>

          {/* Return to member page (Left) */}
          {showBackButton && (
          <div className="absolute -top-4 left-4">
            <Link 
              href="/members" 
              className="
                group flex items-center gap-2 
                bg-slate-800/50 hover:bg-slate-800 
                border border-slate-700/50 hover:border-purple-500/50
                px-4 py-2 rounded-lg 
                text-sm font-medium text-slate-400 hover:text-purple-400 
                transition-all duration-200
              "
            >
              <ChevronLeft 
                size={16} 
                className="group-hover:-translate-x-1 transition-transform duration-200" 
              />
              <span>Members</span>
            </Link>  
          </div>
          )}
          
          {/* Action Buttons (Right) */}
            <div className="absolute -top-4 right-4 flex items-center gap-3">
              <div className="hidden sm:block">
                <RoleBadge role={profile?.role || 'initiate'} />
              </div>
             {isOwner && (
              <>
              {/* Only show these on desktop */}
              <Link 
               href="/settings"
               className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg border border-slate-700 text-sm font-medium transition-colors cursor-pointer hidden sm:block"
             >
                Edit Profile
             </Link>

             <form action={signOut} className='hidden sm:block'>
                <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg border border-slate-700 text-sm font-medium text-red-400 hover:text-red-300 transition-colors cursor-pointer">
                  Sign Out
                </button>
             </form>
             
             {/* Only show these on mobile */}
             <div className='md:hidden flex flex-col items-end gap-2.5'>
               <Link 
                href="/settings"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg border border-slate-700 text-sm font-medium transition-colors cursor-pointer"
              >
                  Edit Profile
              </Link>

              <form action={signOut}>
                  <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg border border-slate-700 text-sm font-medium text-red-400 hover:text-red-300 transition-colors cursor-pointer">
                    Sign Out
                  </button>
              </form>
             </div>
             </>
             )}
            </div>
          
          
          <div className="absolute -bottom-6 md:left-16 flex items-end gap-6">
  
            {/* Avatar Section */}
            <ProfileHeader profile={profile} isOwnProfile={isOwner} />
            
            {/* Text Info Section */}
            <div className="mb-1 flex flex-col">
              {/* Mobile Only Badge  (If screen is too small, badge goes above username) */}
              <div className="sm:hidden w-min">
                <RoleBadge role={profile?.role || 'initiate'} />
              </div>

              {/* ROW 1: Identity (Username + Subtitle) */}
              <div className="flex items-baseline gap-3">
                
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                  {profile.username}
                  {isSupporter && (
                    <span 
                      className="flex items-center justify-center w-5 h-5 bg-purple-500 rounded-full" 
                      title="Verified Witch"
                    >
                      <Check size={12} className="text-white stroke-[4]" />
                    </span>
                  )}
                </h1>

                {/* Subtitle - Styled as a sleek tag next to the name */}
                {profile.subtitle && (
                  <span className="hidden sm:block text-purple-400 text-sm font-bold uppercase tracking-wider border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 rounded">
                    {profile.subtitle}
                  </span>
                )}
              </div>
              {/* Mobile Only Subtitle (If screen is too small, subtitle drops below) */}
              {profile.subtitle && (
                  <p className="sm:hidden text-purple-400 text-xs font-bold uppercase tracking-wider mt-1">
                    {profile.subtitle}
                  </p>
              )}

              {/* ROW 2: Technical (Handle + Role/Badges) */}
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  @{profile.handle}
                  {/* Role Badge */}
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
             <ProfileInfoWidget profile={profile} isOwner={isOwner} />
             
             {/* Coven Widget */}
             <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
               <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-4 font-bold">Coven Info</h3>
               <div className="space-y-3 text-sm">
                 <div className="flex justify-between pb-2">
                   <span className="text-slate-500">Coven:</span>
                   <p className="text-slate-400">{profile.coven_name || 'Solitary Practitioner'}</p>
                  </div>
               </div>
             </div>

            {/* Placeholder Widget */}
             <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
               <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-4 font-bold">Astrology Info</h3>
               <div className="space-y-3 text-sm">
                 <div className="flex justify-between pb-2">
                   <span className="text-slate-500">Placeholder:</span>
                   <p className="text-slate-400">???</p>
                  </div>
               </div>
             </div>

              {/* Placeholder Widget */}
             <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
               <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-4 font-bold">Tarot Info</h3>
               <div className="space-y-3 text-sm">
                 <div className="flex justify-between pb-2">
                   <span className="text-slate-500">Placeholder:</span>
                   <p className="text-slate-400">Place daily tarot card here?</p>
                  </div>
               </div>
             </div>

            {/* Placeholder Widget */}
             <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
               <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-4 font-bold">Any Info</h3>
               <div className="space-y-3 text-sm">
                 <div className="flex justify-between pb-2">
                   <span className="text-slate-500">Placeholder:</span>
                   <p className="text-slate-400">Let me know what would be a good idea to use for these side widgets on the user's public profile!</p>
                  </div>
               </div>
             </div>

          </div>

          {/* RIGHT COL: Feed/Spells */}
          <div className="md:col-span-2">
              
              {/* --- TABS NAVIGATION --- */}
              <div className="flex items-center gap-6 mb-6 border-b border-slate-800">
                 <Link 
                   href={`/u/${handle}`} 
                   scroll={false} 
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
                       id={post.id} 
                       currentUserId={currentUser.id} 
                       likes={post.likes} 
                       commentsCount={post.comments ? post.comments.length : 0}
                       username={post.profiles?.username || 'Unknown Witch'}
                       handle={""}
                       subtitle={""}
                       avatar_url={post.profiles?.avatar_url || null}
                       timeAgo={new Date(post.created_at).toLocaleDateString()} 
                       content={post.content}
                       currentUserRole={viewerProfile?.role} 
                       image_url={post.image_url}
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

function EmptyState({ text }: { text: string }) {
  return (
    <div className="p-12 rounded-xl border border-slate-800 border-dashed text-center">
       <p className="text-slate-600 italic">{text}</p>
    </div>
  )
}