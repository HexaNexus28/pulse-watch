import React from 'react';
import { TrendingUp } from 'lucide-react';

interface TrendWidgetProps {
  trend?: {
    score?: number;
    date?: string;
  };
}

export const TrendWidget: React.FC<TrendWidgetProps> = ({ trend }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Trend Score</h4>
        <TrendingUp className="w-4 h-4 text-green-500" />
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-blue-600">{trend?.score || 0}</div>
        <p className="text-xs text-gray-500">Last updated: {trend?.date || 'Never'}</p>
      </div>
      <div className="h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg" />
    </div>
  );
};

export default TrendWidget;
