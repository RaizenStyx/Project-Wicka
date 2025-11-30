import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import PostCard from '@/components/PostCard'
import { signOut } from '@/app/actions/authActions'
import Link from 'next/link'

export default async function ProfilePage({ params }: { params: { username: string } }) {
  // Await params for Next.js 15
  const { username } = await params
  
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  // 1. Fetch the Profile to display
  // We search by the 'username' column, not the ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) return notFound() // Shows a 404 page if user doesn't exist

  // 2. Fetch the Posts for THIS user
  const { data: posts } = await supabase
    .from('posts')
    .select('*, profiles(username, role)')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })

  // 3. Check if the VIEWER is the OWNER
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  const isOwner = currentUser?.id === profile.id

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      
      {/* Top Nav (Simplified for this page) */}
      <nav className="border-b border-slate-800 bg-slate-950/80 p-4 sticky top-0 z-50 backdrop-blur">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-serif text-purple-400 font-bold">COVEN</Link>
          <div className="flex gap-4 text-sm">
             <Link href="/" className="hover:text-purple-400">Feed</Link>
             {/* If it's the owner, show Sign Out */}
             {isOwner && (
               <form action={signOut}>
                 <button className="text-slate-400 hover:text-red-400">Sign Out</button>
               </form>
             )}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* PROFILE HEADER (The "Wall" Header) */}
        <div className="relative mb-10">
          {/* Banner Image Placeholder */}
          <div className="h-48 w-full bg-gradient-to-r from-indigo-900 to-purple-900 rounded-xl mb-12 opacity-50"></div>
          
          <div className="absolute -bottom-6 left-8 flex items-end gap-6">
            {/* Avatar */}
            <div className="h-32 w-32 rounded-full bg-slate-900 border-4 border-slate-950 flex items-center justify-center text-4xl shadow-xl">
               {/* Use first letter of username as placeholder avatar */}
               <span className="text-purple-500 font-serif">{profile.username[0].toUpperCase()}</span>
            </div>
            
            <div className="mb-2">
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                {profile.username}
                {profile.role === 'verified' && (
                  <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full" title="Verified Witch">✓</span>
                )}
              </h1>
              <p className="text-slate-400">{profile.coven_name || 'Solitary Practitioner'}</p>
            </div>
          </div>

          {/* Action Buttons (Only if Owner) */}
          {isOwner && (
            <div className="absolute -bottom-4 right-4">
              <Link href="/settings">
                <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg border border-slate-700 text-sm font-medium transition-colors">
                  Edit Profile
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* FEED SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left: About Widget */}
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
                   <span className="text-slate-300">{new Date(profile.updated_at).toLocaleDateString()}</span>
                 </div>
               </div>
             </div>
          </div>

          {/* Right: Posts Feed */}
          <div className="md:col-span-2">
             <h3 className="text-slate-500 text-sm mb-4">Recent Spells & Intentions</h3>
             
             {posts?.map((post) => (
                <PostCard 
                  key={post.id}
                  username={post.profiles?.username}
                  timeAgo={new Date(post.created_at).toLocaleDateString()}
                  content={post.content}
                />
             ))}

             {posts?.length === 0 && (
               <div className="p-8 rounded-xl border border-slate-800 border-dashed text-center text-slate-600">
                 This grimoire is currently empty.
               </div>
             )}
          </div>

        </div>
      </main>
    </div>
  )
}