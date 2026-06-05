import React from 'react';
import { usePWA } from '@/hooks/usePWA';
import { Wifi, WifiOff, Cloud, CloudOff } from 'lucide-react';

const NetworkStatus: React.FC = () => {
  const { isOnline, isInstalled } = usePWA();

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className="flex items-center space-x-1">
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4 text-green-500" />
            <Cloud className="w-4 h-4 text-green-500" />
            <span className="text-green-600 dark:text-green-400 font-medium">Online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-red-500" />
            <CloudOff className="w-4 h-4 text-red-500" />
            <span className="text-red-600 dark:text-red-400 font-medium">Offline</span>
          </>
        )}
      </div>
      
      {isInstalled && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          • PWA Mode
        </span>
      )}
    </div>
  );
};

export default NetworkStatus;
