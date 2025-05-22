import React from 'react';

interface PageHeaderProps {
  title?: string;
  actionButton?: React.ReactNode;
  children?: React.ReactNode;
  hideTitle?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  actionButton,
  children,
  hideTitle = false,
}) => {
  const hasContent = (!hideTitle && title) || actionButton || children;
  if (!hasContent) return null;
  return (
    <div className="h-[40px] px-0 flex justify-between items-center border-b border-gray-700">
      {!hideTitle && title && (
        <h1 className="font-['Roboto_Condensed'] font-bold text-[24px] leading-[28px] uppercase text-white m-0 p-0 page-title">
          {title}
        </h1>
      )}
      {!title && <div></div>}
      <div className="flex items-center gap-2">
        {actionButton}
        {children}
      </div>
    </div>
  );
};
