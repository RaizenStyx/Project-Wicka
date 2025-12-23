import React from 'react';
import ProfileWidget from './ProfileWidget';
import MoonWidget from './MoonWidget';
import TarotWidget from './TarotWidget';
import CrystalCollectionWidget from './CrystalCollectionWidget';

export default function WidgetSidebar({ profilePreferences }: { profilePreferences: any }) {
  
  // Default fallback order
  const defaultOrder = ["profile", "moon", "tarot", "crystal"];
  const order = profilePreferences?.widget_order || defaultOrder;

  // Render Map
  const widgetMap: Record<string, React.ReactNode> = {
    profile: <ProfileWidget />,
    moon: <MoonWidget />,
    tarot: <TarotWidget />,
    crystal: <CrystalCollectionWidget />,
    // deity: <DeityWidget /> // Coming soon!
  };

  return (
    <aside className="hidden lg:block w-80 space-y-6">
       {order.map((key: string) => (
         <div key={key}>
           {widgetMap[key]}
         </div>
       ))}
    </aside>
  );
}