
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Logout = () => {
  useEffect(() => {
    const forceLogout = async () => {
      try {
        console.log('🚪 Force logout initiated');
        
        // Force sign out from Supabase
        await supabase.auth.signOut();
        
        // Clear all localStorage items
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Clear sessionStorage
        sessionStorage.clear();
        
        console.log('🚪 Force logout completed');
      } catch (error) {
        console.error('Error during force logout:', error);
      }
    };

    forceLogout();
  }, []);

  // Redirect to home page after logout
  return <Navigate to="/" replace />;
};

export default Logout;
