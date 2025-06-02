
import { BackButton } from "@/components/ui/back-button";

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean; // New optional prop
}

export const PageHeader = ({ title, showBackButton = true }: PageHeaderProps) => { // Default to true
  return (
    <div className="mb-6">
      <div className="flex items-center mb-2">
        {showBackButton && <BackButton to="/" ariaLabel="กลับไปหน้าแรก" />}
        <h1 className={`text-2xl font-bold text-gray-800 dark:text-gray-100 ${showBackButton ? '' : 'ml-0'}`}>{title}</h1>
      </div>
    </div>
  );
};
