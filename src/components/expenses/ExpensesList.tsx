import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Calendar, Tag, Building, FileText, 
  Plus, Filter, Search, CheckCircle, Clock, 
  AlertCircle, ChevronDown, Download, Trash2,
  Edit2, MoreVertical
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../utils/format';
import { ExpenseService } from '../../services/expenseService';
import { VendorService, Vendor } from '../../services/vendorService';
import { useAuth } from '../../contexts/AuthContext';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  vendor: string;
  date: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  receipt_url?: string;
  created_at: string;
  updated_at: string;
}

interface ExpensesListProps {
  projectId: string;
  editable?: boolean;
}

export const ExpensesList: React.FC<ExpensesListProps> = ({ projectId, editable = true }) => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'vendor'>('date');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [vendorsList, setVendorsList] = useState<Vendor[]>([]);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Material',
    vendor: '',
    vendor_id: '',
    date: new Date().toISOString().split('T')[0],
    receipt_url: '',
    status: 'pending' as Expense['status']
  });

  useEffect(() => {
    if (user) {
      loadExpenses();
      loadVendors();
    }
  }, [user, projectId]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const [expensesData, summaryData] = await Promise.all([
        ExpenseService.getProjectExpenses(projectId),
        ExpenseService.getProjectExpenseSummary(projectId)
      ]);
      
      setExpenses(expensesData || []);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVendors = async () => {
    if (!user) return;
    try {
      const data = await VendorService.getVendors(user.id);
      setVendorsList(data);
    } catch (error) {
      console.error('Error loading vendors:', error);
    }
  };

  const updateExpenseStatus = async (expenseId: string, status: Expense['status']) => {
    try {
      await ExpenseService.updateExpenseStatus(expenseId, status);
      await loadExpenses(); // Reload to get updated data
    } catch (error) {
      console.error('Error updating expense status:', error);
    }
  };

  const getStatusColor = (status: Expense['status']) => {
    switch (status) {
      case 'paid': return 'text-green-400 bg-green-400/10';
      case 'approved': return 'text-blue-400 bg-blue-400/10';
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      case 'rejected': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status: Expense['status']) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-3 h-3" />;
      case 'approved': return <CheckCircle className="w-3 h-3" />;
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'rejected': return <AlertCircle className="w-3 h-3" />;
      default: return null;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Material': 'bg-blue-500',
      'Labor': 'bg-orange-500',
      'Equipment': 'bg-purple-500',
      'Permits': 'bg-green-500',
      'Subcontractor': 'bg-pink-500',
      'Other': 'bg-gray-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  // Get unique categories and vendor names from expenses for filters
  const categories = Array.from(new Set(expenses.map(e => e.category)));
  const uniqueVendorNames = Array.from(new Set(expenses.map(e => e.vendor).filter(Boolean)));

  // Filter and sort expenses
  const filteredExpenses = expenses
    .filter(expense => {
      const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || expense.status === selectedStatus;
      const matchesSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          expense.vendor?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'amount': return b.amount - a.amount;
        case 'vendor': return (a.vendor || '').localeCompare(b.vendor || '');
        default: return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

  if (loading) {
    return (
      <div className="bg-[#333333] rounded-[4px] p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[#404040] rounded w-1/4"></div>
          <div className="space-y-2">
            {[1,2,3].map(i => (
              <div key={i} className="h-16 bg-[#404040] rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#333333] rounded-[4px] p-4 border-l-4 border-[#336699]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Total Expenses</span>
            <DollarSign className="w-4 h-4 text-[#336699]" />
          </div>
          <p className="text-2xl font-bold font-mono">{formatCurrency(summary?.total || 0)}</p>
          <p className="text-xs text-gray-400 mt-1">{expenses.length} items</p>
        </div>

        <div className="bg-[#333333] rounded-[4px] p-4 border-l-4 border-[#388E3C]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Paid</span>
            <CheckCircle className="w-4 h-4 text-[#388E3C]" />
          </div>
          <p className="text-2xl font-bold font-mono">{formatCurrency(summary?.paidTotal || 0)}</p>
          <p className="text-xs text-gray-400 mt-1">
            {((summary?.paidTotal / summary?.total) * 100 || 0).toFixed(0)}% of total
          </p>
        </div>

        <div className="bg-[#333333] rounded-[4px] p-4 border-l-4 border-[#F9D71C]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Pending</span>
            <Clock className="w-4 h-4 text-[#F9D71C]" />
          </div>
          <p className="text-2xl font-bold font-mono">{formatCurrency(summary?.pendingTotal || 0)}</p>
          <p className="text-xs text-gray-400 mt-1">Awaiting payment</p>
        </div>

        <div className="bg-[#333333] rounded-[4px] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">By Category</span>
            <Tag className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-1">
            {Object.entries(summary?.byCategory || {}).slice(0, 3).map(([cat, amount]) => (
              <div key={cat} className="flex items-center justify-between text-xs">
                <span className="text-gray-300">{cat}</span>
                <span className="font-mono">{formatCurrency(amount as number)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-[#333333] rounded-[4px] p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <span className="text-[#336699]">▼</span> Expenses
          </h3>
          
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#1E1E1E] border border-[#555555] rounded-[4px] text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#336699]"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-[4px] text-sm transition-colors ${
                showFilters ? 'bg-[#336699] text-white' : 'bg-[#1E1E1E] text-gray-400 hover:text-white'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>

            {/* Export */}
            <button className="p-2 bg-[#1E1E1E] text-gray-400 rounded-[4px] hover:text-white transition-colors">
              <Download className="w-4 h-4" />
            </button>

            {/* Add Expense */}
            {editable && (
              <button className="flex items-center gap-2 px-3 py-2 bg-[#F9D71C] text-[#121212] rounded-[4px] hover:bg-[#E5C61A] transition-colors text-sm font-medium">
                <Plus className="w-4 h-4" />
                ADD EXPENSE
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-[#555555]">
            <div>
              <label className="block text-xs text-gray-400 mb-1">CATEGORY</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#555555] rounded-[4px] text-sm text-white focus:outline-none focus:border-[#336699]"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">STATUS</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#555555] rounded-[4px] text-sm text-white focus:outline-none focus:border-[#336699]"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">SORT BY</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#555555] rounded-[4px] text-sm text-white focus:outline-none focus:border-[#336699]"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="vendor">Vendor</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Expenses Table */}
      <div className="bg-[#1E1E1E] rounded-[4px] overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#252525] text-xs text-gray-400 uppercase">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Material/Labor</th>
              <th className="px-4 py-3 text-left font-medium">Trade</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
              <th className="px-4 py-3 text-left font-medium">Date Paid</th>
              <th className="px-4 py-3 text-left font-medium">Payee</th>
              <th className="px-4 py-3 text-center font-medium">Receipt</th>
              <th className="px-4 py-3 text-center font-medium">Status</th>
              {editable && <th className="px-4 py-3 text-center font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#333333]">
            {filteredExpenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-[#252525] transition-colors">
                <td className="px-4 py-3 text-sm text-white">{expense.description}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-[2px] text-xs font-medium text-white ${getCategoryColor(expense.category)}`}>
                    {expense.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">{expense.category}</td>
                <td className="px-4 py-3 text-sm text-right font-mono font-medium">
                  {formatCurrency(expense.amount)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {new Date(expense.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">{expense.vendor || '-'}</td>
                <td className="px-4 py-3 text-center">
                  {expense.receipt_url ? (
                    <a href={expense.receipt_url} target="_blank" rel="noopener noreferrer" className="text-[#336699] hover:text-white">
                      <FileText className="w-4 h-4 mx-auto" />
                    </a>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-[2px] text-xs font-medium ${getStatusColor(expense.status)}`}>
                    {getStatusIcon(expense.status)}
                    {expense.status.toUpperCase()}
                  </span>
                </td>
                {editable && (
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => updateExpenseStatus(expense.id, expense.status === 'paid' ? 'pending' : 'paid')}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-white transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-[#252525] text-sm font-medium">
            <tr>
              <td colSpan={3} className="px-4 py-3 text-gray-400 uppercase">
                Count: {filteredExpenses.length}
              </td>
              <td className="px-4 py-3 text-right font-mono text-white">
                SUM: {formatCurrency(filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0))}
              </td>
              <td colSpan={editable ? 5 : 4}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Vendor Selection */}
      <div>
        <label className="block text-sm font-medium text-white/60 mb-2">
          Vendor
        </label>
        <select
          value={formData.vendor_id}
          onChange={(e) => {
            const vendorId = e.target.value;
            const vendor = vendorsList.find(v => v.id === vendorId);
            setFormData({ 
              ...formData, 
              vendor_id: vendorId,
              vendor: vendor?.name || ''
            });
          }}
          className="w-full px-4 py-2 bg-concrete-gray text-white rounded focus:outline-none focus:ring-2 focus:ring-blueprint-blue"
        >
          <option value="">Select vendor...</option>
          {vendorsList.map(vendor => (
            <option key={vendor.id} value={vendor.id}>
              {vendor.name} {vendor.is_preferred && '⭐'}
            </option>
          ))}
        </select>
        {formData.vendor && !formData.vendor_id && (
          <input
            type="text"
            value={formData.vendor}
            onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
            className="w-full mt-2 px-4 py-2 bg-concrete-gray text-white rounded focus:outline-none focus:ring-2 focus:ring-blueprint-blue"
            placeholder="Or enter vendor name"
          />
        )}
      </div>
    </div>
  );
}; 