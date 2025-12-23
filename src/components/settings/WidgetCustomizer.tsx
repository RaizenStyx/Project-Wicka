"use client";

import { useState } from "react";
import { ArrowUp, ArrowDown, Save } from "lucide-react";
import { createClient } from "@/app/utils/supabase/client";

const AVAILABLE_WIDGETS: Record<string, string> = {
  profile: "Profile Overview (Fixed)",
  moon: "Moon Phase Tracker",
  tarot: "Daily Tarot Card",
  crystal: "Crystal of the Day",
  deity: "Patron Deity Altar", // Placeholder for your new idea
};

export default function WidgetCustomizer({ initialOrder }: { initialOrder: string[] }) {
  const [order, setOrder] = useState<string[]>(initialOrder);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  // Move Item Function
  const move = (index: number, direction: -1 | 1) => {
    const newOrder = [...order];
    const item = newOrder[index];
    newOrder.splice(index, 1);
    newOrder.splice(index + direction, 0, item);
    setOrder(newOrder);
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // We merge the new order with existing preferences to avoid overwriting other settings
    const { data: profile } = await supabase.from('profiles').select('preferences').eq('id', user.id).single();
    const currentPrefs = profile?.preferences || {};

    await supabase
      .from("profiles")
      .update({
        preferences: { ...currentPrefs, widget_order: order },
      })
      .eq("id", user.id);

    setSaving(false);
    // Optional: Add a toast notification here
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-400">
        Arrange the widgets as you would like them to appear in your sidebar. 
        The <strong>Profile Overview</strong> is pinned to the top.
      </p>

      <div className="space-y-3">
        {order.map((key, index) => (
          <div
            key={key}
            className={`flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 p-4 ${
              key === "profile" ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            <span className="font-medium text-slate-200">
              {AVAILABLE_WIDGETS[key] || key}
            </span>

            {/* Controls */}
            {key !== "profile" && (
              <div className="flex gap-2">
                <button
                  onClick={() => move(index, -1)}
                  disabled={index <= 1} // Can't go above Profile (index 0)
                  className="rounded p-2 hover:bg-slate-700 disabled:opacity-30"
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  onClick={() => move(index, 1)}
                  disabled={index === order.length - 1}
                  className="rounded p-2 hover:bg-slate-700 disabled:opacity-30"
                >
                  <ArrowDown size={16} />
                </button>
              </div>
            )}
            {key === "profile" && <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Pinned</span>}
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-2 font-bold text-white hover:bg-purple-700 disabled:opacity-50"
      >
        <Save size={18} />
        {saving ? "Saving..." : "Save Layout"}
      </button>
    </div>
  );
}