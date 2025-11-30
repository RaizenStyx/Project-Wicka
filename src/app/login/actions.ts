// src/app/login/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr' 
import { cookies } from 'next/headers'

// 1. Define the Shape of your Auth State
export type AuthState = {
  error: string | null;
  success: string | null;
}

async function createClient() {
  const cookieStore = await cookies() 

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// 2. Fix Login Action
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