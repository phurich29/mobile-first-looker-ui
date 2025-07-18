
import React, { useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

export default function Logout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const performImmediateLogout = async () => {
      console.log('🚀 Immediate logout sequence started');
      
      try {
        // 1. Cancel all ongoing queries immediately
        console.log('🛑 Cancelling all ongoing queries...');
        await queryClient.cancelQueries();
        
        // 2. Clear all query cache
        console.log('🗑️ Clearing query cache...');
        queryClient.clear();
        
        // 3. Reset all query state
        console.log('🔄 Resetting query client...');
        queryClient.resetQueries();
        
        // 4. Clear localStorage and sessionStorage immediately
        console.log('🧹 Clearing storage...');
        localStorage.clear();
        sessionStorage.clear();
        
        // 5. Sign out immediately (don't wait for promise)
        console.log('👋 Signing out...');
        await signOut();
        
        // 6. Force navigation to login immediately
        console.log('🏠 Redirecting to login...');
        navigate('/auth/login', { replace: true });
        
        console.log('✅ Immediate logout completed successfully');
        
      } catch (error) {
        console.error('❌ Logout error:', error);
        // Force navigation even if logout fails
        navigate('/auth/login', { replace: true });
      }
    };

    performImmediateLogout();
  }, [signOut, navigate, queryClient]);

  // Show minimal loading during logout process
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">กำลังออกจากระบบ...</p>
        <p className="text-gray-400 text-sm mt-2">กรุณารอสักครู่</p>
      </div>
    </div>
  );
}
