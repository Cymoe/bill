import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../utils/format';
import { useAuth } from '../../contexts/AuthContext';

interface CostCode {
  id: string;
  name: string;
  code: string;
  category: string;
}

interface BudgetItem {
  costCode: string;
  costCodeName: string;
  invoiced: number;
  actualCost: number;
  profit: number;
  margin: number;
  invoiceItems: number;
  expenseItems: number;
}

interface BudgetAnalysisProps {
  projectId: string;
}

export const BudgetAnalysis: React.FC<BudgetAnalysisProps> = ({ projectId }) => {
  const { user } = useAuth();
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [costCodes, setCostCodes] = useState<CostCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'profit' | 'margin' | 'invoiced' | 'cost'>('profit');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (user && projectId) {
      loadBudgetAnalysis();
    }
  }, [user, projectId]);

  // Re-sort budget items when sort criteria changes
  useEffect(() => {
    if (budgetItems.length > 0) {
      const sortedItems = [...budgetItems].sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case 'profit':
            comparison = a.profit - b.profit;
            break;
          case 'margin':
            comparison = a.margin - b.margin;
            break;
          case 'invoiced':
            comparison = a.invoiced - b.invoiced;
            break;
          case 'cost':
            comparison = a.actualCost - b.actualCost;
            break;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
      setBudgetItems(sortedItems);
    }
  }, [sortBy, sortOrder]);

  const loadBudgetAnalysis = async () => {
    try {
      setLoading(true);

      // Load cost codes
      const { data: costCodesData, error: costCodesError } = await supabase
        .from('cost_codes')
        .select('*')
        .order('code');

      if (costCodesError) throw costCodesError;
      setCostCodes(costCodesData || []);

      // Load expenses grouped by cost code
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('cost_code_id, amount')
        .eq('project_id', projectId);

      if (expensesError) throw expensesError;

      // Load invoice items grouped by cost code
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_items (
            cost_code_id,
            total_price
          )
        `)
        .eq('project_id', projectId);

      if (invoicesError) throw invoicesError;

      // Process expenses by cost code
      const expensesByCode = (expensesData || []).reduce((acc, expense) => {
        const codeId = expense.cost_code_id || 'no-cost-code';
        if (!acc[codeId]) {
          acc[codeId] = { total: 0, count: 0 };
        }
        acc[codeId].total += expense.amount || 0;
        acc[codeId].count += 1;
        return acc;
      }, {} as Record<string, { total: number; count: number }>);

      // Process invoice items by cost code
      const invoiceItemsByCode = (invoicesData || []).reduce((acc, invoice) => {
        (invoice.invoice_items || []).forEach(item => {
          const codeId = item.cost_code_id || 'no-cost-code';
          if (!acc[codeId]) {
            acc[codeId] = { total: 0, count: 0 };
          }
          acc[codeId].total += item.total_price || 0;
          acc[codeId].count += 1;
        });
        return acc;
      }, {} as Record<string, { total: number; count: number }>);

      // Create cost codes map
      const costCodesMap = (costCodesData || []).reduce((acc, cc) => {
        acc[cc.id] = cc;
        return acc;
      }, {} as Record<string, CostCode>);

      // Combine all cost codes that have either expenses or invoice items
      const allCostCodeIds = new Set([
        ...Object.keys(expensesByCode),
        ...Object.keys(invoiceItemsByCode)
      ]);

      const budgetAnalysis: BudgetItem[] = Array.from(allCostCodeIds).map(codeId => {
        const costCode = costCodesMap[codeId];
        const expenses = expensesByCode[codeId] || { total: 0, count: 0 };
        const invoiced = invoiceItemsByCode[codeId] || { total: 0, count: 0 };
        
        const profit = invoiced.total - expenses.total;
        const margin = invoiced.total > 0 ? (profit / invoiced.total) * 100 : 0;

        return {
          costCode: costCode?.code || (codeId === 'no-cost-code' ? 'No Code' : codeId),
          costCodeName: costCode?.name || (codeId === 'no-cost-code' ? 'Unassigned' : 'Unknown'),
          invoiced: invoiced.total,
          actualCost: expenses.total,
          profit,
          margin,
          invoiceItems: invoiced.count,
          expenseItems: expenses.count
        };
      });

      setBudgetItems(budgetAnalysis);
    } catch (error) {
      console.error('Error loading budget analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (costCode: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(costCode)) {
      newExpanded.delete(costCode);
    } else {
      newExpanded.add(costCode);
    }
    setExpandedItems(newExpanded);
  };

  const getMarginColor = (margin: number) => {
    if (margin >= 20) return 'text-green-400';
    if (margin >= 10) return 'text-green-300';
    if (margin >= 0) return 'text-[#F9D71C]';
    return 'text-red-400';
  };

  const getMarginBgColor = (margin: number) => {
    if (margin >= 20) return 'bg-green-400/10';
    if (margin >= 10) return 'bg-green-300/10';
    if (margin >= 0) return 'bg-[#F9D71C]/10';
    return 'bg-red-400/10';
  };

  const getProfitIcon = (profit: number) => {
    if (profit > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (profit < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const totals = budgetItems.reduce(
    (acc, item) => ({
      invoiced: acc.invoiced + item.invoiced,
      actualCost: acc.actualCost + item.actualCost,
      profit: acc.profit + item.profit
    }),
    { invoiced: 0, actualCost: 0, profit: 0 }
  );

  const overallMargin = totals.invoiced > 0 ? (totals.profit / totals.invoiced) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#336699]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="bg-[#F9D71C]/10 border border-[#F9D71C]/20 rounded-[4px] p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[#F9D71C] font-medium text-lg">Project Budget Analysis</div>
          <div className="flex items-center gap-2">
            {getProfitIcon(totals.profit)}
            <span className={`text-lg font-bold ${getMarginColor(overallMargin)}`}>
              {overallMargin.toFixed(1)}% margin
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Total Invoiced</div>
            <div className="text-xl font-bold text-white">{formatCurrency(totals.invoiced)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Actual Cost</div>
            <div className="text-xl font-bold text-white">{formatCurrency(totals.actualCost)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Profit</div>
            <div className={`text-xl font-bold ${getMarginColor(overallMargin)}`}>
              {formatCurrency(totals.profit)}
            </div>
          </div>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400">Sort by:</span>
        {['profit', 'margin', 'invoiced', 'cost'].map((option) => (
          <button
            key={option}
            onClick={() => {
              if (sortBy === option) {
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              } else {
                setSortBy(option as any);
                setSortOrder('desc');
              }
            }}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              sortBy === option
                ? 'bg-[#336699] text-white'
                : 'bg-[#111827]/50 text-gray-400 hover:text-white'
            }`}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
            {sortBy === option && (sortOrder === 'desc' ? ' ↓' : ' ↑')}
          </button>
        ))}
      </div>

      {/* Budget Items */}
      <div className="space-y-2">
        {budgetItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">No budget data available</div>
            <div className="text-sm text-gray-500">
              Add expenses and generate invoices to see budget analysis
            </div>
          </div>
        ) : (
          budgetItems.map((item) => {
            const isExpanded = expandedItems.has(item.costCode);
            
            return (
              <div key={item.costCode}>
                {/* Budget Item Header */}
                <div 
                  className={`${getMarginBgColor(item.margin)} border border-gray-800/50 rounded-[4px] p-4 cursor-pointer transition-colors hover:bg-opacity-80 ${
                    isExpanded ? 'bg-opacity-60' : ''
                  }`}
                  onClick={() => toggleExpanded(item.costCode)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                      <div className="font-mono text-sm text-gray-400">{item.costCode}</div>
                      <div className="font-medium text-white">{item.costCodeName}</div>
                      <div className="flex items-center gap-2">
                        {getProfitIcon(item.profit)}
                        <span className={`text-sm font-medium ${getMarginColor(item.margin)}`}>
                          {item.margin.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-right">
                        <div className="text-gray-400 text-xs">Invoiced</div>
                        <div className="font-medium text-white">{formatCurrency(item.invoiced)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-400 text-xs">Cost</div>
                        <div className="font-medium text-white">{formatCurrency(item.actualCost)}</div>
                      </div>
                      <div className="text-right min-w-[80px]">
                        <div className="text-gray-400 text-xs">Profit</div>
                        <div className={`font-bold ${getMarginColor(item.margin)}`}>
                          {formatCurrency(item.profit)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="ml-6 mt-2 bg-[#111827]/20 border border-gray-800/30 rounded-[4px] p-4">
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div>
                        <div className="text-gray-400 mb-2">Invoice Items</div>
                        <div className="text-white">
                          {item.invoiceItems} item{item.invoiceItems !== 1 ? 's' : ''}
                        </div>
                        <div className="text-green-400 font-medium">
                          {formatCurrency(item.invoiced)} total
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400 mb-2">Expenses</div>
                        <div className="text-white">
                          {item.expenseItems} expense{item.expenseItems !== 1 ? 's' : ''}
                        </div>
                        <div className="text-red-400 font-medium">
                          {formatCurrency(item.actualCost)} total
                        </div>
                      </div>
                    </div>
                    
                    {item.margin < 10 && item.profit < 0 && (
                      <div className="mt-4 p-3 bg-red-400/10 border border-red-400/20 rounded text-sm">
                        <div className="text-red-400 font-medium mb-1">⚠️ Low Margin Alert</div>
                        <div className="text-gray-300">
                          This cost code is {item.profit < 0 ? 'losing money' : 'barely profitable'}. 
                          Consider reviewing pricing or costs.
                        </div>
                      </div>
                    )}
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