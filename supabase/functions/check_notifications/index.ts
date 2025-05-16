
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const SUPABASE_URL = "https://tlnkyztazcsqybjigrpw.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Edge function started: check_notification_thresholds");
    
    // Initialize Supabase client with SERVICE_ROLE key for admin privileges
    const supabase = createClient(
      SUPABASE_URL, 
      SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
        }
      }
    );
    
    // Call the database function to check notifications directly with RPC
    const { data, error } = await supabase.rpc('check_notification_thresholds');
    
    if (error) {
      console.error('Error executing check_notification_thresholds:', error);
      return new Response(JSON.stringify({ 
        error: error.message,
        success: false,
        time: new Date().toISOString() 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    console.log("Notification check completed successfully");
    
    // Return success response
    return new Response(JSON.stringify({ 
      message: "Notification check completed successfully",
      success: true,
      time: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ 
      error: "Internal server error", 
      details: error.message || String(error),
      time: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
