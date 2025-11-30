import React from 'react';
import WidgetFrame from './WidgetFrame';

const TarotWidget = () => {
  return (
    <WidgetFrame title="Card of the Day">
       <div className="aspect-[2/3] w-full rounded bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-center p-4 hover:border-amber-500/50 transition-colors cursor-pointer">
          <span className="text-amber-500 font-serif text-lg">The High Priestess</span>
          <span className="text-xs text-slate-500 mt-2">Intuition, Mystery</span>
       </div>
    </WidgetFrame>
  );
};

export default TarotWidget;