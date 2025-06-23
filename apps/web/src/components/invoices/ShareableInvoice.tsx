import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { formatCurrency } from '../../utils/format';
import { supabase } from '../../lib/supabase';

export const ShareableInvoice: React.FC = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchInvoiceData();
    }
  }, [id]);

  const fetchInvoiceData = async () => {
    try {
      // Fetch invoice data without user authentication for public sharing
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*, invoice_items(*)')
        .eq('id', id)
        .single();

      if (invoiceError) throw invoiceError;

      if (invoiceData) {
        setInvoice(invoiceData);
        
        // Track that the invoice has been opened if not already
        if (invoiceData.status === 'sent' && !invoiceData.first_opened_at) {
          await supabase
            .from('invoices')
            .update({ 
              status: 'opened',
              first_opened_at: new Date().toISOString()
            })
            .eq('id', id);
        }
        
        // Fetch client data
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('id', invoiceData.client_id)
          .single();

        if (clientError) throw clientError;
        setClient(clientData);

        // Fetch products for this invoice
        const productIds = invoiceData.invoice_items?.map((item: any) => item.product_id).filter(Boolean) || [];
        if (productIds.length > 0) {
          const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('*')
            .in('id', productIds);

          if (productsError) throw productsError;
          setProducts(productsData || []);
        }
      }
    } catch (err) {
      console.error('Error fetching invoice data:', err);
      setError('Failed to load invoice');
    } finally {
      setIsLoading(false);
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Loading invoice...</div>
      </div>
    );
  }

  if (error || !invoice || !client) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-red-600">{error || 'Invoice not found'}</div>
      </div>
    );
  }

  const subtotal = (invoice.invoice_items || []).reduce((sum: number, item: any) => sum + (item.unit_price * item.quantity), 0);
  const tax = 0; // 0% tax for now
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-white print:bg-white">
      <div className="max-w-4xl mx-auto p-8">
        {/* Company Logo/Header */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Company</h1>
              <div className="text-sm text-gray-600">
                <p>123 Business Street</p>
                <p>City, State 12345</p>
                <p>(555) 123-4567</p>
                <p>info@yourcompany.com</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">INVOICE</h2>
              <div className="text-sm text-gray-600">
                <p className="font-semibold">{`INV-${invoice.id.slice(0, 8).toUpperCase()}`}</p>
                <p>Date: {new Date(invoice.issue_date).toLocaleDateString()}</p>
                <p>Due: {new Date(invoice.due_date).toLocaleDateString()}</p>
              </div>
              {invoice.status === 'paid' && (
                <div className="mt-4">
                  <span className="inline-block px-4 py-2 bg-green-100 text-green-800 font-semibold rounded">
                    PAID
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bill To Section */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">BILL TO</h3>
          <div className="text-gray-900">
            <p className="font-semibold text-lg">{client.name || client.company_name}</p>
            {client.address && <p>{client.address}</p>}
            {client.city && client.state && client.zip && (
              <p>{client.city}, {client.state} {client.zip}</p>
            )}
            {client.email && <p className="text-blue-600">{client.email}</p>}
            {client.phone && <p>{client.phone}</p>}
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-3 text-sm font-semibold text-gray-700">DESCRIPTION</th>
                <th className="text-right py-3 text-sm font-semibold text-gray-700">QTY</th>
                <th className="text-right py-3 text-sm font-semibold text-gray-700">RATE</th>
                <th className="text-right py-3 text-sm font-semibold text-gray-700">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {(invoice.invoice_items || []).map((item: any, index: number) => {
                const product = products.find(p => p.id === item.product_id);
                return (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-4">
                      <div>
                        <p className="font-medium text-gray-900">{product?.name || item.description || 'Service'}</p>
                        {(item.description || product?.description) && (
                          <p className="text-sm text-gray-600">{item.description || product?.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="text-right py-4 text-gray-900">{item.quantity}</td>
                    <td className="text-right py-4 text-gray-900">{formatCurrency(item.unit_price)}</td>
                    <td className="text-right py-4 text-gray-900 font-medium">{formatCurrency(item.unit_price * item.quantity)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-2 text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between py-2 text-sm">
              <span className="text-gray-600">Tax (0%)</span>
              <span className="text-gray-900">{formatCurrency(tax)}</span>
            </div>
            <div className="border-t-2 border-gray-300 pt-2">
              <div className="flex justify-between py-2">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-lg font-bold text-gray-900">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Terms / Notes */}
        {invoice.notes && (
          <div className="mb-8 p-4 bg-gray-50 rounded">
            <h4 className="font-semibold text-gray-700 mb-2">Notes</h4>
            <p className="text-sm text-gray-600">{invoice.notes}</p>
          </div>
        )}


        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>Thank you for your business!</p>
          <p className="mt-2">Please remit payment within {invoice.payment_terms || '30'} days.</p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};