'use client'

import { useState } from 'react'
import { createClient } from '@/app/utils/supabase/client';
import { Eye, EyeOff, Check, Loader2, ChevronUp, ChevronDown, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation';
import { ALL_WIDGETS } from '@/app/utils/constants';

interface WidgetItem {
  id: string;
  enabled: boolean;
}

interface WidgetCustomizerProps {
  initialOrder: string[] | WidgetItem[]; 
}

export default function WidgetCustomizer({ initialOrder }: WidgetCustomizerProps) {
  const [saving, setSaving] = useState(false)
  const router = useRouter();
  const [widgets, setWidgets] = useState<WidgetItem[]>(() => {
    let normalized: WidgetItem[] = [];

    // 1. NORMALIZE DATA (Handle old strings vs new objects)
    if (!initialOrder || initialOrder.length === 0) {
      normalized = [];
    } else if (typeof initialOrder[0] === 'string') {
      normalized = (initialOrder as string[]).map(id => ({ id, enabled: true }));
    } else {
      normalized = initialOrder as WidgetItem[];
    }

    const existingIds = new Set(normalized.map(w => w.id));
    
    const missingWidgets = ALL_WIDGETS
      .filter(id => !existingIds.has(id))
      .map(id => ({ id, enabled: true })); 

    // Combine existing + missing
    const combined = [...normalized, ...missingWidgets];

    // 2. ENFORCE PINNING (Profile must exist and be at index 0)
    // Remove 'profile' from wherever it is currently
    const filtered = combined.filter(w => w.id !== 'profile');
    
    // Add it back to the start, forcing it to be enabled
    return [{ id: 'profile', enabled: true }, ...filtered];
  })

  // --- MOVE FUNCTIONALITY ---
  const moveWidget = (index: number, direction: 'up' | 'down') => {
    // Rule 1: Cannot move the Profile widget (index 0)
    if (index === 0) return;

    // Rule 2: Cannot move UP if you are at index 1 (because index 0 is locked)
    if (direction === 'up' && index === 1) return; 
    
    // Rule 3: Standard boundaries
    if (direction === 'up' && index === 0) return; 
    if (direction === 'down' && index === widgets.length - 1) return; 

    const newWidgets = [...widgets];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    // Swap
    [newWidgets[index], newWidgets[targetIndex]] = [newWidgets[targetIndex], newWidgets[index]];
    setWidgets(newWidgets);
  }

  // --- TOGGLE FUNCTIONALITY ---
  const toggleWidget = (index: number) => {
    if (index === 0) return; 

    const newWidgets = [...widgets]
    newWidgets[index].enabled = !newWidgets[index].enabled
    setWidgets(newWidgets)
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('preferences')
      .eq('id', user.id)
      .single()

    const currentPrefs = profile?.preferences || {}

    // Update only the widget_order
    const { error } = await supabase
      .from('profiles')
      .update({
        preferences: {
          ...currentPrefs,
          widget_order: widgets 
        }
      })
      .eq('id', user.id)

    setSaving(false)
    if (!error) {
       console.log("Saved!");
       router.refresh();
    }
  }

  const getLabel = (id: string) => {
    const labels: Record<string, string> = {
      profile: "Profile Card",
      moon: "Moon Phase",
      tarot: "Daily Tarot",
      crystal: "Crystal Identifier",
      deity: "Deity Evoke"
    }
    return labels[id] || id
  }

  return (
    <div>
      <p className="text-sm text-slate-400 mb-6">
        Arrange the widgets as you would like them to appear in your sidebar. 
        The <strong>Profile Card</strong> is pinned to the top.
      </p>

      <div className="space-y-3 mb-6">
        {widgets.map((widget, index) => {
          const isPinned = widget.id === 'profile';

          return (
            <div 
              key={widget.id}
              className={`
                flex items-center justify-between p-3 rounded-lg border transition-all
                ${widget.enabled 
                  ? 'bg-slate-800 border-slate-700 text-slate-200' 
                  : 'bg-slate-900/50 border-slate-800 text-slate-500' 
                }
                ${isPinned ? 'border-purple-900/50 bg-purple-900/10' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                <span className="font-medium">{getLabel(widget.id)}</span>
                {isPinned && (
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-900/30 px-2 py-0.5 rounded-full border border-purple-800">
                    <Lock size={10} /> Pinned
                  </span>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center gap-1">
                  
                  {!isPinned ? (
                    <>
                      {/* UP ARROW */}
                      <button
                          onClick={() => moveWidget(index, 'up')}
                          // Disable if it's the item directly below Profile (index 1)
                          disabled={index <= 1} 
                          className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-slate-700 rounded disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                          title="Move Up"
                      >
                          <ChevronUp size={18} />
                      </button>

                      {/* DOWN ARROW */}
                      <button
                          onClick={() => moveWidget(index, 'down')}
                          disabled={index === widgets.length - 1}
                          className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-slate-700 rounded disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                          title="Move Down"
                      >
                          <ChevronDown size={18} />
                      </button>

                      <div className="w-px h-6 bg-slate-700 mx-2"></div>
                    </>
                  ) : (
                    <div className="mr-2 text-xs text-slate-600 italic">Fixed</div>
                  )}

                  {/* VISIBILITY TOGGLE */}
                  <button
                    onClick={() => toggleWidget(index)}
                    disabled={isPinned} 
                    className={`
                      p-2 rounded-md transition-colors
                      ${widget.enabled 
                      ? 'text-purple-400 hover:bg-purple-900/30' 
                      : 'text-slate-600 hover:bg-slate-800'
                      }
                      ${isPinned ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    title={isPinned ? "Cannot hide pinned widget" : (widget.enabled ? "Hide Widget" : "Show Widget")}
                  >
                    {widget.enabled ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
              </div>
            </div>
          )
        })}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 cursor-pointer"
      >
        {saving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  )
}