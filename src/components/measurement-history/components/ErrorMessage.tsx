
import React from 'react';
import { AppLayout } from "@/components/layouts/app-layout";
import { useIsMobile } from "@/hooks/use-mobile";

interface ErrorMessageProps {
  title: string;
  description: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ title, description }) => {
  const isMobile = useIsMobile();
  
  return (
    <AppLayout showFooterNav={true} contentPaddingBottom={isMobile ? 'pb-32' : 'pb-8'}>
      <div className="flex flex-col flex-1 min-h-full bg-gradient-to-b from-emerald-50 to-gray-50 overflow-x-hidden">
        <main className="flex-1 overflow-x-hidden">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
            <h3 className="text-lg font-medium text-red-600 mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
          </div>
        </main>
      </div>
    </AppLayout>
  );
};

export default ErrorMessage;
