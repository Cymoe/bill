import React from 'react';
import { X, Plus, FileText, Trash2, Minus } from 'lucide-react';
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";
import { formatCurrency } from '../../utils/format';

interface InvoiceFormProps {
  step: 'select' | 'template' | 'create';
  setStep: (step: 'select' | 'template' | 'create') => void;
  templates: Doc<"templates">[];
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  step,
  setStep,
  templates,
  onClose,
  onSubmit
}) => {
  const clients = useQuery(api.clients.getClients) || [];
  const products = useQuery(api.products.getProducts) || [];

  const [formData, setFormData] = React.useState({
    number: `INV-${Date.now()}`,
    clientId: '' as Id<"clients">,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'draft' as const,
    items: [] as Array<{
      productId: Id<"products">;
      quantity: number;
      price: number;
    }>
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleTemplateSelect = (template: Doc<"templates">) => {
    setFormData(prev => ({
      ...prev,
      items: template.items
    }));
    setStep('create');
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: '' as Id<"products">, quantity: 1, price: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: keyof typeof formData.items[0], value: string | number) => {
    const newItems = [...formData.items];
    if (field === 'productId') {
      const product = products.find(p => p._id === value);
      newItems[index] = {
        ...newItems[index],
        productId: value as Id<"products">,
        price: product ? product.price : 0
      };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await onSubmit({
        ...formData,
        total_amount: calculateTotal()
      });
    } catch (err) {
      setError('Failed to submit form');
      setLoading(false);
    }
  };

  // Render the appropriate step content
  if (step === 'select') {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-8">
          How would you like to create your invoice?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          {/* ... rest of the select step UI ... */}
        </div>
      </div>
    );
  }

  if (step === 'template') {
    return (
      <div className="p-4">
        <div className="space-y-4">
          {/* ... rest of the template step UI ... */}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <form id="invoice-form" onSubmit={handleSubmit} className="space-y-6">
        {/* ... rest of the create step UI ... */}
      </form>
    </div>
  );
}; 