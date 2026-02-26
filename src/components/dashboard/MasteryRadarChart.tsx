'use client';

import React from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';

interface MasteryData {
  topic: string;
  mastery: number;
}

const mockData: MasteryData[] = [
  { topic: 'Functions', mastery: 85 },
  { topic: 'Algebra', mastery: 70 },
  { topic: 'Calculus', mastery: 45 },
  { topic: 'Probability', mastery: 60 },
  { topic: 'Statistics', mastery: 90 },
];

export default function MasteryRadarChart() {
  return (
    <div className="w-full h-full min-h-[300px] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-800">Topic Mastery</h3>
        <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded">VCAA Aligned</span>
      </div>
      
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={mockData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis 
              dataKey="topic" 
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={{ fill: '#94a3b8', fontSize: 10 }}
            />
            <Radar
              name="Mastery %"
              dataKey="mastery"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.5}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '8px', 
                border: 'none', 
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="p-2 rounded bg-slate-50 border border-slate-100">
          <p className="text-[10px] text-slate-500 uppercase font-bold">Strongest</p>
          <p className="text-sm font-bold text-slate-800">Statistics</p>
        </div>
        <div className="p-2 rounded bg-orange-50 border border-orange-100">
          <p className="text-[10px] text-orange-500 uppercase font-bold">Focus Area</p>
          <p className="text-sm font-bold text-orange-800">Calculus</p>
        </div>
      </div>
    </div>
  );
}
