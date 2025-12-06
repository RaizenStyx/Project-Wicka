'use server'

import { createClient } from '../utils/supabase/server'

// 1. Define the shape of the data we expect
export type MemberProfile = {
  id: string
  username: string | null
  handle: string | null
  role: string | null
  coven_name: string | null
  updated_at: string
  // Add avatar_url if you have it in your DB Schema
  avatar_url: string | null 
}

export async function getMembers(): Promise<MemberProfile[]> {
  // 1. Create Supabase Client with cookies for SSR
  const supabase = await createClient();

 const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, username, handle, role, coven_name, updated_at, avatar_url') // Be specific with columns
    .order('updated_at', { ascending: false })
    .limit(50)

  // 2. If error, log it but return empty array so UI doesn't break
  if (error) {
    console.error("Error fetching coven members:", error)
    return [] 
  }

  // 3. Ensure we return an array, even if profiles is null
  return (profiles as MemberProfile[]) || []
}