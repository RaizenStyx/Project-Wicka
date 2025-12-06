'use server'

import { createClient } from '../utils/supabase/server'
import { revalidatePath } from 'next/cache'

// 1. Define the standard shape of your state
export type FormState = {
  message: string;  // We'll use this for general messages if needed
  error: string;    // If empty string, no error
  success: string;  // If empty string, no success
}

// 2. Apply this type to the prevState and the Return Promise
export async function createPost(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();

  // Default "empty" return state to keep TypeScript happy
  const emptyState: FormState = { message: '', error: '', success: '' }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { ...emptyState, error: 'You must be logged in to cast a spell.' }
  }

  const content = formData.get('content') as string
  if (!content || content.length < 1) {
    return { ...emptyState, error: 'Content cannot be empty' }
  }

  const { error } = await supabase.from('posts').insert({
    user_id: user.id,
    content: content,
  })

  if (error) {
    return { ...emptyState, error: 'Failed to cast intention.' }
  }

  revalidatePath('/')
  
  // Return success
  return { ...emptyState, success: 'Intention cast successfully.' }
}