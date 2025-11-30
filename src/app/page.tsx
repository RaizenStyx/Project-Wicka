import PostCard from "../components/PostCard";
import WidgetSidebar from "@/components/widgets/WidgetSidebar";
import CreatePostForm from "@/components/CreatePostForm";
import Link from "next/link";
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default async function Home() {
   const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() }
        }
      }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

    // Fetch Posts (and join with the Profiles table to get the username/avatar!)
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      profiles ( username, role )
    `)
    .order('created_at', { ascending: false })
    
  return (
  <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-purple-500 selection:text-white">
      
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-2xl font-serif text-purple-400 tracking-wider font-bold">
            COVEN 
          </div>
          <div className="hidden md:flex space-x-6 text-sm font-medium text-slate-400">
            <button className="hover:text-purple-300 transition-colors">Grimoire</button>
            <button className="hover:text-purple-300 transition-colors">Gatherings</button>
            <Link href={`/u/${profile?.username || 'profile'}`} className="hover:text-purple-300 transition-colors">Profile</Link>
          </div>
          {profile.avatar_url ? (
          <div className="h-8 w-8 rounded-full bg-slate-800 border border-purple-500/30">
            <img 
              src={profile.avatar_url}
              alt="User Avatar"
              className="h-10 w-10 rounded-full border border-purple-500/30"
            />
          </div>
          ) : (
            // Placeholder Avatar with first letter of username
            <div className="h-10 w-10 rounded-full bg-indigo-900 flex items-center justify-center text-indigo-400 font-bold">
              {profile.username[0]} {/* Grab first letter of username */}
            </div>
          )}
          
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Left Sidebar: Navigation & Quick Links */}
        <div className="hidden md:block col-span-1 space-y-6">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-lg">
            <h3 className="text-slate-500 text-xs uppercase tracking-widest font-bold mb-4">Navigation</h3>
            <ul className="space-y-3">
              {['Home Altar', 'Spellbook', 'Crystal Log', 'Tarot Daily'].map((item) => (
                <li key={item} className="cursor-pointer text-slate-300 hover:text-purple-400 hover:pl-2 transition-all duration-200">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-lg">
            <h3 className="text-slate-500 text-xs uppercase tracking-widest font-bold mb-4">Coven Space? TODO</h3>
            <ul className="space-y-3">
                <li className="cursor-pointer text-slate-300 hover:text-purple-400 hover:pl-2 transition-all duration-200">
                {profile?.coven_name || 'Witch'}
                </li>
            </ul>
          </div>
        </div>

        {/* Center: The Social Feed */}
        {/* <div className="col-span-1 md:col-span-2 space-y-6"> */}
          {/* Post Input Box */}
          {/* <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-lg">
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-slate-800 shrink-0"></div>
              <input 
                type="text" 
                placeholder="Share your intention..." 
                className="w-full bg-transparent border-none focus:ring-0 text-slate-200 placeholder-slate-600"
              />
            </div>
            <div className="mt-4 flex justify-between items-center border-t border-slate-800 pt-3">
              <div className="flex gap-4 text-xs text-purple-400/70">
                <span>+ Image</span>
                <span>+ Sigil</span>
              </div>
              <button className="px-4 py-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)]">
                Cast
              </button>
            </div>
          </div> */}

          {/* Sample Feed Post 1 */}
          {/* <PostCard 
            username="Luna_Weaver"
            timeAgo="2 hours ago"
            moonPhase="Waning Gibbous"
            content="Just finished drying my lavender bundles for the upcoming new moon ritual. The scent in my kitchen is absolutely divine right now. 🌿✨"
            hasImage={true}
          />

          <PostCard 
            username="RunesAndRoots"
            timeAgo="4 hours ago"
            content="Does anyone have a good resource for identifying local mosses? I found some beautiful specimens on my walk today but I want to be respectful before harvesting."
            hasImage={false}
          />

          <PostCard 
            username="StarGazer99"
            timeAgo="5 hours ago"
            moonPhase="Waning Gibbous"
            content="Mercury is entering retrograde soon... remember to back up your grimoires and double-check your communications!"
          /> */}

        {/* </div> */}

        {/* Center: The Social Feed */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          
          {/* Post Input Box Component */}
          <CreatePostForm />

          {/* REAL POSTS LOOP */}
          {posts?.map((post) => (
             <PostCard 
               key={post.id}
               // We handle the case where profiles might be null (though it shouldn't be)
               username={post.profiles?.username || 'Unknown Witch'}
               // Simple math to show time (or use a library like 'date-fns' later)
               timeAgo={new Date(post.created_at).toLocaleDateString()} 
               content={post.content}
               // Pass the role down if you want to show a badge!
               // userRole={post.profiles?.role} 
             />
          ))}

          {/* Show a message if no posts exist */}
          {(!posts || posts.length === 0) && (
            <div className="text-center text-slate-600 py-10">
              The air is still. Be the first to cast an intention.
            </div>
          )}

        </div>

        {/* Right Sidebar: Widgets */}
        <WidgetSidebar />
      </main>
    </div>
  );
}