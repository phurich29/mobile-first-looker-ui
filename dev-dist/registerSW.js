// Service Worker registration ENABLED for PWA but with WebSocket blocking
console.log('✅ Service Worker registration ENABLED for PWA updates');

// Register the iOS PWA compatible service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then((registration) => {
      console.log('✅ PWA Service Worker registered successfully:', registration.scope);
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        console.log('🔄 PWA Service Worker update found');
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🔄 PWA Service Worker updated - new version available');
              // Could show update available notification here
            }
          });
        }
      });
    })
    .catch((error) => {
      console.error('❌ PWA Service Worker registration failed:', error);
    });
}