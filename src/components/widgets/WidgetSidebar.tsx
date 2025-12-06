import React from 'react';
import ProfileWidget from './ProfileWidget';
import MoonWidget from './MoonWidget';
import TarotWidget from './TarotWidget';

export default async function WidgetSidebar() {
  // FUTURE TODO: Fetch user preferences here.
  // const { activeWidgets } = useUserPreferences();

  return (
    <div className="col-span-1 space-y-0">
      {/* Since the WidgetFrame includes 'mb-6' (margin bottom), 
         they will stack perfectly. 
      */}
      <ProfileWidget />

      <MoonWidget />
      <TarotWidget />
      
      {/* Placeholder for future widgets */}
      {/* <CrystalWidget /> */}
      {/* <HoroscopeWidget /> */}
      
    </div>
  );
};

