'use client';

import React from 'react';

interface MobileFrameProps {
  children: React.ReactNode;
}

export default function MobileFrame({ children }: MobileFrameProps) {
  return (
    <div className="flex items-center justify-center p-4">
      {/* iPhone-style frame */}
      <div className="relative">
        {/* Phone outer frame */}
        <div className="relative bg-slate-900 rounded-[3rem] p-3 shadow-2xl shadow-black/50">
          {/* Side buttons - Volume */}
          <div className="absolute -left-1 top-28 w-1 h-8 bg-slate-700 rounded-l-sm"></div>
          <div className="absolute -left-1 top-40 w-1 h-8 bg-slate-700 rounded-l-sm"></div>
          {/* Side buttons - Power */}
          <div className="absolute -right-1 top-32 w-1 h-12 bg-slate-700 rounded-r-sm"></div>

          {/* Phone inner bezel */}
          <div className="relative bg-black rounded-[2.5rem] overflow-hidden">
            {/* Dynamic Island / Notch */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50">
              <div className="w-28 h-7 bg-black rounded-full flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-800 ring-1 ring-slate-700"></div>
                <div className="w-3 h-3 rounded-full bg-slate-800 ring-1 ring-slate-700"></div>
              </div>
            </div>

            {/* Screen content - with force-mobile class */}
            <div
              className="force-mobile w-[375px] h-[812px] bg-white overflow-y-auto overflow-x-hidden"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              {children}
            </div>

            {/* Home indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/80 rounded-full"></div>
          </div>
        </div>

        {/* Reflection effect */}
        <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
}
