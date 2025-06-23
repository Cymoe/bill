import React from 'react';

export interface IndustryIconProps {
  size?: number;
  className?: string;
  color?: string;
}

// Render industry icon with props - returning null to use emoji fallback
export const renderIndustryIcon = (
  slug: string, 
  props: IndustryIconProps = {}
): React.ReactElement | null => {
  // Return null to use the emoji icons from the database
  return null;
};