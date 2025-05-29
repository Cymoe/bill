import React, { useState, useEffect } from 'react';
import { X, Plus, FileText } from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { InvoiceForm } from './InvoiceForm';

interface DesktopNewInvoiceModalProps {
  onClose: () => void;
  onSave: () => void;
}

export const DesktopNewInvoiceModal: React.FC<DesktopNewInvoiceModalProps> = ({ onClose, onSave }) => {
  const [step, setStep] = useState<'select' | 'template' | 'create'>('select');
  const [isClosing, setIsClosing] = useState(false);
  const createInvoice = useMutation(api.invoices.createInvoice);
  const templates = useQuery(api.templates.getTemplates) || [];

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
      await createInvoice(formData);
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
          step={step}
          setStep={setStep}
          templates={templates}
          onClose={handleClose}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}; 