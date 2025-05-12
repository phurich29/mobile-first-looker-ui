import React from 'react';
import { ArrowRight } from 'lucide-react';

type PromotionBannerProps = {
  title: string;
  description: string;
  imageUrl?: string;
  actionText?: string;
  onAction?: () => void;
};

export const PromotionBanner = ({
  title,
  description,
  imageUrl = '/promotion-bg.jpg',
  actionText = 'อ่านเพิ่มเติม',
  onAction = () => console.log('Banner clicked')
}: PromotionBannerProps) => {
  return (
    <div 
      className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl mx-auto w-[90%] max-w-xl px-10 py-7 shadow-xl mb-6 text-white relative overflow-hidden flex flex-col justify-center"
      onClick={onAction}
    >
      {/* องค์ประกอบตกแต่งเพื่อเพิ่มมิติ */}
      <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
      <div className="absolute -top-2 -left-2 w-16 h-16 rounded-full bg-emerald-400/30"></div>
      
      {/* ถ้ามี URL รูปภาพ ใช้เป็นพื้นหลัง */}
      {imageUrl && (
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center" 
          style={{ backgroundImage: `url(${imageUrl})` }}
        ></div>
      )}
      
      <div className="relative z-10">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold mb-2 drop-shadow-md">{title}</h3>
            <p className="text-base font-medium opacity-90 max-w-[90%]">{description}</p>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 flex items-center shadow-lg border border-white/30">
            <ArrowRight className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
};
