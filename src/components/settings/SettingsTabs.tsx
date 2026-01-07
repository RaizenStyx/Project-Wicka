'use client'

import Link from 'next/link'
import { User, Sparkles, Shield } from "lucide-react"
import PasswordForm from '../profile/PasswordForm'
import ProfileTabContent from './ProfileTabContent' 
import WidgetCustomizer from '@/components/settings/WidgetCustomizer'

interface SettingsTabsProps {
  user: any;
  profile: any;
  initialData: any; 
  activeTab: string;
}

export default function SettingsTabs({ user, profile, initialData, activeTab }: SettingsTabsProps) {
  
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-[250px_1fr]">
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <nav className="space-y-2">
        <SettingsLink tab="profile" current={activeTab} icon={<User size={18} />} label="Profile" />
        <SettingsLink tab="sanctuary" current={activeTab} icon={<Sparkles size={18} />} label="Sanctuary & Widgets" />
        <SettingsLink tab="account" current={activeTab} icon={<Shield size={18} />} label="Account Security" />
      </nav>

      {/* RIGHT CONTENT AREA */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        
        {/* TAB 1: PROFILE */}
        {activeTab === "profile" && (
           <ProfileTabContent initialData={initialData} profile={profile} />
        )}

        {/* TAB 2: SANCTUARY */}
        {activeTab === "sanctuary" && (
          <div>
            <h2 className="mb-6 text-xl font-bold text-slate-100">Customize Your Sanctuary</h2>
            <WidgetCustomizer 
                initialOrder={profile?.preferences?.widget_order || ["profile", "moon", "tarot", "item", "deity"]} 
            />
          </div>
        )}

        {/* TAB 3: ACCOUNT */}
        {activeTab === "account" && (
          <div className="text-slate-400">
            <h2 className="mb-6 text-xl font-bold text-slate-100">Account Security</h2>
            <div className="pt-8 border-t border-slate-800">
                <h3 className="text-lg font-serif text-purple-400 mb-4">Password Changes</h3>
                <PasswordForm />
            </div>
          </div>
        )}
        
      </div>
    </div>
  )
}

// Helper for the sidebar links
// We use Link (from next/link) instead of <a> for faster navigation
function SettingsLink({ tab, current, icon, label }: any) {
  const isActive = tab === current;
  return (
    <Link
      href={`/settings?tab=${tab}`}
      className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
        isActive
          ? "bg-purple-600 text-white"
          : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}