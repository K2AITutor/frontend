'use client';

import React from 'react';

// Simplified heatmap component
export default function StudentActivityHeatmap() {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeks = 12;
  
  // Mock data: 0-4 intensity
  const getActivity = () => Math.floor(Math.random() * 5);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-800">Study Consistency</h3>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Streak:</span>
          <span className="text-xs font-bold text-orange-600">🔥 5 Days</span>
        </div>
      </div>

      <div className="flex-1 flex gap-1.5 overflow-hidden">
        {/* Day labels */}
        <div className="flex flex-col justify-between py-1 pr-2">
          {days.map((day, i) => (
            <span key={day} className={`text-[10px] font-bold text-slate-400 ${i % 2 === 0 ? 'invisible' : ''}`}>
              {day}
            </span>
          ))}
        </div>

        {/* Heatmap Grid */}
        <div className="flex-1 flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
          {Array.from({ length: weeks }).map((_, w) => (
            <div key={w} className="flex flex-col gap-1.5 flex-shrink-0">
              {Array.from({ length: 7 }).map((_, d) => {
                const intensity = getActivity();
                const colors = [
                  'bg-slate-100',      // 0
                  'bg-blue-200',       // 1
                  'bg-blue-400',       // 2
                  'bg-blue-600',       // 3
                  'bg-blue-800',       // 4
                ];
                return (
                  <div 
                    key={`${w}-${d}`} 
                    className={`w-3.5 h-3.5 rounded-sm ${colors[intensity]} transition-colors hover:ring-2 hover:ring-blue-300 cursor-help`}
                    title={`Activity level: ${intensity}/4`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-[10px] text-slate-400 font-bold">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-slate-100" />
          <div className="w-3 h-3 rounded-sm bg-blue-200" />
          <div className="w-3 h-3 rounded-sm bg-blue-400" />
          <div className="w-3 h-3 rounded-sm bg-blue-600" />
          <div className="w-3 h-3 rounded-sm bg-blue-800" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
