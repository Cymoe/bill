import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Receipt, Plus, MoreVertical, Filter,
  Eye, Edit, Trash2, Send, CheckCircle,
  AlertTriangle, Clock, Download
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { OrganizationContext, LayoutContext } from '../layouts/DashboardLayout';
import { formatCurrency } from '../../utils/format';
import { TableSkeleton } from '../skeletons/TableSkeleton';
import { CreateInvoiceDrawer } from '../invoices/CreateInvoiceDrawer';

interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string;
  client?: {
    name: string;
  };
  project_id?: string;
  project?: {
    name: string;
  };
  total_amount: number;
  invoice_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
}

export const WorkInvoicesView: React.FC = () => {
  const navigate = useNavigate();
  const { selectedOrg } = useContext(OrganizationContext);
  const { isConstrained } = useContext(LayoutContext);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Invoice['status']>('all');
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [showInvoiceDrawer, setShowInvoiceDrawer] = useState(false);
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (selectedOrg?.id) {
      loadInvoices();
    }
  }, [selectedOrg?.id]);

  const loadInvoices = async () => {
    if (!selectedOrg?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          clients (
            name
          ),
          projects (
            name
          )
        `)
        .eq('organization_id', selectedOrg.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Update overdue status
      const updatedInvoices = (data || []).map(invoice => {
        if (invoice.status === 'sent' && new Date(invoice.due_date) < new Date()) {
          return { ...invoice, status: 'overdue' };
        }
        return invoice;
      });

      setInvoices(updatedInvoices);
    } catch (error: any) {
      console.error('Error loading invoices:', error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (invoice: Invoice) => {
    setDeletingInvoice(invoice);
    setShowDeleteConfirm(true);
    setDropdownOpen(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingInvoice?.id) return;
    
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', deletingInvoice.id);

      if (error) throw error;
      await loadInvoices();
      setShowDeleteConfirm(false);
      setDeletingInvoice(null);
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setDeletingInvoice(null);
  };

  const getStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'draft': return <Edit className="w-4 h-4" />;
      case 'sent': return <Send className="w-4 h-4" />;
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4" />;
      case 'cancelled': return <Trash2 className="w-4 h-4" />;
      default: return <Receipt className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'draft': return 'text-gray-400 bg-gray-400/10';
      case 'sent': return 'text-blue-400 bg-blue-400/10';
      case 'paid': return 'text-green-400 bg-green-400/10';
      case 'overdue': return 'text-red-400 bg-red-400/10';
      case 'cancelled': return 'text-gray-600 bg-gray-600/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.project?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statusCounts = invoices.reduce((acc, invoice) => {
    acc[invoice.status] = (acc[invoice.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalRevenue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total_amount, 0);

  const pendingRevenue = invoices
    .filter(inv => ['sent', 'overdue'].includes(inv.status))
    .reduce((sum, inv) => sum + inv.total_amount, 0);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Header with title and add button */}
      <div className="px-6 py-4 border-b border-[#1E1E1E] flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Invoices</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 bg-[#1E1E1E] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F9D71C]"
          />
          <button
            onClick={() => {
              if (!selectedOrg?.id) {
                alert('No organization selected. Please select an organization first.');
                return;
              }
              
              setShowInvoiceDrawer(true);
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-gray-100 rounded-lg text-black text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Invoice
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-6 py-4 bg-[#1E1E1E]/50 grid grid-cols-4 gap-6 min-h-[88px] flex-shrink-0">
        <div className="flex flex-col">
          <div className="text-xs text-gray-400 uppercase">Total Invoices</div>
          <div className="text-xl font-semibold text-white mt-1">{invoices.length}</div>
          <div className="text-xs text-gray-500 mt-auto">all time</div>
        </div>
        <div className="flex flex-col">
          <div className="text-xs text-gray-400 uppercase">Total Revenue</div>
          <div className="text-xl font-semibold text-green-400 mt-1">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="text-xs text-gray-500 mt-auto">collected</div>
        </div>
        <div className="flex flex-col">
          <div className="text-xs text-gray-400 uppercase">Pending</div>
          <div className="text-xl font-semibold text-[#F9D71C] mt-1">
            {formatCurrency(pendingRevenue)}
          </div>
          <div className="text-xs text-gray-500 mt-auto">awaiting payment</div>
        </div>
        <div className="flex flex-col">
          <div className="text-xs text-gray-400 uppercase">Overdue</div>
          <div className="text-xl font-semibold text-red-400 mt-1">
            {statusCounts.overdue || 0}
          </div>
          <div className="text-xs text-gray-500 mt-auto">invoices</div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 border-b border-[#1E1E1E] flex items-center gap-4 flex-shrink-0">
        <select
          className="bg-[#1E1E1E] border border-[#333] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#F9D71C]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
        >
          <option value="all">All Invoices ({invoices.length})</option>
          <option value="draft">Drafts ({statusCounts.draft || 0})</option>
          <option value="sent">Sent ({statusCounts.sent || 0})</option>
          <option value="paid">Paid ({statusCounts.paid || 0})</option>
          <option value="overdue">Overdue ({statusCounts.overdue || 0})</option>
          <option value="cancelled">Cancelled ({statusCounts.cancelled || 0})</option>
        </select>
        <button className="px-3 py-2 bg-[#1E1E1E] hover:bg-[#252525] text-white border border-[#333333] rounded-[4px] text-sm font-medium transition-colors flex items-center gap-2">
          <Filter className="w-4 h-4" />
          More Filters
        </button>
        <button className="ml-auto p-1.5 rounded hover:bg-[#2A2A2A] transition-colors">
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={5} columns={6} />
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <Receipt className="w-12 h-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No invoices found</h3>
            <p className="text-gray-400 text-center mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Create your first invoice to get started'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={() => setShowInvoiceDrawer(true)}
                className="px-4 py-2 bg-[#F9D71C] hover:bg-[#E5C61A] rounded-lg text-black font-medium transition-colors"
              >
                Create Invoice
              </button>
            )}
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            {isConstrained ? (
              // Mobile/Constrained View - Card Layout
              <div className="space-y-2 p-4">
                {filteredInvoices.map((invoice) => {
                  const daysUntilDue = Math.ceil((new Date(invoice.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div
                      key={invoice.id}
                      onClick={() => navigate(`/invoices/${invoice.id}`)}
                      className="bg-[#1E1E1E] border border-[#333333] rounded-lg p-4 cursor-pointer hover:bg-[#252525] transition-colors relative group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs px-2.5 py-1 font-medium ${getStatusColor(invoice.status)}`}>
                          {invoice.status.toUpperCase()}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDropdownOpen(dropdownOpen === invoice.id ? null : invoice.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-gray-600 rounded"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                      
                      <div className="mb-3">
                        <div className="font-medium text-white text-base">
                          Invoice #{invoice.invoice_number}
                        </div>
                        <div className="text-sm text-gray-400">
                          {new Date(invoice.invoice_date).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-400">Amount</div>
                          <div className="font-mono text-white font-medium">
                            {formatCurrency(invoice.total_amount)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400">Client</div>
                          <div className="text-white">
                            {invoice.client?.name || 'No client'}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400">Due Date</div>
                          <div className="flex items-center gap-1">
                            {invoice.status === 'overdue' ? (
                              <AlertTriangle className="w-3 h-3 text-red-400" />
                            ) : invoice.status === 'sent' && daysUntilDue <= 7 ? (
                              <Clock className="w-3 h-3 text-yellow-400" />
                            ) : null}
                            <div className="text-white">
                              {new Date(invoice.due_date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        {invoice.project && (
                          <div>
                            <div className="text-gray-400">Project</div>
                            <div className="text-white">
                              {invoice.project.name}
                            </div>
                          </div>
                        )}
                      </div>

                      {dropdownOpen === invoice.id && (
                        <div className="absolute right-4 top-12 w-48 bg-[#1E1E1E] border border-[#333] rounded-lg shadow-lg z-50 py-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/invoices/${invoice.id}`);
                              setDropdownOpen(null);
                            }}
                            className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#2A2A2A] transition-colors"
                          >
                            <Eye className="w-4 h-4 mr-3 text-gray-400" />
                            View Details
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle edit invoice
                              setDropdownOpen(null);
                            }}
                            className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#2A2A2A] transition-colors"
                          >
                            <Edit className="w-4 h-4 mr-3 text-gray-400" />
                            Edit Invoice
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle send invoice
                              setDropdownOpen(null);
                            }}
                            className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#2A2A2A] transition-colors"
                          >
                            <Send className="w-4 h-4 mr-3 text-gray-400" />
                            Send Invoice
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle download
                              setDropdownOpen(null);
                            }}
                            className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#2A2A2A] transition-colors"
                          >
                            <Download className="w-4 h-4 mr-3 text-gray-400" />
                            Download PDF
                          </button>
                          <div className="border-t border-[#333] my-1"></div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(invoice);
                            }}
                            className="w-full flex items-center px-3 py-2 text-sm text-red-400 hover:bg-[#2A2A2A] transition-colors"
                          >
                            <Trash2 className="w-4 h-4 mr-3" />
                            Delete Invoice
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              // Desktop View - Table Layout
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-[#1E1E1E] sticky top-0">
                    <tr className="text-xs text-gray-400 uppercase">
                      <th className="text-left px-6 py-3 font-medium">Invoice</th>
                      <th className="text-center px-6 py-3 font-medium">Status</th>
                      <th className="text-right px-6 py-3 font-medium">Amount</th>
                      <th className="text-left px-6 py-3 font-medium">Client</th>
                      <th className="text-left px-6 py-3 font-medium">Due Date</th>
                      <th className="text-right px-6 py-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((invoice) => {
                      const daysUntilDue = Math.ceil((new Date(invoice.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      
                      return (
                        <tr
                          key={invoice.id}
                          className="border-b border-[#1E1E1E] hover:bg-[#1E1E1E]/50 cursor-pointer transition-colors group"
                          onClick={() => navigate(`/invoices/${invoice.id}`)}
                        >
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-white">
                                Invoice #{invoice.invoice_number}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {new Date(invoice.invoice_date).toLocaleDateString()}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(invoice.status)}`}>
                              {getStatusIcon(invoice.status)}
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="font-mono font-semibold text-white">
                              {formatCurrency(invoice.total_amount)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-white">
                              {invoice.client?.name || 'No client'}
                            </div>
                            {invoice.project && (
                              <div className="text-xs text-gray-400">
                                {invoice.project.name}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {invoice.status === 'overdue' ? (
                                <AlertTriangle className="w-3 h-3 text-red-400" />
                              ) : invoice.status === 'sent' && daysUntilDue <= 7 ? (
                                <Clock className="w-3 h-3 text-yellow-400" />
                              ) : null}
                              <div>
                                <div className="text-sm text-white">
                                  {new Date(invoice.due_date).toLocaleDateString()}
                                </div>
                                {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                                  <div className="text-xs text-gray-400">
                                    {daysUntilDue > 0 ? `${daysUntilDue} days` : 'Overdue'}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="relative flex items-center justify-end h-full">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDropdownOpen(dropdownOpen === invoice.id ? null : invoice.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-gray-600 rounded"
                              >
                                <MoreVertical className="w-4 h-4 text-gray-400" />
                              </button>
                              
                              {dropdownOpen === invoice.id && (
                                <div className="absolute right-0 top-8 w-48 bg-[#1E1E1E] border border-[#333] rounded-lg shadow-lg z-50 py-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/invoices/${invoice.id}`);
                                      setDropdownOpen(null);
                                    }}
                                    className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#2A2A2A] transition-colors"
                                  >
                                    <Eye className="w-4 h-4 mr-3 text-gray-400" />
                                    View Details
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Handle edit invoice
                                      setDropdownOpen(null);
                                    }}
                                    className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#2A2A2A] transition-colors"
                                  >
                                    <Edit className="w-4 h-4 mr-3 text-gray-400" />
                                    Edit Invoice
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Handle send invoice  
                                      setDropdownOpen(null);
                                    }}
                                    className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#2A2A2A] transition-colors"
                                  >
                                    <Send className="w-4 h-4 mr-3 text-gray-400" />
                                    Send Invoice
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Handle download
                                      setDropdownOpen(null);
                                    }}
                                    className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#2A2A2A] transition-colors"
                                  >
                                    <Download className="w-4 h-4 mr-3 text-gray-400" />
                                    Download PDF
                                  </button>
                                  <div className="border-t border-[#333] my-1"></div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteClick(invoice);
                                    }}
                                    className="w-full flex items-center px-3 py-2 text-sm text-red-400 hover:bg-[#2A2A2A] transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4 mr-3" />
                                    Delete Invoice
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Create Invoice Drawer */}
      <CreateInvoiceDrawer
        isOpen={showInvoiceDrawer}
        organizationId={selectedOrg?.id}
        onClose={() => {
          console.log('Closing invoice drawer');
          setShowInvoiceDrawer(false);
          loadInvoices(); // Refresh invoices after creation
        }}
        onSave={async (formData: any) => {
          try {
            console.log('Creating invoice with form data:', formData);
            
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');
            
            // Validate organization_id
            if (!selectedOrg?.id) {
              throw new Error('No organization selected');
            }
            
            // Prepare invoice data with organization_id
            const invoiceData = {
              user_id: user.id,
              organization_id: selectedOrg.id,
              client_id: formData.client_id,
              project_id: formData.project_id || null,
              amount: formData.total_amount || 0,
              subtotal: formData.total_amount || 0,
              tax_rate: 0,
              tax_amount: 0,
              status: formData.status || 'draft',
              issue_date: formData.issue_date || new Date().toISOString().split('T')[0],
              due_date: formData.due_date || formData.issue_date || new Date().toISOString().split('T')[0],
              notes: formData.description || '',
              terms: formData.payment_terms || 'Net 30',
              balance_due: formData.total_amount || 0,
              total_paid: 0
            };
            
            console.log('Invoice data to be inserted:', invoiceData);
            
            // Use InvoiceService to create the invoice
            const { InvoiceService } = await import('../../services/InvoiceService');
            const newInvoice = await InvoiceService.create({
              ...invoiceData,
              invoice_items: formData.items?.map((item: any) => ({
                description: item.product_name || item.description,
                quantity: item.quantity,
                unit_price: item.price,
                total_price: item.price * item.quantity,
                product_id: item.product_id
              })) || []
            });
            
            console.log('Invoice created successfully:', newInvoice);
            await loadInvoices();
          } catch (error) {
            console.error('Error creating invoice:', error);
            alert('Failed to create invoice. Please try again.');
            throw error;
          }
        }}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0a0a0a] rounded-xl max-w-md w-full border border-white/10 shadow-2xl">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Delete Invoice</h3>
              <p className="text-white/60 mb-6">
                Are you sure you want to delete invoice "#{deletingInvoice?.invoice_number}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleDeleteCancel}
                  className="h-12 px-6 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all font-medium border border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="h-12 px-6 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-400 hover:to-red-500 transition-all font-medium flex items-center gap-3 shadow-lg"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};