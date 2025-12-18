import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { createClient } from "./utils/supabase/server";
import Shell from "@/components/layout/Shell";
import SidebarLinks from "@/components/ui/SidebarLinks";
import WidgetSidebar from "@/components/widgets/WidgetSidebar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "Nocta - Creators of Night",
  description: "A mystical social platform for witches and wizards to share their spells and connect with fellow coven members."
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Create Supabase Client on the Server
  const supabase = await createClient();

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
        <Shell 
          leftSidebar={<SidebarLinks profile={userProfile} />}
          rightSidebar={<WidgetSidebar />}
        >
        {children}
        </Shell>
      </body>
    </html>
  );
}
