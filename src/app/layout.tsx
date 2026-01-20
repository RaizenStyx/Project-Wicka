import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { createClient } from "./utils/supabase/server";
import Shell from "@/components/layout/Shell";
import SidebarLinks from "@/components/layout/SidebarLinks";
import WidgetSidebar from "@/components/widgets/WidgetSidebar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

// 1. Set your actual production URL here
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.nyxusapp.com";

export const viewport: Viewport = {
  themeColor: '#4B0082', 
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  
  title: {
    default: "Nyxus App | Creators of Night",
    template: "%s | Nyxus",
  },
  description: "The Nyxus App. A mystical social platform for witches, wizards, and tarot readers. Share spells, track moon phases, and connect with your coven.",
  
  // 2. SEO Keywords
  keywords: [
    "Nyxus App",
    "Social Media for Witches",
    "Tarot Community",
    "Spells and Rituals",
    "Moon Phase Tracker",
    "Coven Finder",
    "Next.js Social App",
    "Supabase Realtime",
    "Grimoire App"
  ],

  authors: [{ name: "Nyxus Team" }],
  
  // 3. PWA Configuration
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Nyxus',
  },
  formatDetection: {
    telephone: false,
  },
  
  // 4. Open Graph (Facebook, LinkedIn, Discord)
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    title: "Nyxus | The Social Network for the Arcane",
    description: "Join the circle. A dedicated space for tarot readers, spellcasters, and the spiritually curious.",
    siteName: "Nyxus",
  },

  // 5. Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Nyxus | Creators of Night",
    description: "Share spells, track the moon, and find your coven.",
    creator: "@NyxusApp",
  },

  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Create Supabase Client on the Server
  const supabase = await createClient();

  // Fetch User
  const { data: { user } } = await supabase.auth.getUser();

  // If user exists, fetch their profile for the Avatar/Username
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
        <Shell 
          leftSidebar={<SidebarLinks profile={userProfile} />}
          rightSidebar={<WidgetSidebar profilePreferences={userProfile?.preferences} />}
        >
        {children}
        </Shell>
      </body>
    </html>
  );
}