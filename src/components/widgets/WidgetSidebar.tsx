import React from 'react';
import MoonWidget from './MoonWidget';
import TarotWidget from './TarotWidget';

const WidgetSidebar = () => {
  // FUTURE TODO: Fetch user preferences here.
  // const { activeWidgets } = useUserPreferences();

  return (
    <div className="hidden md:block col-span-1 space-y-0">
      {/* Since the WidgetFrame includes 'mb-6' (margin bottom), 
         they will stack perfectly. 
      */}
      
      <MoonWidget />
      <TarotWidget />
      
      {/* Placeholder for future widgets */}
      {/* <CrystalWidget /> */}
      {/* <HoroscopeWidget /> */}
      
    </div>
  );
};

export default WidgetSidebar;