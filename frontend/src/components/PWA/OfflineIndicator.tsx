import React from 'react';
import { usePWA } from '@/hooks/usePWA';
import { WifiOff } from 'lucide-react';

const OfflineIndicator: React.FC = () => {
  const { isOnline, isInstalled } = usePWA();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-2 space-x-2">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">
            You're offline - Some features may be limited
          </span>
          {isInstalled && (
            <span className="text-xs opacity-75">
              (Cached data available)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfflineIndicator;
