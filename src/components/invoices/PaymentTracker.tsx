import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/format';
import { Plus, Calendar, CreditCard, FileText, Check, AlertCircle, DollarSign } from 'lucide-react';

interface Payment {
  id: string;
  payment_date: string;
  amount: number;
  payment_method: string;
  reference_number?: string;
  notes?: string;
  created_at: string;
}

interface PaymentTrackerProps {
  invoiceId: string;
  invoiceAmount: number;
  totalPaid: number;
  balanceDue: number;
  onPaymentAdded: () => void;
}

export const PaymentTracker: React.FC<PaymentTrackerProps> = ({
  invoiceId,
  invoiceAmount,
  totalPaid,
  balanceDue,
  onPaymentAdded
}) => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('check');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (invoiceId) {
      loadPayments();
    }
  }, [invoiceId]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invoice_payments')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('payment_date', { ascending: false });
        
      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }
    
    if (amount > balanceDue) {
      if (!confirm(`Payment amount ($${amount}) exceeds balance due ($${balanceDue}). Continue?`)) {
        return;
      }
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from('invoice_payments')
        .insert({
          invoice_id: invoiceId,
          payment_date: paymentDate,
          amount: amount,
          payment_method: paymentMethod,
          reference_number: referenceNumber || null,
          notes: notes || null,
          created_by: user?.id
        });
        
      if (error) throw error;
      
      // Reset form
      setPaymentAmount('');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('check');
      setReferenceNumber('');
      setNotes('');
      setShowAddPayment(false);
      
      // Reload data
      await loadPayments();
      onPaymentAdded();
      
    } catch (error) {
      console.error('Error adding payment:', error);
      alert('Failed to add payment. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = () => {
    if (balanceDue <= 0) return 'text-[#388E3C]'; // Paid
    if (totalPaid > 0) return 'text-[#F9D71C]'; // Partial
    return 'text-gray-400'; // Unpaid
  };

  const getStatusText = () => {
    if (balanceDue <= 0) return 'PAID IN FULL';
    if (totalPaid > 0) return 'PARTIALLY PAID';
    return 'UNPAID';
  };

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[4px] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold uppercase tracking-wider text-white">Payment Status</h3>
          <span className={`text-sm font-medium uppercase tracking-wider ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Invoice Total */}
          <div className="text-center">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Invoice Total</div>
            <div className="text-2xl font-bold text-white font-mono">
              {formatCurrency(invoiceAmount)}
            </div>
          </div>
          
          {/* Total Paid */}
          <div className="text-center">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Total Paid</div>
            <div className="text-2xl font-bold text-[#388E3C] font-mono">
              {formatCurrency(totalPaid)}
            </div>
          </div>
          
          {/* Balance Due */}
          <div className="text-center">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Balance Due</div>
            <div className={`text-2xl font-bold font-mono ${balanceDue > 0 ? 'text-[#F9D71C]' : 'text-[#388E3C]'}`}>
              {formatCurrency(balanceDue)}
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        {invoiceAmount > 0 && (
          <div className="mt-6">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>Payment Progress</span>
              <span>{Math.round((totalPaid / invoiceAmount) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-[#333333] rounded-[4px] h-2">
              <div 
                className="bg-[#388E3C] h-2 rounded-[4px] transition-all duration-300"
                style={{ width: `${Math.min((totalPaid / invoiceAmount) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Add Payment Button */}
      {balanceDue > 0 && (
        <div className="flex justify-between items-center">
          <h3 className="text-base font-semibold uppercase tracking-wider text-white">Payment History</h3>
          {!showAddPayment && (
            <button
              onClick={() => setShowAddPayment(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-[8px] hover:bg-gray-100 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Record Payment
            </button>
          )}
        </div>
      )}

      {/* Add Payment Form */}
      {showAddPayment && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[4px] p-6">
          <form onSubmit={handleAddPayment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Payment Amount */}
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                  Payment Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#336699] focus:outline-none"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Payment Date */}
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                  Payment Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#336699] focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                  Payment Method
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#336699] focus:outline-none"
                  >
                    <option value="check">Check</option>
                    <option value="cash">Cash</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="ach">ACH/Bank Transfer</option>
                    <option value="wire">Wire Transfer</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Reference Number */}
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                  Reference Number
                </label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full px-4 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#336699] focus:outline-none"
                  placeholder="Check #, Transaction ID, etc."
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#336699] focus:outline-none"
                rows={2}
                placeholder="Additional notes about this payment..."
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddPayment(false)}
                className="px-4 py-2 bg-transparent border border-[#555555] text-white rounded-[4px] hover:bg-[#333333] transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#388E3C] text-white rounded-[4px] hover:bg-[#2E7D32] transition-colors disabled:opacity-50"
                disabled={saving}
              >
                {saving ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payment History */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-6 text-gray-400">Loading payment history...</div>
        ) : payments.length === 0 ? (
          <div className="text-center py-6 text-gray-400">No payments recorded yet</div>
        ) : (
          payments.map((payment) => (
            <div key={payment.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[4px] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#388E3C]/20 rounded-[4px] flex items-center justify-center">
                    <Check className="w-5 h-5 text-[#388E3C]" />
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      {formatCurrency(payment.amount)} - {payment.payment_method.replace('_', ' ')}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(payment.payment_date).toLocaleDateString()}
                      {payment.reference_number && ` • Ref: ${payment.reference_number}`}
                    </div>
                    {payment.notes && (
                      <div className="text-xs text-gray-500 mt-1">{payment.notes}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}; 