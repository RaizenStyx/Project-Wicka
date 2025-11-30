import React from 'react';
import WidgetFrame from './WidgetFrame';

const MoonWidget = () => {
  return (
    // We override the background here for that special gradient look
    <WidgetFrame title="Current Moon" className="bg-gradient-to-br from-indigo-950 to-slate-900 border-indigo-500/20">
      <div className="flex flex-col items-center">
        <div className="h-24 w-24 rounded-full bg-slate-800 shadow-[0_0_30px_rgba(255,255,255,0.1)] mb-4 flex items-center justify-center text-xs text-slate-500">
          [Moon Icon]
        </div>
        <p className="text-xl font-serif text-slate-200">Waning Gibbous</p>
        <p className="text-xs text-slate-500 mt-1">Illumination: 94%</p>
      </div>
    </WidgetFrame>
  );
};

export default MoonWidget;