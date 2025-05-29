import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Eye, Send, MessageSquare, Settings, Activity, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { DetailSkeleton } from '../skeletons/DetailSkeleton';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const InvoiceDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && id) {
      fetchData();
    }
  }, [user, id]);

  const fetchData = async () => {
    try {
      const [invoiceRes, productsRes] = await Promise.all([
        supabase
          .from('invoices')
          .select('*, invoice_items(*)')
          .eq('id', id)
          .eq('user_id', user?.id)
          .single(),
        supabase
          .from('products')
          .select('*')
          .eq('user_id', user?.id)
      ]);

      if (invoiceRes.error) throw invoiceRes.error;
      if (productsRes.error) throw productsRes.error;

      if (invoiceRes.data) {
        setInvoice(invoiceRes.data);
        // Fetch client data
        const clientRes = await supabase
          .from('clients')
          .select('*')
          .eq('id', invoiceRes.data.client_id)
          .eq('user_id', user?.id)
          .single();

        if (clientRes.error) throw clientRes.error;
        setClient(clientRes.data);
      }

      setProducts(productsRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load invoice details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !invoice || !client) {
    return (
      <div className="min-h-screen bg-[#121212] text-white">
        <DetailSkeleton />
      </div>
    );
  }

  const handleMarkAsPaid = async () => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', invoice.id);

      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error marking invoice as paid:', err);
      setError('Failed to mark invoice as paid');
    }
  };

  const subtotal = (invoice.invoice_items || []).reduce((sum: number, item: any) => sum + (item.unit_price * item.quantity), 0);
  const tax = 0; // 0% tax for now
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header with breadcrumb */}
      <div className="border-b border-[#333333] px-6 py-4">
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => navigate('/invoices')}
            className="text-[#336699] hover:text-white transition-colors"
          >
            Invoices
          </button>
          <span className="text-gray-400">›</span>
          <span className="text-white">{`INV-${invoice.id.slice(0, 8)}`}</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="border-b border-[#333333] px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Back and Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/invoices')}
              className="p-2 hover:bg-[#333333] rounded-[4px] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-white">{`INV-${invoice.id.slice(0, 8)}`}</h2>
                <span className={`text-xs px-2 py-1 rounded-[2px] font-medium ${
                  invoice.status === 'paid' ? 'bg-green-500/20 text-green-300' :
                  invoice.status === 'overdue' ? 'bg-red-500/20 text-red-300' :
                  invoice.status === 'sent' ? 'bg-blue-500/20 text-blue-300' :
                  'bg-gray-500/20 text-gray-300'
                }`}>
                  {invoice.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            <button 
              className="p-2 text-gray-400 hover:text-white hover:bg-[#333333] rounded-[4px] transition-colors"
              title="Preview Invoice"
            >
              <Eye className="w-5 h-5" />
            </button>
            <button 
              className="p-2 text-gray-400 hover:text-white hover:bg-[#333333] rounded-[4px] transition-colors"
              title="Download PDF"
            >
              <Download className="w-5 h-5" />
            </button>
            
            {invoice.status === 'draft' && (
              <>
                <div className="h-6 w-px bg-[#333333] mx-2"></div>
                <button 
                  onClick={handleMarkAsPaid}
                  className="bg-[#336699] text-white px-5 py-2 rounded-[4px] hover:bg-[#2A5580] transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Send className="w-4 h-4" />
                  Send Invoice
                </button>
              </>
            )}
            {invoice.status === 'sent' && (
              <>
                <div className="h-6 w-px bg-[#333333] mx-2"></div>
                <button 
                  onClick={handleMarkAsPaid}
                  className="bg-[#388E3C] text-white px-5 py-2 rounded-[4px] hover:bg-[#2E7D32] transition-colors text-sm font-medium"
                >
                  Mark as Paid
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white text-black rounded-[4px] shadow-lg p-8 min-h-[800px]">
            {/* Invoice Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-2xl font-bold text-black mb-2">Your Company</h1>
                <div className="text-sm text-gray-600">
                  <p>123 Business Street</p>
                  <p>City, State 12345</p>
                  <p>(555) 123-4567</p>
                  <p>info@yourcompany.com</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold text-black mb-2">{`INV-${invoice.id.slice(0, 8)}`}</h2>
                <div className="text-sm text-gray-600">
                  <p>Created: {new Date(invoice.issue_date).toLocaleDateString()}</p>
                  <p>Due: {new Date(invoice.due_date).toLocaleDateString()}</p>
                </div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                  invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                  invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                  invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {invoice.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Bill To Section */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">BILL TO</h3>
              <div className="text-sm text-black">
                <p className="font-semibold">{client.name || client.company_name}</p>
                <p>{client.address}</p>
                <p>{client.email}</p>
                <p>{client.phone}</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 text-sm font-semibold text-gray-800">ITEM</th>
                    <th className="text-right py-3 text-sm font-semibold text-gray-800">QTY</th>
                    <th className="text-right py-3 text-sm font-semibold text-gray-800">RATE</th>
                    <th className="text-right py-3 text-sm font-semibold text-gray-800">AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {(invoice.invoice_items || []).map((item: any, index: number) => {
                    const product = products.find(p => p.id === item.product_id);
                    return (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-4">
                          <div>
                            <p className="font-medium text-black">{product?.name || item.description || 'Service'}</p>
                            <p className="text-sm text-gray-600">{item.description || product?.description}</p>
                          </div>
                        </td>
                        <td className="text-right py-4 text-black">{item.quantity}</td>
                        <td className="text-right py-4 text-black">{formatCurrency(item.unit_price)}</td>
                        <td className="text-right py-4 text-black font-medium">{formatCurrency(item.unit_price * item.quantity)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-black">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-gray-600">Tax (0%)</span>
                  <span className="text-black">{formatCurrency(tax)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between py-2">
                    <span className="text-lg font-bold text-black">Total</span>
                    <span className="text-lg font-bold text-black">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
};