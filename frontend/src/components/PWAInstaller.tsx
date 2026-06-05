import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, Check } from 'lucide-react';
import { Button, Card, Modal } from './index';

interface PWAInstallerProps {
  showInstallPrompt?: boolean;
  onInstall?: () => void;
  onDismiss?: () => void;
}

const PWAInstaller: React.FC<PWAInstallerProps> = ({
  showInstallPrompt = true,
  onInstall,
  onDismiss
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [installStep] = useState(0);

  // Check if app is already installed
  useEffect(() => {
    const checkInstalled = () => {
      // Check if app is running in standalone mode
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      const isInWebAppChrome = window.matchMedia('(display-mode: minimal-ui)').matches;
      
      setIsInstalled(isStandalone || isInWebAppiOS || isInWebAppChrome);
    };

    checkInstalled();

    // Listen for app installed event
    window.addEventListener('appinstalled', checkInstalled);
    return () => window.removeEventListener('appinstalled', checkInstalled);
  }, []);

  // Listen for beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback to manual install instructions
      setShowModal(true);
      return;
    }

    try {
      // Show the install prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        onInstall?.();
      }
    } catch (error) {
      console.error('Error during installation:', error);
      setShowModal(true);
    }
  };

  const handleDismiss = () => {
    setShowModal(false);
    onDismiss?.();
  };

  const getInstallInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isChrome = /chrome/.test(userAgent);

    if (isIOS) {
      return {
        title: 'Install on iOS',
        steps: [
          'Tap the Share button in Safari',
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" to install the app',
          'The app will appear on your home screen'
        ],
        icon: <Smartphone className="w-8 h-8" />
      };
    } else if (isAndroid && !isChrome) {
      return {
        title: 'Install on Android',
        steps: [
          'Open this page in Chrome browser',
          'Tap the menu button (three dots)',
          'Tap "Add to Home screen"',
          'Tap "Add" to install the app'
        ],
        icon: <Smartphone className="w-8 h-8" />
      };
    } else {
      return {
        title: 'Install on Desktop',
        steps: [
          'Click the install button below',
          'Follow the browser prompts',
          'The app will be installed on your device',
          'Access it from your applications'
        ],
        icon: <Monitor className="w-8 h-8" />
      };
    }
  };

  const installInstructions = getInstallInstructions();

  // Don't show if already installed or not installable
  if (isInstalled || (!isInstallable && !showInstallPrompt)) {
    return null;
  }

  return (
    <>
      {/* Install Banner */}
      <Card padding="md" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold">Install PulseWatch</h3>
              <p className="text-sm opacity-90">Get the full experience on your device</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleInstallClick}
              variant="secondary"
              size="sm"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Install
            </Button>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Install Instructions Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleDismiss}
        title={installInstructions.title}
        size="md"
      >
        <div className="space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              {installInstructions.icon}
            </div>
          </div>

          {/* Installation Steps */}
          <div className="space-y-4">
            {installInstructions.steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    installStep > index 
                      ? 'bg-green-500 text-white' 
                      : installStep === index 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {installStep > index ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 dark:text-gray-300">{step}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Why install PulseWatch?
            </h4>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Offline access to your dashboard</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Faster loading and performance</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Native app experience</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Push notifications support</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={handleInstallClick}
              variant="primary"
              className="flex-1"
            >
              {deferredPrompt ? 'Install Now' : 'Try Installation'}
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline"
              className="flex-1"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};



// Export interfaces for external use
export type { PWAInstallerProps };
export default PWAInstaller;