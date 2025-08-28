// Service Worker registration COMPLETELY DISABLED for iOS PWA
console.log('🚫 Service Worker registration BLOCKED - registerSW.js disabled');

// If someone tries to load this file, block everything
if ('serviceWorker' in navigator) {
  console.error('🚫 CRITICAL: registerSW.js was loaded - this should not happen');
  
  // Force unregister everything
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      console.log('🗑️ EMERGENCY: Force unregistering service worker from registerSW:', registration.scope);
      registration.unregister();
    });
  });
}