import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

export const usePWA = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [swUpdate, setSwUpdate] = useState<ServiceWorkerRegistration | null>(null);

    useEffect(() => {
        // Check if app is already installed
        const checkInstalled = () => {
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
            const isInWebAppiOS = (window.navigator as any).standalone === true;
            setIsInstalled(isStandalone || isInWebAppiOS);
        };

        // Listen for beforeinstallprompt event
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setIsInstallable(true);
        };

        // Listen for online/offline events
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        // Check for service worker updates
        const checkSWUpdate = async () => {
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration) {
                    setSwUpdate(registration);

                    // Listen for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // New content is available
                                    setSwUpdate(registration);
                                }
                            });
                        }
                    });
                }
            }
        };

        checkInstalled();
        checkSWUpdate();

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const install = async () => {
        if (!deferredPrompt) return false;

        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                setDeferredPrompt(null);
                setIsInstallable(false);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error during PWA installation:', error);
            return false;
        }
    };

    const updateSW = async () => {
        if (!swUpdate) return false;

        try {
            await swUpdate.update();
            window.location.reload();
            return true;
        } catch (error) {
            console.error('Error updating service worker:', error);
            return false;
        }
    };

    return {
        isInstallable,
        isInstalled,
        isOnline,
        canUpdate: !!swUpdate,
        install,
        updateSW
    };
};
