import React from 'react';
import { usePWA } from '@/hooks/usePWA';
import { Download, Wifi, WifiOff, RefreshCw, X } from 'lucide-react';

const PWAInstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, isOnline, canUpdate, install, updateSW } = usePWA();
  const [dismissed, setDismissed] = React.useState(false);

  if (dismissed || (!isInstallable && !canUpdate && isOnline)) {
    return null;
  }

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      setDismissed(true);
    }
  };

  const handleUpdate = async () => {
    const success = await updateSW();
    if (success) {
      setDismissed(true);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">PW</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">PulseWatch</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {!isOnline ? 'Offline Mode' : isInstalled ? 'Installed' : 'Available'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {/* Online/Offline Status */}
          <div className="flex items-center space-x-2 text-sm">
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-500" />
                <span className="text-gray-700 dark:text-gray-300">Offline - Limited functionality</span>
              </>
            )}
          </div>

          {/* Install Prompt */}
          {isInstallable && !isInstalled && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Install app for better experience
              </p>
              <button
                onClick={handleInstall}
                className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Install</span>
              </button>
            </div>
          )}

          {/* Update Prompt */}
          {canUpdate && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                New version available
              </p>
              <button
                onClick={handleUpdate}
                className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Update</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
