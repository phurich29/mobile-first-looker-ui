
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, User } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { getTranslatedRoleDescription, getCurrentUserHighestRole } from "../constants/roleDescriptions";
import { useTranslation } from "@/hooks/useTranslation";

export function CurrentUserRoleCard() {
  const { t } = useTranslation();
  const { userRoles } = useAuth();
  
  const highestRole = getCurrentUserHighestRole(userRoles);
  const roleDescription = getTranslatedRoleDescription(highestRole);
  
  if (!roleDescription) {
    return null;
  }

  return (
    <Card className="mb-6 dark:bg-slate-800 dark:border-slate-700">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-700/30">
            <User className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <CardTitle className="text-lg dark:text-gray-100">{t('userManagement', 'currentUserRights')}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={`${roleDescription.bgColor} ${roleDescription.color} hover:${roleDescription.bgColor}/80`}>
                {roleDescription.name}
              </Badge>
              {userRoles.length > 1 && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  (+{userRoles.length - 1} {t('userManagement', 'additionalRights')})
                </span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid gap-3">
          <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">{t('userManagement', 'rightsDetails')}</h4>
          <div className="space-y-2">
            {roleDescription.permissions.map((permission, index) => (
              <div key={index} className="flex items-start gap-3 p-2 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                <div className={`p-1 rounded-full ${permission.allowed ? 'bg-green-100 dark:bg-green-700/30' : 'bg-red-100 dark:bg-red-700/30'}`}>
                  {permission.allowed ? (
                    <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                  ) : (
                    <X className="h-3 w-3 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <permission.icon className={`h-4 w-4 ${permission.allowed ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'}`} />
                  <span className={`text-sm ${permission.allowed ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-500'}`}>
                    {permission.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
