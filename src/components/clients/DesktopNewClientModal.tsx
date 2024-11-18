import React, { useState, useEffect } from 'react';
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ClientForm } from './ClientForm';
import { ClientInput } from '../../lib/database.types';

interface DesktopNewClientModalProps {
  onClose: () => void;
  onSave: (client: ClientInput) => void;
}

export const DesktopNewClientModal: React.FC<DesktopNewClientModalProps> = ({ onClose, onSave }) => {
  const [isClosing, setIsClosing] = useState(false);
  const createClient = useMutation(api.clients.createClient);

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
        company: formData.company,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
      };
      await createClient(clientData);
      setIsClosing(true);
      setTimeout(() => onSave(clientData), 300);
    } catch (err) {
      console.error('Error creating client:', err);
      throw err;
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
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
          bg-white dark:bg-gray-800 
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