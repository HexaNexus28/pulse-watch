import React, { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';

const PushNotificationManager: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if push notifications are supported
    const checkSupport = () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window;
      setIsSupported(supported);
      
      if (supported) {
        setPermission(Notification.permission);
        
        // Get existing subscription
        navigator.serviceWorker.ready.then(registration => {
          return registration.pushManager.getSubscription();
        }).then(sub => {
          setSubscription(sub);
        });
      }
    };

    checkSupport();
  }, []);

  const requestPermission = async () => {
    if (!isSupported) return;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        // Subscribe to push notifications
        const registration = await navigator.serviceWorker.ready;
        const pushSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array('YOUR_VAPID_PUBLIC_KEY') // Replace with your VAPID key
        });
        
        setSubscription(pushSubscription);
        
        // Send subscription to backend
        await sendSubscriptionToBackend(pushSubscription);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const unsubscribe = async () => {
    if (!subscription) return;

    try {
      await subscription.unsubscribe();
      setSubscription(null);
      setPermission('default');
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
    }
  };

  const sendSubscriptionToBackend = async (subscription: PushSubscription) => {
    // Send subscription to your backend
    try {
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });
    } catch (error) {
      console.error('Error sending subscription to backend:', error);
    }
  };

  // Helper function to convert VAPID key
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  };

  if (!isSupported) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40">
      {permission === 'default' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-xs">
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Enable Notifications
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Get updates on your feeds and trends
              </p>
            </div>
            <button
              onClick={requestPermission}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              Enable
            </button>
          </div>
        </div>
      )}
      
      {permission === 'granted' && subscription && (
        <button
          onClick={unsubscribe}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Disable notifications"
        >
          <BellOff className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      )}
    </div>
  );
};

export default PushNotificationManager;
