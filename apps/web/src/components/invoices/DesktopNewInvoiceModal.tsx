import React, { useState, useEffect, useContext } from 'react';
import { InvoiceService } from '../../services/InvoiceService';
import { OrganizationContext } from '../layouts/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { InvoiceForm } from './InvoiceForm';

interface DesktopNewInvoiceModalProps {
  onClose: () => void;
  onSave: () => void;
}

export const DesktopNewInvoiceModal: React.FC<DesktopNewInvoiceModalProps> = ({ onClose, onSave }) => {
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
        status: 'draft' as const, // Default status
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
    <div className="fixed inset-0 z-[10000] flex justify-end">
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-50'
        }`}
        onClick={handleClose}
      />
      
      <div 
        className={`
          relative w-[600px]
          transition-transform duration-300 ease-out 
          bg-white dark:bg-gray-800 
          shadow-xl
          overflow-hidden
          h-full
          transform
          ${isClosing ? 'translate-x-full' : 'translate-x-0'}
        `}
      >
        <InvoiceForm
          onSubmit={handleSubmit}
          onCancel={handleClose}
          // The props below were removed as they are not part of InvoiceFormProps
          // step={step}
          // setStep={setStep}
          // templates={templates}
        />
      </div>
    </div>
  );
}; 