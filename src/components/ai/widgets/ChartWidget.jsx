import React from 'react';
import { BarChart, PieChart } from 'lucide-react';

const ChartWidget = ({ type, title, data }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm my-3">
      <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
        {type === 'pie' ? <PieChart className="w-4 h-4 text-blue-500" /> : <BarChart className="w-4 h-4 text-blue-500" />}
        <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
      </div>
      
      {/* Placeholder for actual Recharts/Chart.js integration */}
      <div className="h-40 bg-gray-50 rounded flex items-center justify-center text-gray-400 text-sm border border-dashed border-gray-200">
        [Render {type} chart with data: {data.length} items]
      </div>
    </div>
  );
};
export default ChartWidget;