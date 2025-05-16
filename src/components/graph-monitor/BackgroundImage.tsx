
import React from "react";

export const BackgroundImage: React.FC = () => {
  return (
    <div 
      className="fixed inset-0 z-[-1] bg-cover bg-center bg-no-repeat opacity-10"
      style={{ 
        backgroundImage: "url('/rice-background.jpg')",
        filter: "contrast(120%) brightness(60%)"
      }}
    />
  );
};
