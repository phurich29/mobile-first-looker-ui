
import { Link } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";

export const HeaderMainContent = () => {
  const { userRoles } = useAuth();
  const isAdmin = userRoles.includes("admin");
  
  return (
    <div className="flex items-center">
      <Link to="/" className="flex items-center gap-2">
        <span className="font-bold text-lg text-emerald-600 dark:text-emerald-500">RiceFlow</span>
      </Link>
    </div>
  );
};
