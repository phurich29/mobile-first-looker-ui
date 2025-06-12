
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';

const Logout = () => {
  const { signOut } = useAuth();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await signOut();
      } catch (error) {
        console.error('Error signing out:', error);
      }
    };

    handleLogout();
  }, [signOut]);

  // Redirect to home page after logout
  return <Navigate to="/" replace />;
};

export default Logout;
