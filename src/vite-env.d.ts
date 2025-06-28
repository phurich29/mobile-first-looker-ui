
/// <reference types="vite/client" />

// Define a type for history data items to be used across the application
interface HistoryDataItem {
  [key: string]: any;
  created_at?: string;
  thai_datetime?: string;
}

// PWA register types
declare module 'virtual:pwa-register/react' {
  import type { Dispatch, SetStateAction } from 'react'
  
  export interface RegisterSWOptions {
    immediate?: boolean
    onNeedRefresh?: () => void
    onOfflineReady?: () => void
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void
    onRegisterError?: (error: any) => void
  }

  export function useRegisterSW(options?: RegisterSWOptions): {
    needRefresh: [boolean, Dispatch<SetStateAction<boolean>>]
    offlineReady: [boolean, Dispatch<SetStateAction<boolean>>]
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>
  }
}
