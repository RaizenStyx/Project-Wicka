import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Navigation from "@/components/Navigation";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "Wicka - Coven of Creators",
  description: "A mystical social platform for witches and wizards to share their spells and connect with fellow coven members.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 1. Setup Supabase
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
      },
    }
  );

  // 2. Fetch User
  const { data: { user } } = await supabase.auth.getUser();

  // 3. If user exists, fetch their profile for the Avatar/Username
  let userProfile = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    userProfile = profile;
  }
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} bg-slate-950 text-slate-200`}>
        <Navigation 
           profile={userProfile} 
           //currentUser={user ? { id: user.id } : null} 
        />
        {children}
      </body>
    </html>
  );
}
