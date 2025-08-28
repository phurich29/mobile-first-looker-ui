// Disable service worker for iOS PWA compatibility
console.log('🚫 Service Worker disabled for iOS PWA');

// Unregister any existing service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      console.log('🗑️ Unregistering service worker:', registration.scope);
      registration.unregister();
    });
  });
}

// Block any new service worker registrations
if ('serviceWorker' in navigator) {
  const originalRegister = navigator.serviceWorker.register;
  navigator.serviceWorker.register = function() {
    console.log('🚫 Service Worker registration blocked');
    return Promise.reject(new Error('Service Worker disabled for iOS PWA'));
  };
}