import React, { useState, useEffect } from 'react';
import { Plus, Calendar, ChevronDown, ChevronRight, Filter, ArrowUpDown, X, Edit, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../utils/format';
import { useAuth } from '../../contexts/AuthContext';

interface CostCode {
  id: string;
  name: string;
  code: string;
  category: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  vendor: string;
  date: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  receipt_url?: string;
  project_id: string;
  created_at: string;
  updated_at: string;
  cost_code_id?: string;
  cost_code?: CostCode;
}

interface ExpensesListProps {
  projectId: string;
  editable?: boolean;
  defaultViewMode?: 'cost-codes' | 'categories' | 'payee' | 'timeline';
}

export const ExpensesList: React.FC<ExpensesListProps> = ({ projectId, editable = true, defaultViewMode = 'cost-codes' }) => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [costCodes, setCostCodes] = useState<CostCode[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'cost-codes' | 'categories' | 'payee' | 'timeline'>(defaultViewMode);
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'unpaid'>('all');
  
  const [newExpense, setNewExpense] = useState({
    description: '',
    vendor: '',
    amount: '',
    category: 'Materials',
    cost_code_id: '',
  });

  useEffect(() => {
    if (user && projectId) {
      loadExpenses();
      loadCostCodes();
    }
  }, [user, projectId]);

  const loadCostCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('cost_codes')
        .select('*')
        .order('code');

      if (error) throw error;
      setCostCodes(data || []);
    } catch (error) {
      console.error('Error loading cost codes:', error);
    }
  };

  const loadExpenses = async () => {
    try {
      setLoading(true);
      
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('project_id', projectId)
        .order('date', { ascending: false });

      if (expensesError) {
        console.error('Supabase error details:', expensesError);
        throw expensesError;
      }

      if (expensesData && expensesData.length > 0) {
        const costCodeIds = [...new Set(expensesData
          .filter(expense => expense.cost_code_id)
          .map(expense => expense.cost_code_id)
        )];

        let costCodesMap: Record<string, CostCode> = {};
        
        if (costCodeIds.length > 0) {
          const { data: costCodesData, error: costCodesError } = await supabase
            .from('cost_codes')
            .select('*')
            .in('id', costCodeIds);

          if (!costCodesError && costCodesData) {
            costCodesMap = costCodesData.reduce((acc, cc) => {
              acc[cc.id] = cc;
              return acc;
            }, {} as Record<string, CostCode>);
          }
        }

        const expensesWithCostCodes = expensesData.map(expense => ({
          ...expense,
          cost_code: expense.cost_code_id ? costCodesMap[expense.cost_code_id] : undefined
        }));

        setExpenses(expensesWithCostCodes);
      } else {
        setExpenses([]);
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.description.trim() || !newExpense.amount) return;

    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          description: newExpense.description,
          amount: parseFloat(newExpense.amount),
          vendor: newExpense.vendor || null,
          category: newExpense.category,
          cost_code_id: newExpense.cost_code_id || null,
          date: new Date().toISOString().split('T')[0],
          status: 'pending',
          project_id: projectId,
          user_id: user?.id
        })
        .select('*')
        .single();

      if (error) throw error;

      loadExpenses();
      
      setNewExpense({
        description: '',
        vendor: '',
        amount: '',
        category: 'Materials',
        cost_code_id: '',
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error creating expense:', error);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;

      setExpenses(expenses.filter(expense => expense.id !== expenseId));
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const formatExpenseDate = (date: string) => {
    const expenseDate = new Date(date);
    const now = new Date();
    const diffTime = now.getTime() - expenseDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return expenseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  // Map our status system to the display statuses
  const mapStatusToDisplay = (status: string): 'paid' | 'pending' | 'unpaid' => {
    switch (status) {
      case 'paid':
        return 'paid';
      case 'pending':
      case 'approved':
        return 'pending';
      case 'rejected':
      default:
        return 'unpaid';
    }
  };

  const getStatusIcon = (status: 'paid' | 'pending' | 'unpaid') => {
    switch (status) {
      case 'paid':
        return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'unpaid':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
    }
  };

  const getStatusBadge = (status: 'paid' | 'pending' | 'unpaid', count: number) => {
    const baseClasses = "px-2 py-1 rounded text-xs font-medium flex items-center gap-1";
    switch (status) {
      case 'paid':
        return (
          <span className={`${baseClasses} bg-green-900/20 text-green-400 border border-green-900/30`}>
            <CheckCircle2 className="h-3 w-3" />
            {count}
          </span>
        );
      case 'pending':
        return (
          <span className={`${baseClasses} bg-yellow-900/20 text-yellow-400 border border-yellow-900/30`}>
            <Clock className="h-3 w-3" />
            {count}
          </span>
        );
      case 'unpaid':
        return (
          <span className={`${baseClasses} bg-red-900/20 text-red-400 border border-red-900/30`}>
            <AlertCircle className="h-3 w-3" />
            {count}
          </span>
        );
    }
  };

  const handleUpdateStatus = async (expenseId: string, newStatus: 'paid' | 'pending' | 'unpaid') => {
    // Map display status back to our database status
    let dbStatus: 'pending' | 'approved' | 'paid' | 'rejected';
    switch (newStatus) {
      case 'paid':
        dbStatus = 'paid';
        break;
      case 'pending':
        dbStatus = 'pending';
        break;
      case 'unpaid':
        dbStatus = 'rejected';
        break;
    }

    try {
      const { error } = await supabase
        .from('expenses')
        .update({ status: dbStatus })
        .eq('id', expenseId);

      if (error) throw error;

      // Update local state
      setExpenses(expenses.map(expense => 
        expense.id === expenseId 
          ? { ...expense, status: dbStatus }
          : expense
      ));
    } catch (error) {
      console.error('Error updating expense status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#336699]"></div>
      </div>
    );
  }

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const paidExpenses = expenses.filter(e => mapStatusToDisplay(e.status) === 'paid').reduce((sum, expense) => sum + expense.amount, 0);
  const pendingExpenses = expenses.filter(e => mapStatusToDisplay(e.status) === 'pending').reduce((sum, expense) => sum + expense.amount, 0);
  const unpaidExpenses = expenses.filter(e => mapStatusToDisplay(e.status) === 'unpaid').reduce((sum, expense) => sum + expense.amount, 0);

  // Filter expenses by status
  const filteredExpenses = expenses.filter(expense => {
    if (statusFilter === 'all') return true;
    return mapStatusToDisplay(expense.status) === statusFilter;
  });

  const groupedExpenses = filteredExpenses.reduce((acc, expense) => {
    let groupKey: string;
    
    if (viewMode === 'cost-codes') {
      groupKey = expense.cost_code_id || 'no-cost-code';
    } else if (viewMode === 'categories') {
      groupKey = expense.category || 'Other';
    } else if (viewMode === 'payee') {
      groupKey = expense.vendor || 'No Vendor';
    } else {
      // Timeline mode
      const expenseDate = new Date(expense.date);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      
      const expenseDateStr = expenseDate.toDateString();
      const todayStr = today.toDateString();
      const yesterdayStr = yesterday.toDateString();
      
      if (expenseDateStr === todayStr) {
        groupKey = 'Today';
      } else if (expenseDateStr === yesterdayStr) {
        groupKey = 'Yesterday';
      } else {
        // Use the date as the group key
        groupKey = expenseDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: expenseDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
        });
      }
    }
    
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(expense);
    return acc;
  }, {} as Record<string, Expense[]>);

  // Calculate totals and status counts for each group
  const groupTotals = Object.keys(groupedExpenses).reduce((acc, groupKey) => {
    acc[groupKey] = groupedExpenses[groupKey].reduce((sum, expense) => sum + expense.amount, 0);
    return acc;
  }, {} as Record<string, number>);

  const groupStatusCounts = Object.keys(groupedExpenses).reduce((acc, groupKey) => {
    acc[groupKey] = {
      paid: groupedExpenses[groupKey].filter(e => mapStatusToDisplay(e.status) === 'paid').length,
      pending: groupedExpenses[groupKey].filter(e => mapStatusToDisplay(e.status) === 'pending').length,
      unpaid: groupedExpenses[groupKey].filter(e => mapStatusToDisplay(e.status) === 'unpaid').length,
    };
    return acc;
  }, {} as Record<string, { paid: number; pending: number; unpaid: number }>);

  // Sort groups by total amount or date depending on view mode
  const sortedGroups = Object.keys(groupedExpenses).sort((a, b) => {
    if (viewMode === 'timeline') {
      // Sort timeline groups chronologically
      const dateOrder = ['Today', 'Yesterday'];
      const aIndex = dateOrder.indexOf(a);
      const bIndex = dateOrder.indexOf(b);
      
      // If both are special dates (Today, Yesterday), use their predefined order
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      // If only one is a special date, it comes first
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
      // For regular dates, parse and sort chronologically
      const dateA = new Date(a);
      const dateB = new Date(b);
      return sortOrder === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    } else {
      // Sort by total amount for other view modes
      const comparison = groupTotals[a] - groupTotals[b];
      return sortOrder === 'asc' ? comparison : -comparison;
    }
  });

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium uppercase tracking-wider text-gray-400">
            {viewMode === 'cost-codes' ? 'Cost Categories' : 
             viewMode === 'categories' ? 'Expense Types' : 
             viewMode === 'payee' ? 'Payees' : 'Timeline'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Selector */}
          <div className="relative">
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'cost-codes' | 'categories' | 'payee' | 'timeline')}
              className="w-40 bg-[#111827]/50 border border-gray-700 rounded-[4px] pl-8 pr-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#336699] appearance-none cursor-pointer"
            >
              <option value="cost-codes">Cost Codes</option>
              <option value="categories">Categories</option>
              <option value="payee">Payee</option>
              <option value="timeline">Timeline</option>
            </select>
            <Filter className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-1.5 bg-[#111827]/50 border border-gray-700 rounded-[4px] text-gray-400 hover:text-white transition-colors"
            title={`Sort by amount ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>

          {editable && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#336699] hover:bg-[#5A8BB8] text-white rounded-[4px] text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Payment Status Filter Tabs */}
      <div className="bg-[#111827]/50 border border-gray-800 rounded-[4px] p-1 flex gap-1">
        <button
          onClick={() => setStatusFilter('all')}
          className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
            statusFilter === 'all'
              ? 'bg-[#336699] text-white'
              : 'text-gray-400 hover:text-white hover:bg-[#1f2937]'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setStatusFilter('paid')}
          className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
            statusFilter === 'paid'
              ? 'bg-green-900/20 text-green-400'
              : 'text-gray-400 hover:text-green-400 hover:bg-green-900/10'
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Paid
        </button>
        <button
          onClick={() => setStatusFilter('pending')}
          className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
            statusFilter === 'pending'
              ? 'bg-yellow-900/20 text-yellow-400'
              : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-900/10'
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          Pending
        </button>
        <button
          onClick={() => setStatusFilter('unpaid')}
          className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
            statusFilter === 'unpaid'
              ? 'bg-red-900/20 text-red-400'
              : 'text-gray-400 hover:text-red-400 hover:bg-red-900/10'
          }`}
        >
          <AlertCircle className="h-3.5 w-3.5" />
          Unpaid
        </button>
      </div>

      {/* Add Expense Form */}
      {showAddForm && (
        <div className="bg-[#111827]/50 border border-gray-700 rounded-[4px] p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium uppercase tracking-wider text-gray-400">Add New Expense</h3>
            <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <input
                type="text"
                placeholder="What did you pay for?"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-[4px] px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#336699]"
              />
            </div>

            <div>
              <input
                type="number"
                placeholder="0.00"
                step="0.01"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-[4px] px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#336699]"
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="Vendor (optional)"
                value={newExpense.vendor}
                onChange={(e) => setNewExpense({ ...newExpense, vendor: e.target.value })}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-[4px] px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#336699]"
              />
            </div>

            <div>
              <select
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-[4px] px-3 py-2 text-white focus:outline-none focus:border-[#336699] cursor-pointer"
              >
                <option value="Materials">Materials</option>
                <option value="Labor">Labor</option>
                <option value="Equipment">Equipment</option>
                <option value="Service">Service</option>
                <option value="Permits">Permits</option>
                <option value="Subcontractor">Subcontractor</option>
                <option value="Disposal">Disposal</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <select
                value={newExpense.cost_code_id}
                onChange={(e) => setNewExpense({ ...newExpense, cost_code_id: e.target.value })}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-[4px] px-3 py-2 text-white focus:outline-none focus:border-[#336699] cursor-pointer"
              >
                <option value="">No Cost Code</option>
                {costCodes.map(cc => (
                  <option key={cc.id} value={cc.id}>
                    {cc.code} - {cc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-gray-700 rounded-[4px] text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddExpense}
              className="px-4 py-2 bg-[#336699] hover:bg-[#5A8BB8] text-white rounded-[4px] transition-colors"
            >
              Add Expense
            </button>
          </div>
        </div>
      )}

      {/* All Summary */}
      <div className="bg-[#F9D71C]/10 border border-[#F9D71C]/20 rounded-[4px] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-[#F9D71C] font-medium">
              {viewMode === 'cost-codes' ? 'All Categories' : 
               viewMode === 'categories' ? 'All Expenses' : 
               viewMode === 'payee' ? 'All Payees' : 'All Timeline'}
            </div>
            <div className="flex items-center gap-2">
              {filteredExpenses.some(e => mapStatusToDisplay(e.status) === 'paid') && (
                <span className="px-2 py-1 bg-green-900/10 text-green-400 border border-green-900/30 rounded text-xs flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {filteredExpenses.filter(e => mapStatusToDisplay(e.status) === 'paid').length}
                </span>
              )}
              {filteredExpenses.some(e => mapStatusToDisplay(e.status) === 'pending') && (
                <span className="px-2 py-1 bg-yellow-900/10 text-yellow-400 border border-yellow-900/30 rounded text-xs flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {filteredExpenses.filter(e => mapStatusToDisplay(e.status) === 'pending').length}
                </span>
              )}
              {filteredExpenses.some(e => mapStatusToDisplay(e.status) === 'unpaid') && (
                <span className="px-2 py-1 bg-red-900/10 text-red-400 border border-red-900/30 rounded text-xs flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {filteredExpenses.filter(e => mapStatusToDisplay(e.status) === 'unpaid').length}
                </span>
              )}
            </div>
          </div>
          <div className="text-xl font-bold text-[#F9D71C]">{formatCurrency(filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0))}</div>
        </div>
      </div>

      {/* Collapsible Groups */}
      <div className="space-y-2">
        {sortedGroups.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              {statusFilter === 'all' ? 'No expenses tracked yet' : `No ${statusFilter} expenses`}
            </div>
            {editable && statusFilter === 'all' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-[#336699] hover:bg-[#5A8BB8] text-white rounded-[4px] transition-colors"
              >
                Add First Expense
              </button>
            )}
          </div>
        ) : (
          sortedGroups.map((groupKey) => {
            const isExpanded = expandedGroups.has(groupKey);
            
            // Get display information based on view mode
            let displayCode = '';
            let displayName = '';
            
            if (viewMode === 'cost-codes') {
              if (groupKey === 'no-cost-code') {
                displayCode = 'No Code';
                displayName = 'Unassigned';
              } else {
                const costCode = costCodes.find(cc => cc.id === groupKey);
                displayCode = costCode?.code || groupKey;
                displayName = costCode?.name || 'Unknown Cost Code';
              }
            } else if (viewMode === 'categories') {
              displayCode = groupKey;
              displayName = groupKey;
            } else if (viewMode === 'payee') {
              displayCode = groupKey === 'No Vendor' ? 'No Vendor' : '';
              displayName = groupKey;
            } else {
              // Timeline mode
              displayCode = groupKey;
              displayName = groupKey;
            }
            
            return (
              <div key={groupKey}>
                {/* Group Header */}
                <div 
                  className={`bg-[#111827]/30 border border-gray-800/50 rounded-[4px] p-4 cursor-pointer transition-colors hover:bg-[#111827]/50 ${
                    isExpanded ? 'bg-[#111827]/50' : ''
                  }`}
                  onClick={() => toggleGroup(groupKey)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                      <div className="font-mono text-sm text-gray-400">
                        {displayCode}
                      </div>
                      <div className="font-medium text-white">
                        {displayName}
                      </div>
                      <div className="flex items-center gap-2">
                        {groupStatusCounts[groupKey].paid > 0 && getStatusBadge('paid', groupStatusCounts[groupKey].paid)}
                        {groupStatusCounts[groupKey].pending > 0 && getStatusBadge('pending', groupStatusCounts[groupKey].pending)}
                        {groupStatusCounts[groupKey].unpaid > 0 && getStatusBadge('unpaid', groupStatusCounts[groupKey].unpaid)}
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-white">
                      {formatCurrency(groupTotals[groupKey])}
                    </div>
                  </div>
                </div>

                {/* Expanded Expense Items */}
                {isExpanded && (
                  <div className="ml-6 mt-2 space-y-1">
                    {groupedExpenses[groupKey].map((expense) => {
                      const displayStatus = mapStatusToDisplay(expense.status);
                      return (
                        <div key={expense.id} className={`border border-gray-800/30 rounded-[4px] p-3 ${
                          displayStatus === 'paid' ? 'bg-green-900/5' :
                          displayStatus === 'pending' ? 'bg-yellow-900/5' :
                          'bg-red-900/5'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(displayStatus)}
                                <div className="font-medium text-white text-sm">{expense.description}</div>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                                {expense.vendor && <span>{expense.vendor}</span>}
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatExpenseDate(expense.date)}
                                </span>
                                <span className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-gray-300">
                                  {expense.category}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="font-semibold text-white">{formatCurrency(expense.amount)}</div>
                              <div className="flex items-center gap-1">
                                <select
                                  value={displayStatus}
                                  onChange={(e) => handleUpdateStatus(expense.id, e.target.value as 'paid' | 'pending' | 'unpaid')}
                                  onClick={(e) => e.stopPropagation()}
                                  className="h-7 w-24 bg-transparent border border-gray-700 rounded text-xs text-white focus:outline-none focus:border-[#336699] cursor-pointer"
                                >
                                  <option value="paid" className="bg-[#111827]">Paid</option>
                                  <option value="pending" className="bg-[#111827]">Pending</option>
                                  <option value="unpaid" className="bg-[#111827]">Unpaid</option>
                                </select>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteExpense(expense.id);
                                  }}
                                  className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}; 