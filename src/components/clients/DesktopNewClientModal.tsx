import React, { useState, useEffect } from 'react';
import { useAuth } from "../../contexts/AuthContext";
import { ClientForm } from './ClientForm';
import type { Tables } from '../../lib/database';

interface DesktopNewClientModalProps {
  onClose: () => void;
  onSave: (client: Omit<Tables['clients'], 'id' | 'created_at'>) => void;
}

export const DesktopNewClientModal: React.FC<DesktopNewClientModalProps> = ({ onClose, onSave }) => {
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

  const handleSubmit = async (formData: {
    company_name: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
  }) => {
    if (!user) return;

    try {
      const clientData: Omit<Tables['clients'], 'id' | 'created_at'> = {
        user_id: user.id,
        company_name: formData.company_name,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
      };
      setIsClosing(true);
      setTimeout(() => onSave(clientData), 300);
    } catch (err) {
      console.error('Error creating client:', err);
      throw err;
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex justify-end">
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-50'
        }`}
        onClick={handleClose}
      />
      
      <div 
        className={`
          md:w-full md:max-w-md
          transition-transform duration-300 ease-out 
          bg-[#121212] 
          shadow-xl
          overflow-hidden
          h-full
          transform
          ${isClosing ? 'translate-x-full' : 'translate-x-0'}
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