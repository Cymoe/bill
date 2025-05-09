import React, { useState, useEffect } from 'react';
import { ClientForm } from './ClientForm';
import { ClientInput } from '../../lib/database.types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface MobileNewClientModalProps {
  onClose: () => void;
  onSave: (client: ClientInput) => void;
}

export const MobileNewClientModal: React.FC<MobileNewClientModalProps> = ({ onClose, onSave }) => {
  const [isClosing, setIsClosing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  const handleSubmit = async (formData: any) => {
    try {
      const clientData: ClientInput = {
        company_name: formData.company,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        address: formData.address || null,
        user_id: user?.id
      };

      setIsClosing(true);
      setTimeout(() => onSave(clientData), 300);
    } catch (err) {
      console.error('Error creating client:', err);
      throw err;
    }
  };

  return (
    <div className="fixed inset-0 z-[60]">
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-50'
        }`}
        onClick={handleClose}
      />
      
      <div 
        className={`
          fixed w-full
          transition-transform duration-300 ease-out 
          bg-white dark:bg-gray-800 
          shadow-xl
          overflow-hidden
          inset-x-0 bottom-0
          h-full
          transform
          ${isClosing ? 'translate-y-full' : 'translate-y-0'}
        `}
      >
        <ClientForm
          title="New Client"
          onClose={handleClose}
          onSubmit={handleSubmit}
          submitLabel="Create Client"
        />
      </div>
    </div>
  );
}; 