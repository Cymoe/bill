import React, { useState, useEffect, useContext } from 'react';
import { InvoiceService } from '../../services/InvoiceService';
import { OrganizationContext } from '../layouts/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { InvoiceForm } from './InvoiceForm';

interface MobileNewInvoiceModalProps {
  onClose: () => void;
  onSave: () => void;
}

export const MobileNewInvoiceModal: React.FC<MobileNewInvoiceModalProps> = ({ onClose, onSave }) => {
  const { selectedOrg } = useContext(OrganizationContext);
  const { user } = useAuth();
  const [isClosing, setIsClosing] = useState(false);

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
    if (!selectedOrg?.id || !user?.id) {
      console.error("Organization or user not available. Cannot create invoice.");
      return;
    }
    try {
      const invoicePayload = { 
        organization_id: selectedOrg.id,
        user_id: user.id,
        client_id: formData.client,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: formData.dueDate,
        notes: formData.description,
        status: 'draft' as const,
        items: formData.items || []
      };
      await InvoiceService.create(invoicePayload);
      setIsClosing(true);
      setTimeout(onSave, 300);
    } catch (err) {
      console.error('Error creating invoice:', err);
      throw err;
    }
  };

  return (
    <div className="fixed inset-0 z-[10000]">
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
          h-[100vh]
          transform
          ${isClosing ? 'translate-y-full' : 'translate-y-0'}
        `}
      >
        <InvoiceForm
          onSubmit={handleSubmit}
          onCancel={handleClose}
        />
      </div>
    </div>
  );
}; 