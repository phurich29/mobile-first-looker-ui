
import React from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layouts/app-layout";
import { useIsMobile } from "@/hooks/use-mobile";

interface UnauthorizedAccessProps {
  isGuest: boolean;
}

export const UnauthorizedAccess: React.FC<UnauthorizedAccessProps> = ({ isGuest }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <AppLayout showFooterNav={true} contentPaddingBottom={isMobile ? 'pb-32' : 'pb-4'}>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {isGuest ? 'ไม่พบอุปกรณ์ที่เปิดให้ Guest เข้าถึง' : 'ไม่พบอุปกรณ์ที่คุณมีสิทธิ์เข้าถึง'}
          </h2>
          <p className="text-gray-600 mb-4">
            {isGuest 
              ? 'อุปกรณ์นี้ไม่ได้เปิดให้ผู้เยี่ยมชมเข้าถึง กรุณาติดต่อผู้ดูแลระบบ' 
              : 'กรุณาติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์เข้าถึงอุปกรณ์นี้'
            }
          </p>
          
          <button 
            onClick={() => navigate('/equipment')} 
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            กลับไปหน้าอุปกรณ์
          </button>
        </div>
      </div>
    </AppLayout>
  );
};
