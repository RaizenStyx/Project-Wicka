'use server'

import { createClient } from '../utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type FormState = {
  message: string;
  error: string;
  success: string;
}

export async function createPost(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();
  const emptyState: FormState = { message: '', error: '', success: '' }

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { ...emptyState, error: 'You must be logged in to cast a spell.' }
  }

  // 2. Content Validation
  const content = formData.get('content') as string
  const imageFile = formData.get('image') as File | null 

  if (!content || content.length < 1) {
    return { ...emptyState, error: 'Content cannot be empty' }
  }

  // 3. Image Upload Logic
  let imageUrl: string | null = null;

  if (imageFile && imageFile.size > 0 && imageFile.name !== 'undefined') {
    // Basic validation
    if (!imageFile.type.startsWith('image/')) {
        return { ...emptyState, error: 'Only images may be offered to the feed.' }
    }
    
    // Create unique path: userId/timestamp-random.ext
    const fileExt = imageFile.name.split('.').pop()
    const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`

    // Upload
    const { error: uploadError } = await supabase.storage
      .from('post_images') 
      .upload(filePath, imageFile)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { ...emptyState, error: 'Failed to upload the image.' }
    }

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('post_images')
      .getPublicUrl(filePath)
    
    imageUrl = publicUrl
  }

  // 4. Insert into DB
  const { error } = await supabase.from('posts').insert({
    user_id: user.id,
    content: content,
    image_url: imageUrl, 
  })

  if (error) {
    return { ...emptyState, error: 'Failed to cast intention.' }
  }

  revalidatePath('/')
  
  return { ...emptyState, success: 'Intention cast successfully.' }
}