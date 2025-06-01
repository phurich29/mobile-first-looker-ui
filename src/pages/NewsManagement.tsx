
import { Header } from "@/components/Header";
import { BackgroundImage } from "@/components/graph-monitor/BackgroundImage"; // Added for dark mode background
import { FooterNav } from "@/components/FooterNav";
import { NewsManagementView } from "@/features/news-management/components/NewsManagementView";
import { useAuth } from "@/components/AuthProvider";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { HomeIcon } from "lucide-react";

export default function NewsManagement() {
  // กำหนดให้ isAuthorized เป็น true ตลอดเวลา เพราะมีการตรวจสอบสิทธิ์แล้วที่ ProtectedRoute
  const isAuthorized = true;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 overflow-x-hidden relative"> {/* Added relative for BackgroundImage positioning */}
      <BackgroundImage /> {/* Added for dark mode background styling */}
      <Header />
      
      {(
        <main className="container mx-auto px-4 pt-6 pb-32 md:pl-72 md:pr-8 overflow-x-hidden">
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
        </main>
      )}
      
      <FooterNav />
    </div>
  );
}
