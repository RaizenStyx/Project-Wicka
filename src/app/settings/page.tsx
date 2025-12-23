import { createClient } from "../utils/supabase/server";
import { redirect } from "next/navigation";
import SettingsTabs from "@/components/settings/SettingsTabs";
import Link from "next/link";

interface SettingsPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const supabase = await createClient();
  
  // 1. Resolve the active tab from URL (e.g., /settings?tab=sanctuary)
  const resolvedParams = await searchParams; 
  const activeTab = resolvedParams.tab || "profile";

  // 2. Fetch User & Profile
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // 3. Prepare Initial Data for the form
  const initialData = {
    email: user.email || '',
    username: profile?.username || '',
    coven_name: profile?.coven_name || '',
    moon_phase: profile?.moon_phase || '',
    website: profile?.website || '',
    handle: profile?.handle || '',
    subtitle: profile?.subtitle
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        
        {/* Header Container using Flexbox */}
        <div className="flex items-center gap-4 mb-8">
            <Link 
              href={`/u/${initialData.handle || 'handle'}`} 
              className="text-sm text-purple-400 hover:underline shrink-0"
            >
              &larr; View Public Profile
            </Link>

            {/* Vertical Divider (Optional, looks nice) */}
            <span className="text-slate-700">|</span>

            <h1 className="font-serif text-3xl text-slate-200">
              Account Settings
            </h1>
        </div>

        {/* Pass everything down to the tabs component */}
        <SettingsTabs 
            user={user} 
            profile={profile} 
            initialData={initialData} 
            activeTab={activeTab} 
        />
      </div>
    </div>
  );
}