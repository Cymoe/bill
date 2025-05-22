import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type Client = {
  id: string;
  company_name: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  user_id: string;
  created_at: string;
};

interface EditClientModalProps {
  client: Client;
  onClose: () => void;
  onSave: () => void;
}

export const EditClientModal: React.FC<EditClientModalProps> = ({
  client,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    company_name: client.company_name,
    name: client.name,
    email: client.email,
    phone: client.phone || '',
    address: client.address || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('clients')
        .update({
          company_name: formData.company_name,
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          address: formData.address || null
        })
        .eq('id', client.id);

      if (error) throw error;

      setIsClosing(true);
      setTimeout(onSave, 300);
    } catch (err) {
      console.error('Error updating client:', err);
      setError('Failed to update client');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex md:justify-end">
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
          bg-[#121212] 
          shadow-xl
          overflow-hidden
          inset-x-0 bottom-0
          h-full
          md:relative md:w-full md:max-w-md
          transform
          ${isClosing 
            ? 'translate-y-full md:translate-y-0 md:translate-x-full' 
            : 'translate-y-0 md:translate-x-0'
          }
        `}
      >
        <div className="flex flex-col h-full bg-[#121212]">
          <div className="flex justify-between items-center p-4 border-b border-[#333333] bg-[#1E1E1E]">
            <h2 className="text-xl font-bold text-[#FFFFFF] font-['Roboto_Condensed'] uppercase">Edit Client</h2>
            <button onClick={handleClose} className="p-2 text-[#9E9E9E] hover:text-[#FFFFFF]">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-[#121212]">
            <form id="client-form" onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-[#D32F2F]/10 border border-[#D32F2F] rounded-[4px]">
                  <p className="text-sm text-[#D32F2F] font-['Roboto']">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#FFFFFF] mb-2 font-['Roboto'] uppercase tracking-wider">
                  COMPANY NAME
                </label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full border border-[#555555] rounded-[4px] p-3 bg-[#333333] text-[#FFFFFF] font-['Roboto'] focus:border-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/40"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#FFFFFF] mb-2 font-['Roboto'] uppercase tracking-wider">
                  CONTACT NAME
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-[#555555] rounded-[4px] p-3 bg-[#333333] text-[#FFFFFF] font-['Roboto'] focus:border-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/40"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#FFFFFF] mb-2 font-['Roboto'] uppercase tracking-wider">
                  EMAIL
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-[#555555] rounded-[4px] p-3 bg-[#333333] text-[#FFFFFF] font-['Roboto'] focus:border-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/40"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#FFFFFF] mb-2 font-['Roboto'] uppercase tracking-wider">
                  PHONE
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-[#555555] rounded-[4px] p-3 bg-[#333333] text-[#FFFFFF] font-['Roboto_Mono'] focus:border-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/40"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#FFFFFF] mb-2 font-['Roboto'] uppercase tracking-wider">
                  ADDRESS
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border border-[#555555] rounded-[4px] p-3 bg-[#333333] text-[#FFFFFF] font-['Roboto'] focus:border-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/40"
                  rows={3}
                  placeholder="Optional"
                />
              </div>
            </form>
          </div>

          <div className="border-t border-[#333333] p-4 bg-[#1E1E1E]">
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleClose}
                className="w-full px-4 py-3 border border-[#555555] rounded-[4px] hover:bg-[#333333] text-[#FFFFFF] font-['Roboto'] uppercase font-medium tracking-wider"
                disabled={loading}
              >
                CANCEL
              </button>
              <button
                type="submit"
                form="client-form"
                className="w-full px-4 py-3 bg-[#F9D71C] text-[#121212] rounded-[4px] hover:bg-[#F9D71C]/90 disabled:opacity-50 font-['Roboto'] uppercase font-medium tracking-wider"
                disabled={loading}
              >
                {loading ? 'UPDATING...' : 'UPDATE CLIENT'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
