
import { AppLayout } from "@/components/layouts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, BarChart3, Shield, Users, ExternalLink, Phone } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function AboutRiceflow() {
  const { t } = useTranslation();
  
  return (
    <AppLayout showFooterNav contentPaddingBottom="pb-32 md:pb-16">
      {/* Background decorative elements */}
      <div className="absolute top-20 right-8 w-32 h-32 bg-emerald-300 rounded-full filter blur-3xl opacity-10 -z-10"></div>
      <div className="absolute bottom-20 left-8 w-40 h-40 bg-blue-400 rounded-full filter blur-3xl opacity-10 -z-10"></div>
      
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-emerald-800 dark:text-emerald-400 mb-4">
            {t('aboutRiceflow', 'title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t('aboutRiceflow', 'subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="bg-white/70 dark:bg-gray-800/40 backdrop-blur-sm border border-gray-100 dark:border-gray-800/30 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <CardTitle className="text-emerald-800 dark:text-emerald-400">
                  {t('aboutRiceflow', 'realTimeQuality')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                {t('aboutRiceflow', 'realTimeQualityDesc')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-800/40 backdrop-blur-sm border border-gray-100 dark:border-gray-800/30 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-emerald-800 dark:text-emerald-400">
                  {t('aboutRiceflow', 'smartAlerts')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                {t('aboutRiceflow', 'smartAlertsDesc')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-800/40 backdrop-blur-sm border border-gray-100 dark:border-gray-800/30 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Leaf className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-emerald-800 dark:text-emerald-400">
                  {t('aboutRiceflow', 'ecoFriendly')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                {t('aboutRiceflow', 'ecoFriendlyDesc')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-800/40 backdrop-blur-sm border border-gray-100 dark:border-gray-800/30 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-emerald-800 dark:text-emerald-400">
                  {t('aboutRiceflow', 'easyToUse')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                {t('aboutRiceflow', 'easyToUseDesc')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Equipment Image Section */}
        <div className="mb-12">
          <img 
            src="/lovable-uploads/49e4e3a9-d748-4edf-bd4f-726dd0b9fde9.png" 
            alt={t('aboutRiceflow', 'altText')} 
            className="w-full h-auto rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
          />
        </div>

        {/* About Section */}
        <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border border-emerald-200 dark:border-emerald-800/30">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400 mb-4 text-center">
              {t('aboutRiceflow', 'whyChoose')}
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                {t('aboutRiceflow', 'description1')}
              </p>
              <p>
                {t('aboutRiceflow', 'description2')}
              </p>
              <p>
                {t('aboutRiceflow', 'description3')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <h3 className="text-xl font-semibold text-emerald-800 dark:text-emerald-400 mb-4">
            {t('aboutRiceflow', 'readyToStart')}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {t('aboutRiceflow', 'contactUs')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              asChild
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-lg"
            >
              <a 
                href="tel:064-6545636"
                className="inline-flex items-center gap-2"
              >
                <Phone className="h-5 w-5" />
                {t('aboutRiceflow', 'callPhone')}
              </a>
            </Button>
            
            <Button 
              asChild
              variant="outline"
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-6 py-3"
            >
              <a 
                href="https://c2tech.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                {t('aboutRiceflow', 'visitWebsite')}
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
