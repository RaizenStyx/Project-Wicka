import React from 'react';
import ProfileWidget from './ProfileWidget';
import MoonWidget from './MoonWidget';
import TarotWidget from './TarotWidget';
import DeityWidget from './DeityWidget';
import ItemCollectionWidget from './ItemCollectionWidget';
import { ALL_WIDGETS } from '@/app/utils/constants';

export default function WidgetSidebar({ profilePreferences }: { profilePreferences: any }) {
  
  const widgetMap: Record<string, React.ReactNode> = {
    profile: <ProfileWidget />,
    moon: <MoonWidget />,
    tarot: <TarotWidget />,
    item: <ItemCollectionWidget />,
    deity: <DeityWidget /> 
  };

  let activeWidgets: string[] = ["profile", "moon", "tarot", "item", "deity"];
  
  const rawOrder = profilePreferences?.widget_order;

// SCENARIO A: No preferences saved yet -> Show Default List
  if (!rawOrder || rawOrder.length === 0) {
    activeWidgets = ALL_WIDGETS;
  } 
  // SCENARIO B: User has saved preferences
  else {
    // 1. Get their current visible list
    if (typeof rawOrder[0] === 'string') {
      activeWidgets = rawOrder;
    } else {
      activeWidgets = rawOrder.filter((w: any) => w.enabled).map((w: any) => w.id);
    }

    // 2. THE FIX: Inject "deity" if it is missing from their data entirely
    // We check if "deity" appears in their raw data (enabled or disabled)
    // If it's totally absent, it means they saved their settings BEFORE this feature existed.
    // So we append it to the end.
    const hasSeenDeityFeature = rawOrder.some((item: any) => 
       typeof item === 'string' ? item === 'deity' : item.id === 'deity'
    );

    if (!hasSeenDeityFeature) {
      activeWidgets.push('deity');
    }
  }

  return (
    <aside className="w-full lg:w-80 space-y-6">
       {activeWidgets.map((key: string) => (
         <div key={key}>
           {widgetMap[key] ? widgetMap[key] : null}
         </div>
       ))}
    </aside>
  );
}