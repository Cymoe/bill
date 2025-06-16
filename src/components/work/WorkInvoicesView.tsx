import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Receipt, Plus, MoreVertical, Filter,
  Eye, Edit, Trash2, Send, CheckCircle,
  AlertTriangle, Clock, Download, List, Grid3X3
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { OrganizationContext } from '../layouts/DashboardLayout';
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
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Invoice['status']>('all');
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [showInvoiceDrawer, setShowInvoiceDrawer] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

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

  const handleDeleteInvoice = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
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
    <div className="flex flex-col h-full">
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
              console.log('Add Invoice clicked, setting showInvoiceDrawer to true');
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
      <div className="px-6 py-4 bg-[#1E1E1E]/50 grid grid-cols-4 gap-6">
        <div>
          <div className="text-xs text-gray-400 uppercase">Total Invoices</div>
          <div className="text-xl font-semibold text-white mt-1">{invoices.length}</div>
          <div className="text-xs text-gray-500">all time</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 uppercase">Total Revenue</div>
          <div className="text-xl font-semibold text-green-400 mt-1">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="text-xs text-gray-500">collected</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 uppercase">Pending</div>
          <div className="text-xl font-semibold text-[#F9D71C] mt-1">
            {formatCurrency(pendingRevenue)}
          </div>
          <div className="text-xs text-gray-500">awaiting payment</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 uppercase">Overdue</div>
          <div className="text-xl font-semibold text-red-400 mt-1">
            {statusCounts.overdue || 0}
          </div>
          <div className="text-xs text-gray-500">invoices</div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 border-b border-[#1E1E1E] flex items-center justify-between">
        <div className="flex items-center gap-4">
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
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[#1E1E1E] hover:bg-[#2A2A2A] border border-[#333] rounded-lg text-sm text-white transition-colors">
            <Filter className="w-4 h-4" />
            More Filters
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded transition-colors ${
              viewMode === 'list' ? 'bg-[#2A2A2A] text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded transition-colors ${
              viewMode === 'grid' ? 'bg-[#2A2A2A] text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button className="ml-2 p-1.5 hover:bg-[#1E1E1E] rounded transition-colors">
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
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
          <table className="w-full">
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
                    className="border-b border-[#1E1E1E] hover:bg-[#1E1E1E]/50 cursor-pointer transition-colors"
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
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDropdownOpen(dropdownOpen === invoice.id ? null : invoice.id);
                          }}
                          className="p-1 hover:bg-[#2A2A2A] rounded transition-colors"
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
                                // Handle download
                                setDropdownOpen(null);
                              }}
                              className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#2A2A2A] transition-colors"
                            >
                              <Download className="w-4 h-4 mr-3 text-gray-400" />
                              Download PDF
                            </button>
                            {invoice.status === 'draft' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Handle send
                                  setDropdownOpen(null);
                                }}
                                className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#2A2A2A] transition-colors"
                              >
                                <Send className="w-4 h-4 mr-3 text-gray-400" />
                                Send to Client
                              </button>
                            )}
                            <div className="border-t border-[#333] my-1"></div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteInvoice(invoice.id);
                                setDropdownOpen(null);
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
        )}
      </div>
      
      {/* Create Invoice Drawer */}
      {console.log('Rendering CreateInvoiceDrawer with isOpen:', showInvoiceDrawer)}
      <CreateInvoiceDrawer
        isOpen={showInvoiceDrawer}
        onClose={() => {
          console.log('Closing invoice drawer');
          setShowInvoiceDrawer(false);
          loadInvoices(); // Refresh invoices after creation
        }}
      />
    </div>
  );
};