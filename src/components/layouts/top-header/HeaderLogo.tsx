
import React from 'react';

interface HeaderLogoProps {
  logoSrc: string;
  logoAlt: string;
  appName: string;
}

export const HeaderLogo: React.FC<HeaderLogoProps> = ({
  logoSrc,
  logoAlt,
  appName
}) => {
  return (
    <div className="flex items-center gap-2">
      <img src={logoSrc} alt={logoAlt} className="h-8 w-auto rounded-full" />
      <span className="text-lg font-semibold text-white">{appName}</span>
    </div>
  );
};
