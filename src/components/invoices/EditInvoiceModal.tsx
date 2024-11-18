import React, { useState } from 'react';
import { X, Plus, Trash2, Minus } from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { formatCurrency } from '../../utils/format';

type Invoice = Doc<"invoices">;

interface EditInvoiceModalProps {
  invoice: Invoice;
  onClose: () => void;
  onSave: () => void;
}

export const EditInvoiceModal: React.FC<EditInvoiceModalProps> = ({
  invoice,
  onClose,
  onSave
}) => {
  // Format dates for input fields (YYYY-MM-DD)
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    number: invoice.number,
    clientId: invoice.clientId,
    date: formatDateForInput(invoice.date),
    dueDate: formatDateForInput(invoice.dueDate),
    status: invoice.status,
    items: invoice.items
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const products = useQuery(api.products.getProducts) || [];
  const updateInvoice = useMutation(api.invoices.updateInvoice);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
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

  const adjustQuantity = (index: number, amount: number) => {
    const newItems = [...formData.items];
    const newQuantity = Math.max(1, newItems[index].quantity + amount);
    newItems[index] = { ...newItems[index], quantity: newQuantity };
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

      await updateInvoice({
        id: invoice._id,
        ...formData,
        total_amount: calculateTotal()
      });

      setIsClosing(true);
      setTimeout(onSave, 300);
    } catch (err) {
      console.error('Error updating invoice:', err);
      setError('Failed to update invoice');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex md:justify-start">
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-50'
        }`}
        onClick={handleClose}
      />
      
      <div 
        className={`
          fixed md:w-[600px] 
          transition-transform duration-300 ease-out 
          bg-white dark:bg-gray-800 
          shadow-xl
          overflow-hidden
          md:left-0 md:top-0 md:bottom-0
          md:rounded-r-2xl
          bottom-0 left-0 right-0 h-full md:h-auto
          transform
          ${isClosing 
            ? 'translate-y-full md:translate-y-0 md:translate-x-[-100%]' 
            : 'translate-y-0 md:translate-x-0'
          }
        `}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Invoice</h2>
            <button onClick={handleClose} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <form id="invoice-form" onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as typeof formData.status }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Items</h3>
                  {formData.items.length > 0 && (
                    <button
                      type="button"
                      onClick={addItem}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <Plus className="w-5 h-5" />
                      Add Item
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div key={index} className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Product
                        </label>
                        <select
                          value={item.productId}
                          onChange={(e) => updateItem(index, 'productId', e.target.value)}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        >
                          <option value="">Select a product</option>
                          {products.map((product) => (
                            <option key={product._id} value={product._id}>
                              {product.name} - {formatCurrency(product.price)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Quantity
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => adjustQuantity(index, -1)}
                              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                              className="w-20 text-center border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              min="1"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => adjustQuantity(index, 1)}
                              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="col-span-3">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Price
                          </label>
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>

                        <div className="col-span-3 flex items-end">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Total: {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>

                        <div className="col-span-2 flex items-end justify-end">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {index === formData.items.length - 1 && (
                        <button
                          type="button"
                          onClick={addItem}
                          className="w-full flex items-center justify-center gap-2 p-2 mt-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          <Plus className="w-5 h-5" />
                          Add Item Below
                        </button>
                      )}
                    </div>
                  ))}

                  {formData.items.length === 0 && (
                    <button
                      type="button"
                      onClick={addItem}
                      className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <Plus className="w-5 h-5" />
                      Add Item
                    </button>
                  )}

                  {formData.items.length > 0 && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Total
                        </span>
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(calculateTotal())}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleClose}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="invoice-form"
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Invoice'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};