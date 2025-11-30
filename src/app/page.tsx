import PostCard from "../components/PostCard";
import WidgetSidebar from "@/components/widgets/WidgetSidebar";
import CreatePostForm from "@/components/CreatePostForm";
import SidebarLinks from "@/components/SidebarLinks";
import ProfileInfo from "@/components/ProfileInfo";
import ProfileWidget from "@/components/ProfileWidget";
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
// import Link from "next/link";

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

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 gap-8">
        
        {/* Left Sidebar: Navigation & Quick Links */}
        {/* <div className="hidden md:block col-span-1 space-y-6"> */}
           {/* <SidebarLinks profile={profile} />  */}
         
          {/* <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-lg">
            <h3 className="text-slate-500 text-xs uppercase tracking-widest font-bold mb-4">Coven Space? TODO</h3>
            <ul className="space-y-3">
                <li className="cursor-pointer text-slate-300 hover:text-purple-400 hover:pl-2 transition-all duration-200">
                {profile?.coven_name || 'Witch'}
                </li>
            </ul>
          </div> */}
        {/* </div> */}
        
        {/* Center: The Social Feed */}
        <div className="space-y-6">
          
          {/* Post Input Box Component */}
          {/* LOGIC: Only show Create Form if NOT an initiate */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-lg">
          <ProfileInfo />
          {profile?.role !== 'initiate' && (
            <ProfileWidget />
          )}
          </div>
          
          
            
            
          
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
               currentUserRole={profile?.role} 
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
        {/* <WidgetSidebar /> */}
      </main>
    </div>
  );
}