import { AppLayout } from "@/components/layouts/app-layout"; 
import { BackgroundImage } from "@/components/graph-monitor/BackgroundImage";
import { NewsManagementView } from "@/features/news-management/components/NewsManagementView";
// useAuth is not used, removed for now. Add back if needed.
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { HomeIcon } from "lucide-react";
// Header and FooterNav are handled by AppLayout

export default function NewsManagement() {
  return (
    <AppLayout showFooterNav={true} contentPaddingBottom="pb-32">
      <BackgroundImage />
      <div className="container mx-auto px-4 pt-6">
        <div className="mb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="flex items-center dark:text-gray-400 dark:hover:text-gray-200">
                  <HomeIcon className="h-3.5 w-3.5 mr-1 dark:text-gray-400" />
                  หน้าหลัก
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="dark:text-gray-500" />
              <BreadcrumbItem>
                <BreadcrumbPage className="dark:text-gray-200">จัดการข่าวสาร</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="bg-white dark:bg-slate-800 dark:border dark:border-slate-700 rounded-xl shadow-sm p-6 w-full">
          <NewsManagementView />
        </div>
      </div>
    </AppLayout>
  );
}
