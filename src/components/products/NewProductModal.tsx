import React from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { MobileNewProductModal } from './MobileNewProductModal';
import { DesktopNewProductModal } from './DesktopNewProductModal';

interface NewProductModalProps {
  onClose: () => void;
  onSave: () => void;
}

export const NewProductModal: React.FC<NewProductModalProps> = (props) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  if (isMobile === null) return null;
  
  return isMobile ? (
    <MobileNewProductModal {...props} />
  ) : (
    <DesktopNewProductModal {...props} />
  );
};
