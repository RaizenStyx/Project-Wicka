import PostCard from "../components/ui/PostCard";
import ProfileInfo from "@/components/profile/ProfileInfo";
import ProfileWidget from "@/components/ui/FeedProfileWidget";
import { createClient } from "./utils/supabase/server";
import { redirect } from 'next/navigation'

export default async function Home() {

    const supabase = await createClient();
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
      profiles ( username, role, avatar_url )
    `)
    .order('created_at', { ascending: false })
    
  return (
  <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-purple-500 selection:text-white">

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 gap-8"> 
        
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
            {posts?.slice(0, 25).map((post) => (
             <PostCard 
               key={post.id}
               // We handle the case where profiles might be null (though it shouldn't be)
               username={post.profiles?.username || 'Unknown Witch'}
               avatar_url={post.profiles?.avatar_url || null}
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

      </main>
    </div>
  );
}