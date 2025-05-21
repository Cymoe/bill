import React from 'react';

interface PageHeaderProps {
  title: string;
  actionButton?: React.ReactNode;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  actionButton,
  children,
}) => {
  return (
    <div className="h-[40px] px-3 flex justify-between items-center border-b border-gray-700">
      <h1 className="font-['Roboto_Condensed'] font-bold text-[24px] leading-[28px] uppercase text-white m-0 p-0 page-title">
        {title}
      </h1>
      {actionButton}
      {children}
    </div>
  );
};
