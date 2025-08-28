import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Shield, Clock } from "lucide-react";

/**
 * Phase 4: User Info Card - แสดงข้อมูลผู้ใช้เพื่อการ debug
 */
export const UserInfoCard = () => {
  const { user, userRoles } = useAuth();

  // Show only in debug mode or development
  const isDebugMode = new URLSearchParams(window.location.search).get('debug') === 'true';
  if (!isDebugMode && process.env.NODE_ENV === 'production') {
    return null;
  }

  if (!user) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-yellow-700">
            <User className="w-4 h-4" />
            Debug: User Info
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-yellow-600">No authenticated user</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2 text-blue-700">
          <User className="w-4 h-4" />
          Debug: User Context
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <div className="text-xs">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-3 h-3 text-blue-600" />
            <span className="font-medium">ID:</span>
            <span className="font-mono text-blue-800 break-all">
              {user.id.substring(0, 8)}...
            </span>
          </div>
          
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-3 h-3 text-blue-600" />
            <span className="font-medium">Roles:</span>
            <span className="text-blue-800">
              {userRoles.length > 0 ? userRoles.join(', ') : 'user'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-blue-600" />
            <span className="font-medium">Session:</span>
            <span className="text-blue-800">Active</span>
          </div>
        </div>
        
        <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
          🔒 This card validates user context for security debugging
        </div>
      </CardContent>
    </Card>
  );
};

export default UserInfoCard;