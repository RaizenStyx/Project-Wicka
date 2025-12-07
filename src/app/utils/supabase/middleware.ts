import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // 1. Create an initial response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Setup Supabase Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. Get User (SAFELY)
  // We wrap this in try/catch so network glitches don't crash the whole app
  let user = null;
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (error) {
    console.error("Middleware Auth Error:", error)
    // If auth fails, we assume the user is logged out and continue
  }

  // 4. Protected Routes Logic
  const path = request.nextUrl.pathname
  
  // Debug Log 
  // console.log(`Middleware checking: ${path}, User found: ${!!user}`)

  // A. Public Paths - Add any other public paths here!
  const isPublicPath = 
    path === '/login' || 
    path.startsWith('/login/') || 
    path.startsWith('/auth') || 
    path.startsWith('/public'); // Example: if you have a public landing page

  // B. Redirect Unauthenticated Users to Login
  if (!user && !isPublicPath) {
     const url = request.nextUrl.clone()
     url.pathname = '/login'
     return NextResponse.redirect(url)
  }

  // C. Redirect Authenticated Users AWAY from Login
  if (user && path.startsWith('/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/' // Redirect to home/dashboard
    return NextResponse.redirect(url)
  }

  return response
}