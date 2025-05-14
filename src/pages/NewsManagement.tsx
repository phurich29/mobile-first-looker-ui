
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { NewsManagementView } from "@/features/news-management/components/NewsManagementView";
import { AuthorizationCheck } from "@/features/news-management/components/AuthorizationCheck";
import { useAuth } from "@/components/AuthProvider";

export default function NewsManagement() {
  const { user, userRoles } = useAuth();
  
  // Check if the user has authorization to access this page
  const isAuthorized = userRoles.some(role => ["admin", "superadmin"].includes(role));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <AuthorizationCheck isAuthorized={isAuthorized} />
      
      {isAuthorized && (
        <main className="container mx-auto px-4 pt-8 pb-32">
          <NewsManagementView />
        </main>
      )}
      
      <FooterNav />
    </div>
  );
}
