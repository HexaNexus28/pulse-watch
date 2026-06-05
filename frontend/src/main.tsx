import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

// Register Service Worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, show update notification
                const updateBanner = document.createElement('div');
                updateBanner.className = 'fixed bottom-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
                updateBanner.innerHTML = `
                  <div class="flex justify-between items-center">
                    <div>
                      <div class="font-semibold">Mise à jour disponible!</div>
                      <div class="text-sm">Une nouvelle version de PulseWatch est prête.</div>
                    </div>
                    <button onclick="location.reload()" class="bg-white text-green-600 px-3 py-1 rounded ml-4">
                      Actualiser
                    </button>
                  </div>
                `;
                document.body.appendChild(updateBanner);
              }
            });
          }
        });
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Enhanced PWA Install Prompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  const deferredPrompt = e as any;
  
  const banner = document.createElement('div');
  banner.className = 'fixed top-0 left-0 right-0 bg-blue-600 text-white p-4 z-50';
  banner.innerHTML = `
    <div class="max-w-7xl mx-auto flex justify-between items-center">
      <div class="flex items-center">
        <svg class="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
        </svg>
        <div>
          <div class="font-semibold">Installer PulseWatch</div>
          <div class="text-sm opacity-90">Accédez à votre tableau de bord même hors ligne</div>
        </div>
      </div>
      <div class="flex space-x-2">
        <button onclick="this.parentElement.parentElement.remove()" class="text-white hover:bg-white/20 px-3 py-1 rounded">
          Plus tard
        </button>
        <button onclick="installPWA()" class="bg-white text-blue-600 px-4 py-1 rounded font-semibold">
          Installer
        </button>
      </div>
    </div>
  `;
  
  // Make installPWA globally available
  (window as any).installPWA = () => {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      banner.remove();
    });
  };
  
  document.body.appendChild(banner);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
