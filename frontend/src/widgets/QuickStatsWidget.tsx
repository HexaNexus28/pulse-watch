import React from 'react';
import { BarChart3, TrendingUp, FileText, Activity } from 'lucide-react';

interface QuickStatsWidgetProps {
  data?: {
    categories?: number;
    trends?: number;
    notes?: number;
    feeds?: number;
  };
}

export const QuickStatsWidget: React.FC<QuickStatsWidgetProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <BarChart3 className="w-6 h-6 text-blue-600 mx-auto mb-1" />
        <p className="text-2xl font-bold text-blue-600">{data?.categories || 0}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">Categories</p>
      </div>
      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-1" />
        <p className="text-2xl font-bold text-green-600">{data?.trends || 0}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">Trends</p>
      </div>
      <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
        <FileText className="w-6 h-6 text-purple-600 mx-auto mb-1" />
        <p className="text-2xl font-bold text-purple-600">{data?.notes || 0}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">Notes</p>
      </div>
      <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
        <Activity className="w-6 h-6 text-orange-600 mx-auto mb-1" />
        <p className="text-2xl font-bold text-orange-600">{data?.feeds || 0}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">Feeds</p>
      </div>
    </div>
  );
};

export default QuickStatsWidget;
