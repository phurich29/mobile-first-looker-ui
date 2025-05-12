
import React from "react";

type SectionHeaderProps = {
  title: string;
  actionText?: string;
  onAction?: () => void;
};

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex justify-between items-center px-4 mb-3">
      <h2 className="text-lg font-bold">{title}</h2>
      {actionText && (
        <button
          onClick={onAction}
          className="text-sm text-crypto-c2etech font-medium"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
