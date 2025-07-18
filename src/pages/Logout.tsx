
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { useQueryClient } from '@tanstack/react-query';

const Logout = () => {
  const { signOut } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Cancel all ongoing queries immediately
        await queryClient.cancelQueries();
        
        // Clear all cached data
        queryClient.clear();
        
        // Force sign out
        await signOut();
      } catch (error) {
        console.error('Error signing out:', error);
        // Force redirect even if signOut fails
      }
    };

    handleLogout();
  }, [signOut, queryClient]);

  // Redirect to login page
  return <Navigate to="/auth" replace />;
};

export default Logout;
