
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  onClick?: () => void;
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick }) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (onClick) {
      onClick();
    } else {
      navigate("/equipment");
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleGoBack}
      className="mb-4 flex items-center text-gray-600 hover:bg-gray-100"
    >
      <ChevronLeft className="h-4 w-4 mr-1" />
      <span>ย้อนกลับ</span>
    </Button>
  );
};
