// app/actions/social.ts
'use server'

import { createClient } from '../utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Helper to get the current user safely
async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('User not authenticated')
  }
  return { user, supabase }
}

export async function toggleLike(postId: string) {
  const { user, supabase } = await getAuthenticatedUser()

  // 1. Check if the like already exists
  const { data: existingLike } = await supabase
    .from('likes')
    .select('*')
    .eq('user_id', user.id)
    .eq('post_id', postId)
    .single()

  if (existingLike) {
    // 2. Unlike: Delete the record
    const { error } = await supabase
      .from('likes')
      .delete()
      .match({ user_id: user.id, post_id: postId })

    if (error) throw new Error('Failed to unlike post')
  } else {
    // 3. Like: Insert the record
    const { error } = await supabase
      .from('likes')
      .insert({ user_id: user.id, post_id: postId })

    if (error) throw new Error('Failed to like post')
  }

  // 4. Revalidate the feed so the UI updates with the new counts
  // You might want to be specific here (e.g., '/feed' or the specific post page)
  revalidatePath('/') 
}

export async function addComment(postId: string, content: string) {
  const { user, supabase } = await getAuthenticatedUser()

  if (!content.trim()) {
    throw new Error('Comment cannot be empty')
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({
      user_id: user.id,
      post_id: postId,
      content: content.trim()
    })
    .select('*, profiles(username, avatar_url)') 
    .single()

  if (error) throw new Error(error.message)
  
  return data
}

export async function deleteComment(commentId: string) {
  const { user, supabase } = await getAuthenticatedUser()

  // We rely on RLS to ensure they only delete their own comment,
  // but explicit user_id matching here is a good double-check.
  const { error } = await supabase
    .from('comments')
    .delete()
    .match({ id: commentId, user_id: user.id })

  if (error) throw new Error('Failed to delete comment')

  revalidatePath('/')
}