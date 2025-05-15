
/// <reference types="vite/client" />

// Add a declaration for the execute_raw_query RPC function result
interface ExecuteRawQueryResult {
  count?: string;
  device_code?: string;
  [key: string]: any; // For any other fields that might be returned
}

// Add this to the global namespace
declare global {
  interface SupabaseRPCResponse {
    data: ExecuteRawQueryResult[] | null;
    error: Error | null;
  }
}
