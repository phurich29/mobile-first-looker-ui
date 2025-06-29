
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function UserSearchDebug() {
  const [debugResults, setDebugResults] = useState<any[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const checkUserInDatabase = async () => {
    setIsChecking(true);
    try {
      console.log("🔍 Starting direct database check for demo5@demo.com");
      
      // 1. Check profiles table with exact match
      const { data: exactMatch, error: exactError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', 'demo5@demo.com');
        
      console.log("🎯 Exact match query result:", { exactMatch, exactError });
      
      // 2. Check profiles table with ilike (case insensitive)
      const { data: ilikeMatch, error: ilikeError } = await supabase
        .from('profiles')
        .select('*')
        .ilike('email', 'demo5@demo.com');
        
      console.log("📋 iLike query result:", { ilikeMatch, ilikeError });
      
      // 3. Check profiles table with partial match
      const { data: partialMatch, error: partialError } = await supabase
        .from('profiles')
        .select('*')
        .ilike('email', '%demo5%');
        
      console.log("🔍 Partial match query result:", { partialMatch, partialError });
      
      // 4. Check all profiles to see what's available
      const { data: allProfiles, error: allError } = await supabase
        .from('profiles')
        .select('id, email')
        .limit(20);
        
      console.log("📊 All profiles sample:", { allProfiles, allError });
      
      // 5. Check user_roles table
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .limit(10);
        
      console.log("👥 User roles sample:", { userRoles, rolesError });

      // 6. Check current user info
      const { data: { user } } = await supabase.auth.getUser();
      console.log("👤 Current user:", user);
      
      // Combine results for display
      const results = [
        { type: 'Exact Match (demo5@demo.com)', data: exactMatch, error: exactError },
        { type: 'iLike Match (demo5@demo.com)', data: ilikeMatch, error: ilikeError },
        { type: 'Partial Match (%demo5%)', data: partialMatch, error: partialError },
        { type: 'All Profiles (first 20)', data: allProfiles, error: allError },
        { type: 'User Roles', data: userRoles, error: rolesError },
        { type: 'Current User Info', data: user, error: null }
      ];
      
      setDebugResults(results);
      
      toast({
        title: "Debug Results Ready",
        description: "Check console and debug panel for detailed results",
      });
      
    } catch (error) {
      console.error("💥 Debug error:", error);
      toast({
        title: "Debug Error",
        description: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <h3 className="font-semibold mb-2">Debug: Database Check (Enhanced)</h3>
      <Button 
        onClick={checkUserInDatabase}
        disabled={isChecking}
        variant="outline"
        size="sm"
      >
        {isChecking ? "Checking..." : "Check demo5@demo.com (Multiple Methods)"}
      </Button>
      
      {debugResults.length > 0 && (
        <div className="mt-4 space-y-2">
          {debugResults.map((result, index) => (
            <div key={index} className="p-2 bg-white dark:bg-gray-700 rounded text-xs">
              <strong>{result.type}:</strong>
              <pre className="mt-1 overflow-auto max-h-32">
                {JSON.stringify({ data: result.data, error: result.error }, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
