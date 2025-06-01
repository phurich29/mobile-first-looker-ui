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
      <div className="container mx-auto p-0">
        <div className="w-full">
          <NewsManagementView />
        </div>
      </div>
    </AppLayout>
  );
}
