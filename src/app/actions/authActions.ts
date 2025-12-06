'use server'

import { createClient } from '../utils/supabase/server'
import { redirect } from 'next/navigation'

export async function updatePassword(prevState: any, formData: FormData) {
  const supabase = await createClient();

  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  
  if (!password || password.length < 6) {
    return { error: 'Password must be at least 6 characters' }
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' }
  }

  const { error } = await supabase.auth.updateUser({ password: password })

  if (error) {
    return { error: 'Failed to update password' }
  }

  return { success: 'Password updated successfully' }
}

export async function sendResetEmail() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user || !user.email) return { error: 'No email found for user.' }

  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback?next=/settings`,
  })

  if (error) {
    return { error: 'Could not send reset email.' }
  }

  return { success: 'Reset link sent to your email.' }
}

export async function signOut() {
  const supabase = await createClient();

  await supabase.auth.signOut()
  return redirect('/login')
}