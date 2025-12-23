import PostCard from "@/components/feed/PostCard";
import ProfileInfo from "@/components/profile/ProfileInfo";
import FeedProfileWidget from "@/components/feed/FeedProfileWidget";
import { createClient } from "./utils/supabase/server";
import { redirect } from 'next/navigation'
import WelcomeBanner from "@/components/ui/WelcomeBanner";

// 1. Define the shape of the data we EXPECT from the query
interface UserProfileData {
  id: string;
  username: string | null;
  role: string | null;
  zodiac_signs: {
    name: string;
    planets: {
      name: string;
    } | { name: string }[] | null;
  } | { name: string; planets: any }[] | null;
}

// 2. Helper to safely extract single items from Supabase joins
function unwrap<T>(data: T | T[] | null): T | null {
  if (Array.isArray(data)) {
    return data.length > 0 ? data[0] : null;
  }
  return data;
}

export default async function Home() {

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')
    
    const { data: rawProfile, error } = await supabase
    .from('profiles')
    .select(`
      *,
      zodiac_signs (
        name,
        planets (
          name
        )
      )
    `)
    .eq('id', user.id)
    .single()

    if (error) console.error("Profile Fetch Error:", error);

    // 3. Safe Extraction Logic (No @ts-ignore needed)
    const profile = rawProfile as unknown as UserProfileData;
    const zodiacData = unwrap(profile?.zodiac_signs);
    const planetData = unwrap(zodiacData?.planets);

    const zodiacName = zodiacData?.name;
    const planetName = planetData?.name;
    
    // Fetch Posts
    const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      profiles ( username, role, avatar_url, handle, subtitle),
      likes (user_id),
      comments ( id )
    `)
    .order('created_at', { ascending: false })
    
  return (
  <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-purple-500 selection:text-white">

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 gap-8"> 
        
        <div className="space-y-6">

          <WelcomeBanner 
            username={profile?.username}
            role={profile?.role}
            sign={zodiacName}
            planet={planetName}
          />
          
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-lg">
            <ProfileInfo />
            {profile?.role !== 'initiate' && (
              <FeedProfileWidget />
            )}
          </div>

          {/* POSTS LOOP */}
            {posts?.slice(0, 25).map((post: any) => (
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
                currentUserRole={profile?.role || 'initiate'} 
                image_url={post.image_url}
                profileUserRole={post.profiles?.role || 'initiate'}
              />
            ))}

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