
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { NewsManagementView } from "@/features/news-management/components/NewsManagementView";
import { useAuth } from "@/components/AuthProvider";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { HomeIcon } from "lucide-react";

export default function NewsManagement() {
  // กำหนดให้ isAuthorized เป็น true ตลอดเวลา เพราะมีการตรวจสอบสิทธิ์แล้วที่ ProtectedRoute
  const isAuthorized = true;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {(
        <main className="container mx-auto px-4 pt-6 pb-32 md:pl-72 md:pr-8">
          <div className="mb-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/" className="flex items-center">
                    <HomeIcon className="h-3.5 w-3.5 mr-1" />
                    หน้าหลัก
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>จัดการข่าวสาร</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <NewsManagementView />
          </div>
        </main>
      )}
      
      <FooterNav />
    </div>
  );
}
