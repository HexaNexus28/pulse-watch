import React from 'react';
import { FileText } from 'lucide-react';
import { Badge } from '../components';

interface FeedWidgetProps {
  feeds?: Array<{
    name: string;
    category: string;
  }>;
}

export const FeedWidget: React.FC<FeedWidgetProps> = ({ feeds }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Feeds</h4>
        <Badge variant="secondary">{feeds?.length || 0}</Badge>
      </div>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {feeds?.slice(0, 3).map((feed, index) => (
          <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
            <FileText className="w-4 h-4 text-blue-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{feed.name}</p>
              <p className="text-xs text-gray-500">{feed.category}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedWidget;
