'use server'

import { createClient } from '../utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// 1. Define the Shape of your Auth State
export type AuthState = {
  error: string | null;
  success: string | null;
}

// 2. Login Action
export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    // Return error, success is null
    return { error: 'Invalid credentials.', success: null }
  }

  revalidatePath('/', 'layout')
  redirect('/')
  // Redirect throws an error internally, so we don't need to return anything here
}

export async function signup(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const username = formData.get('username') as string

  // Validation
  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.', success: null }
  }
  if (username.length < 3) {
    return { error: 'Username must be 3+ chars.', success: null }
  }

  // Generate Handle
  const randomString = Math.random().toString(36).substring(2, 6);
  const handle = username.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + randomString;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username,
        handle: handle
      }
    }
  })

  if (error) {
    return { error: error.message, success: null }
  }

  return { error: null, success: 'Check your email to confirm your account.' }
}

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