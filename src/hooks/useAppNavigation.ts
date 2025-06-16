
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';

export const useAppNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userRoles } = useAuth();

  const navigateTo = (path: string, options?: { replace?: boolean }) => {
    navigate(path, options);
  };

  const goBack = () => {
    const pathname = location.pathname;
    const parts = pathname.split('/').filter(part => part !== ''); // Filter out empty strings from leading/trailing slashes

    // Check if it's a device-specific subpage e.g., /device/DEVICE_CODE/subpath
    if (parts.length === 3 && parts[0] === 'device') {
      // Path is /device/DEVICE_CODE/SUBPATH, navigate to /device/DEVICE_CODE/
      navigate(`/device/${parts[1]}/`);
    } else if (parts.length === 2 && parts[0] === 'device') {
      // Path is /device/DEVICE_CODE, navigate to /equipment or a general overview page
      // Assuming /equipment is the general listing page for devices
      navigate('/equipment');
    } else {
      // For any other path, or if the logic above doesn't fit, use standard browser back
      navigate(-1);
    }
  };

  const goToLogin = () => {
    navigate('/auth/login', { replace: true });
  };

  const goToHome = () => {
    navigate('/', { replace: true });
  };

  const goToProfile = () => {
    if (user) {
      navigate('/profile');
    } else {
      goToLogin();
    }
  };

  const goToAdmin = () => {
    if (userRoles.includes('admin') || userRoles.includes('superadmin')) {
      navigate('/admin');
    } else {
      goToHome();
    }
  };

  const canAccess = (requiredRoles?: string[]) => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    if (!user) return false;
    return requiredRoles.some(role => userRoles.includes(role));
  };

  const isCurrentPath = (path: string) => {
    return location.pathname === path;
  };

  const isPathActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return {
    navigateTo,
    goBack,
    goToLogin,
    goToHome,
    goToProfile,
    goToAdmin,
    canAccess,
    isCurrentPath,
    isPathActive,
    currentPath: location.pathname,
    user,
    userRoles,
  };
};
