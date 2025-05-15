
/// <reference types="vite/client" />

// Define a type for history data items to be used across the application
interface HistoryDataItem {
  [key: string]: any;
  created_at?: string;
  thai_datetime?: string;
}
