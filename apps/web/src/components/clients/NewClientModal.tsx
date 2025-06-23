import React from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { MobileNewClientModal } from './MobileNewClientModal';
import { DesktopNewClientModal } from './DesktopNewClientModal';
import { ClientInput } from '../../lib/database.types';

interface NewClientModalProps {
  onClose: () => void;
  onSave: (client: ClientInput) => void;
}

export const NewClientModal: React.FC<NewClientModalProps> = (props) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Don't render anything until we know the screen size
  if (isMobile === null) return null;
  
  return isMobile ? (
    <MobileNewClientModal {...props} />
  ) : (
    <DesktopNewClientModal {...props} />
  );
};
