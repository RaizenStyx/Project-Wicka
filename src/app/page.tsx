import PostCard from "../components/ui/PostCard";
import ProfileInfo from "@/components/profile/ProfileInfo";
import ProfileWidget from "@/components/ui/FeedProfileWidget";
import { createClient } from "./utils/supabase/server";
import { redirect } from 'next/navigation'
import WelcomeBanner from "@/components/ui/WelcomeBanner";

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
      profiles ( username, role, avatar_url, handle, subtitle ),
      likes (user_id),
      comments ( id )
    `)
    .order('created_at', { ascending: false })
    
  return (
  <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-purple-500 selection:text-white">

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 gap-8"> 
        
        {/* Center: The Social Feed */}
        <div className="space-y-6">
          
          {/* Post Input Box Component */}
          {/* LOGIC: Only show Create Form if NOT an initiate */}
          <WelcomeBanner />
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-lg">
          <ProfileInfo />
          {profile?.role !== 'initiate' && (
            <ProfileWidget />
          )}
          </div>

          {/* POSTS LOOP */}
            {posts?.slice(0, 25).map((post) => (
              <PostCard 
                key={post.id}
                id={post.id} 
                currentUserId={user.id} 
                likes={post.likes} 
                commentsCount={post.comments ? post.comments.length : 0}
                username={post.profiles?.username || 'Unknown Witch'}
                handle={post.profiles?.handle || ''}
                subtitle={post.profiles?.subtitle}
                avatar_url={post.profiles?.avatar_url || null}
                timeAgo={new Date(post.created_at).toLocaleDateString()} 
                content={post.content}
                currentUserRole={profile?.role} 
                image_url={post.image_url}
                profileUserRole={post.profiles?.role || 'initiate'}
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