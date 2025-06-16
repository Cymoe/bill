import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/format';
import { 
  DollarSign, 
  Calendar, 
  Eye, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  TrendingUp,
  CreditCard,
  Plus,
  Filter
} from 'lucide-react';
import { PaymentTracker } from './PaymentTracker';
import { ProgressBillingModal } from './ProgressBillingModal';

interface Invoice {
  id: string;
  invoice_number: string;
  client: { name: string };
  project?: { name: string };
  amount: number;
  balance_due: number;
  total_paid: number;
  status: string;
  issue_date: string;
  due_date: string;
  payment_terms?: string;
  is_progress_billing?: boolean;
  project_milestone?: string;
  milestone_percentage?: number;
  created_at: string;
}

interface InvoiceWithPayments extends Invoice {
  payments?: Array<{
    id: string;
    amount: number;
    payment_date: string;
    payment_method: string;
  }>;
}

export const EnhancedInvoiceList: React.FC = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<InvoiceWithPayments[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithPayments | null>(null);
  const [showPaymentTracker, setShowPaymentTracker] = useState(false);
  const [showProgressBilling, setShowProgressBilling] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      loadInvoices();
    }
  }, [user]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      
      // Load invoices with payment data
      const { data: invoicesData, error } = await supabase
        .from('invoices')
        .select(`
          *,
          client:clients(name),
          project:projects(name),
          payments:invoice_payments(
            id,
            amount,
            payment_date,
            payment_method
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Calculate payment totals
      const processedInvoices = (invoicesData || []).map(invoice => {
        const totalPaid = invoice.payments?.reduce((sum: number, payment: any) => sum + payment.amount, 0) || 0;
        return {
          ...invoice,
          total_paid: totalPaid,
          balance_due: invoice.amount - totalPaid
        };
      });
      
      setInvoices(processedInvoices);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (invoice: InvoiceWithPayments) => {
    if (invoice.balance_due <= 0) {
      return { text: 'PAID', color: 'bg-[#388E3C] text-white' };
    }
    
    if (invoice.total_paid > 0) {
      return { text: 'PARTIAL', color: 'bg-[#F9D71C] text-black' };
    }
    
    const isOverdue = new Date(invoice.due_date) < new Date();
    if (isOverdue) {
      return { text: 'OVERDUE', color: 'bg-[#D32F2F] text-white' };
    }
    
    return { text: 'UNPAID', color: 'bg-gray-600 text-white' };
  };

  const getPaymentProgress = (invoice: InvoiceWithPayments) => {
    if (invoice.amount <= 0) return 0;
    return Math.min((invoice.total_paid / invoice.amount) * 100, 100);
  };

  const handleViewPayments = (invoice: InvoiceWithPayments) => {
    setSelectedInvoice(invoice);
    setShowPaymentTracker(true);
  };

  const handleCreateProgressInvoice = () => {
    setShowProgressBilling(true);
  };

  const filteredInvoices = invoices.filter(invoice => {
    // Status filter
    if (statusFilter !== 'all') {
      const status = getStatusBadge(invoice).text.toLowerCase();
      if (statusFilter !== status) return false;
    }
    
    // Payment filter
    if (paymentFilter === 'progress' && !invoice.is_progress_billing) return false;
    if (paymentFilter === 'standard' && invoice.is_progress_billing) return false;
    
    return true;
  });

  // Calculate summary stats
  const stats = {
    totalInvoices: invoices.length,
    totalAmount: invoices.reduce((sum, inv) => sum + inv.amount, 0),
    totalPaid: invoices.reduce((sum, inv) => sum + inv.total_paid, 0),
    totalOutstanding: invoices.reduce((sum, inv) => sum + inv.balance_due, 0),
    overdueCount: invoices.filter(inv => new Date(inv.due_date) < new Date() && inv.balance_due > 0).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-[#336699] animate-pulse relative">
          <div className="absolute inset-1 bg-[#336699] opacity-30 animate-pulse" style={{ animationDelay: '0.75s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[4px] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Total Invoices</div>
              <div className="text-2xl font-bold text-white">{stats.totalInvoices}</div>
            </div>
            <FileText className="w-8 h-8 text-[#336699]" />
          </div>
        </div>
        
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[4px] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Total Invoiced</div>
              <div className="text-2xl font-bold text-white font-mono">{formatCurrency(stats.totalAmount)}</div>
            </div>
            <DollarSign className="w-8 h-8 text-[#336699]" />
          </div>
        </div>
        
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[4px] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Total Paid</div>
              <div className="text-2xl font-bold text-[#388E3C] font-mono">{formatCurrency(stats.totalPaid)}</div>
            </div>
            <CheckCircle2 className="w-8 h-8 text-[#388E3C]" />
          </div>
        </div>
        
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[4px] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Outstanding</div>
              <div className="text-2xl font-bold text-[#F9D71C] font-mono">{formatCurrency(stats.totalOutstanding)}</div>
              {stats.overdueCount > 0 && (
                <div className="text-xs text-[#D32F2F]">{stats.overdueCount} overdue</div>
              )}
            </div>
            <AlertCircle className="w-8 h-8 text-[#F9D71C]" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1 bg-[#333333] border border-[#555555] rounded-[4px] text-sm text-white focus:border-[#336699] focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="unpaid">Unpaid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-1 bg-[#333333] border border-[#555555] rounded-[4px] text-sm text-white focus:border-[#336699] focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="progress">Progress Billing</option>
            <option value="standard">Standard Invoices</option>
          </select>
        </div>
        
        <button
          onClick={handleCreateProgressInvoice}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-[8px] hover:bg-gray-100 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Progress Invoice
        </button>
      </div>

      {/* Invoice List */}
      <div className="space-y-3">
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            {statusFilter !== 'all' || paymentFilter !== 'all' 
              ? 'No invoices match your filters' 
              : 'No invoices found. Create your first invoice to get started.'
            }
          </div>
        ) : (
          filteredInvoices.map((invoice) => {
            const status = getStatusBadge(invoice);
            const progress = getPaymentProgress(invoice);
            
            return (
              <div key={invoice.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[4px] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-white font-medium">
                        {invoice.invoice_number || `INV-${invoice.id.slice(-6)}`}
                      </div>
                      <span className={`px-2 py-1 rounded-[4px] text-xs font-medium ${status.color}`}>
                        {status.text}
                      </span>
                      {invoice.is_progress_billing && (
                        <span className="px-2 py-1 bg-[#336699]/20 text-[#336699] rounded-[4px] text-xs font-medium">
                          PROGRESS
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Client</div>
                        <div className="text-white">{invoice.client?.name}</div>
                        {invoice.project && (
                          <div className="text-xs text-gray-400">{invoice.project.name}</div>
                        )}
                      </div>
                      
                      <div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Amount</div>
                        <div className="text-white font-mono">{formatCurrency(invoice.amount)}</div>
                        {invoice.is_progress_billing && invoice.project_milestone && (
                          <div className="text-xs text-[#336699]">
                            {invoice.project_milestone}
                            {invoice.milestone_percentage && ` (${invoice.milestone_percentage}%)`}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Due Date</div>
                        <div className="text-white">{new Date(invoice.due_date).toLocaleDateString()}</div>
                        {invoice.payment_terms && (
                          <div className="text-xs text-gray-400">{invoice.payment_terms}</div>
                        )}
                      </div>
                    </div>
                    
                    {/* Payment Progress */}
                    {invoice.total_paid > 0 && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Payment Progress</span>
                          <span>{Math.round(progress)}% paid</span>
                        </div>
                        <div className="w-full bg-[#333333] rounded-[4px] h-2">
                          <div 
                            className="bg-[#388E3C] h-2 rounded-[4px] transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span className="text-[#388E3C]">Paid: {formatCurrency(invoice.total_paid)}</span>
                          <span className="text-[#F9D71C]">Due: {formatCurrency(invoice.balance_due)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleViewPayments(invoice)}
                      className="flex items-center gap-2 px-3 py-2 bg-[#333333] text-white rounded-[4px] hover:bg-[#404040] transition-colors text-sm"
                    >
                      <CreditCard className="w-4 h-4" />
                      Payments
                    </button>
                    
                    <button
                      className="flex items-center gap-2 px-3 py-2 bg-white text-black rounded-[8px] hover:bg-gray-100 transition-colors text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Payment Tracker Modal */}
      {showPaymentTracker && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[4px] w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a]">
              <h2 className="text-xl font-bold text-white">
                Payment Tracking - {selectedInvoice.invoice_number}
              </h2>
              <button
                onClick={() => setShowPaymentTracker(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-[#333333] rounded-[4px] transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <PaymentTracker
                invoiceId={selectedInvoice.id}
                invoiceAmount={selectedInvoice.amount}
                totalPaid={selectedInvoice.total_paid}
                balanceDue={selectedInvoice.balance_due}
                onPaymentAdded={loadInvoices}
              />
            </div>
          </div>
        </div>
      )}

      {/* Progress Billing Modal */}
      <ProgressBillingModal
        isOpen={showProgressBilling}
        onClose={() => setShowProgressBilling(false)}
        onSuccess={(invoiceId) => {
          console.log('Progress invoice created:', invoiceId);
          loadInvoices();
        }}
      />
    </div>
  );
}; 