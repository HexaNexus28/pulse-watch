import React from 'react';
import { Badge } from '../components';

interface StatsWidgetProps {
  stats?: {
    total?: number;
    active?: number;
    inactive?: number;
  };
}

export const StatsWidget: React.FC<StatsWidgetProps> = ({ stats }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Items</h4>
        <Badge variant="primary">{stats?.total || 0}</Badge>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500">Active</p>
          <p className="text-lg font-semibold text-green-600">{stats?.active || 0}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Inactive</p>
          <p className="text-lg font-semibold text-red-600">{stats?.inactive || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsWidget;
