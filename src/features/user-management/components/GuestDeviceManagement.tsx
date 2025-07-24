
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Settings, Search, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/useTranslation";

interface Device {
  device_code: string;
  display_name?: string;
}

interface GuestDeviceAccess {
  device_code: string;
  enabled: boolean;
}

export const GuestDeviceManagement = () => {
  const { t } = useTranslation();
  const [devices, setDevices] = useState<Device[]>([]);
  const [guestAccess, setGuestAccess] = useState<GuestDeviceAccess[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDevicesAndGuestAccess();
  }, []);

  const fetchDevicesAndGuestAccess = async () => {
    try {
      setIsLoading(true);

      // 1. Fetch managed devices from guest_device_access
      const { data: guestData, error: guestError } = await supabase
        .from('guest_device_access')
        .select('device_code, enabled');

      if (guestError) throw guestError;

      const managedDeviceCodes = guestData.map(g => g.device_code);
      setGuestAccess(guestData); // Set guest access state directly

      if (managedDeviceCodes.length > 0) {
        // 2. Fetch display names for these managed devices
        const { data: settingsData, error: settingsError } = await supabase
          .from('device_settings')
          .select('device_code, display_name')
          .in('device_code', managedDeviceCodes);

        if (settingsError) throw settingsError;

        const devicesWithNames = managedDeviceCodes.map(code => {
          const setting = settingsData?.find(s => s.device_code === code);
          return {
            device_code: code,
            display_name: setting?.display_name || code, // Fallback to code
          };
        });
        setDevices(devicesWithNames);
      } else {
        // No devices are being managed yet
        setDevices([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: t('general', 'error'),
        description: t('userManagement', 'errorLoadingDevices'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: t('userManagement', 'pleaseEnterData'),
        description: t('userManagement', 'pleaseEnterDeviceCode'),
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSearching(true);
      
      // Search for devices that contain the search query
      const { data: searchData, error: searchError } = await supabase
        .from('rice_quality_analysis')
        .select('device_code')
        .ilike('device_code', `%${searchQuery}%`)
        .not('device_code', 'is', null);

      if (searchError) throw searchError;

      // Get unique device codes from search results
      const uniqueSearchDevices = Array.from(
        new Set(searchData?.map(d => d.device_code))
      ).map(code => ({ device_code: code }));

      // Fetch display names for search results
      const { data: settingsData } = await supabase
        .from('device_settings')
        .select('device_code, display_name')
        .in('device_code', uniqueSearchDevices.map(d => d.device_code));

      const searchResultsWithNames = uniqueSearchDevices.map(device => {
        const setting = settingsData?.find(s => s.device_code === device.device_code);
        return {
          device_code: device.device_code,
          display_name: setting?.display_name
        };
      });

      setSearchResults(searchResultsWithNames);

      if (searchResultsWithNames.length === 0) {
        toast({
          title: t('userManagement', 'noSearchResults'),
          description: t('userManagement', 'noDevicesMatchSearch'),
        });
      } else {
        toast({
          title: t('userManagement', 'searchSuccess'),
          description: `${t('device', 'totalDevicesInSystem')} ${searchResultsWithNames.length} ${t('userManagement', 'devicesFound')}`,
        });
      }
    } catch (error) {
      console.error('Error searching devices:', error);
      toast({
        title: t('general', 'error'),
        description: t('userManagement', 'errorSearching'),
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddDeviceFromSearch = async (device: Device) => {
    // Check if device already exists in the list
    const existingDevice = devices.find(d => d.device_code === device.device_code);
    if (existingDevice) {
      toast({
        title: t('userManagement', 'deviceExists'),
        description: t('userManagement', 'deviceExistsDescription'),
      });
      return;
    }

    const newDeviceAccess = { device_code: device.device_code, enabled: false };

    // Optimistic UI update
    setDevices(prev => [...prev, device]);
    setGuestAccess(prev => [...prev, newDeviceAccess]);
    setSearchResults(prev => prev.filter(d => d.device_code !== device.device_code));

    try {
      // Persist to DB
      const { error } = await supabase
        .from('guest_device_access')
        .upsert(newDeviceAccess, { onConflict: 'device_code' });

      if (error) throw error;

      toast({
        title: t('userManagement', 'addDeviceSuccess'),
        description: `${t('userManagement', 'add')} ${device.device_code} ${t('userManagement', 'deviceAdded')}`,
      });
    } catch (error) {
      // Revert UI on error
      setDevices(prev => prev.filter(d => d.device_code !== device.device_code));
      setGuestAccess(prev => prev.filter(a => a.device_code !== device.device_code));
      setSearchResults(prev => [...prev, device]); // Add back to search results

      console.error('Error adding device to guest access:', error);
      toast({
        title: t('general', 'error'),
        description: t('userManagement', 'errorAddingDevice'),
        variant: "destructive",
      });
    }
  };

  const handleToggleAccess = async (deviceCode: string) => {
    const currentAccess = guestAccess.find(a => a.device_code === deviceCode);
    const newEnabledState = !currentAccess?.enabled;

    const originalGuestAccess = [...guestAccess];

    // Optimistic UI update
    setGuestAccess(prev =>
      prev.map(access =>
        access.device_code === deviceCode
          ? { ...access, enabled: newEnabledState }
          : access
      )
    );

    try {
      const { error } = await supabase
        .from('guest_device_access')
        .upsert({ device_code: deviceCode, enabled: newEnabledState }, { onConflict: 'device_code' });

      if (error) throw error;

      toast({
        title: t('userManagement', 'updateSuccess'),
        description: `${deviceCode} ${t('userManagement', 'accessRightsUpdated')}`,
      });

    } catch (error) {
      // Revert UI on error
      setGuestAccess(originalGuestAccess);
      console.error('Error updating guest access:', error);
      toast({
        title: t('general', 'error'),
        description: t('userManagement', 'errorSavingSettings'),
        variant: "destructive",
      });
    }
  };

  const handleRemoveDevice = async (deviceCode: string) => {
    const oldDevices = [...devices];
    const oldGuestAccess = [...guestAccess];

    // Optimistic UI update
    setDevices(prev => prev.filter(d => d.device_code !== deviceCode));
    setGuestAccess(prev => prev.filter(a => a.device_code !== deviceCode));

    try {
      const { error } = await supabase
        .from('guest_device_access')
        .delete()
        .eq('device_code', deviceCode);

      if (error) throw error;

      toast({
        title: t('userManagement', 'removeDeviceSuccess'),
        description: `${deviceCode} ${t('userManagement', 'deviceRemoved')}`,
      });

    } catch (error) {
      // Revert UI on error
      setDevices(oldDevices);
      setGuestAccess(oldGuestAccess);

      console.error('Error removing device:', error);
      toast({
        title: t('general', 'error'),
        description: t('userManagement', 'errorRemovingDevice'),
        variant: "destructive",
      });
    }
  };

  const enabledCount = guestAccess.filter(access => access.enabled).length;

  if (isLoading) {
    return (
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
            <Settings className="h-5 w-5" />
            {t('userManagement', 'guestDeviceManagement')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="dark:bg-slate-800 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
          <Settings className="h-5 w-5" />
          {t('userManagement', 'guestDeviceManagement')}
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('userManagement', 'guestDescription')}
        </p>
        <div className="text-sm text-emerald-600 dark:text-emerald-400">
          {t('userManagement', 'selectedDevices')} {enabledCount} {t('userManagement', 'fromDevices')} {devices.length} {t('userManagement', 'devices')}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Form */}
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700">
          <div className="space-y-2">
            <Label htmlFor="search-device" className="text-sm font-medium">
              {t('userManagement', 'searchAdditionalDevices')}
            </Label>
            <div className="flex gap-2">
              <Input
                id="search-device"
                type="text"
                placeholder={t('userManagement', 'enterDeviceCode')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button 
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-700 dark:hover:bg-emerald-800"
              >
                <Search className="h-4 w-4 mr-2" />
                {isSearching ? t('userManagement', 'searching') : t('userManagement', 'search')}
              </Button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('userManagement', 'searchResults')}</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {searchResults.map((device) => (
                  <div
                    key={device.device_code}
                    className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 border rounded"
                  >
                    <div>
                      <div className="font-medium">{device.display_name || device.device_code}</div>
                      {device.display_name && device.display_name !== device.device_code && (
                        <div className="text-xs text-gray-500">{device.device_code}</div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddDeviceFromSearch(device)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {t('userManagement', 'add')}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Device List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
          {devices.map((device) => {
            const access = guestAccess.find(a => a.device_code === device.device_code);
            const isEnabled = access?.enabled || false;
            
            return (
              <div
                key={device.device_code}
                className={`flex items-center space-x-2 p-2 rounded-lg border ${
                  isEnabled 
                    ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' 
                    : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                }`}
              >
                <Checkbox
                  id={`guest-${device.device_code}`}
                  checked={isEnabled}
                  onCheckedChange={() => handleToggleAccess(device.device_code)}
                />
                <div className="flex-1 min-w-0">
                  <label 
                    htmlFor={`guest-${device.device_code}`}
                    className="text-sm font-medium cursor-pointer dark:text-gray-200"
                  >
                    {device.display_name || device.device_code}
                  </label>
                  {device.display_name && device.display_name !== device.device_code && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {device.device_code}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 flex items-center space-x-1">
                  {isEnabled ? (
                    <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/50"
                    onClick={() => handleRemoveDevice(device.device_code)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {devices.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {t('userManagement', 'noDevicesFound')}
          </div>
        )}


      </CardContent>
    </Card>
  );
};
