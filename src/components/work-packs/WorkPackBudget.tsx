import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, TrendingUp, Calculator, Search, Edit2, AlertTriangle, Zap, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface WorkPackBudgetProps {
  workPackId: string;
}

interface CostCodeBudgetItem {
  costCodeId: string;
  costCodeName: string;
  costCodeNumber: string;
  category: string;
  budgetAmount: number;
  actualAmount: number;
  itemCount: number;
  items: WorkPackItem[];
  expenses: WorkPackExpense[];
}

interface WorkPackItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  unit: string;
}

interface WorkPackExpense {
  id: string;
  description: string;
  amount: number;
}

interface BudgetSummary {
  totalBudget: number;
  totalActual: number;
  variance: number;
  variancePercentage: number;
  itemsCount: number;
  costCodesCount: number;
}

export function WorkPackBudget({ workPackId }: WorkPackBudgetProps) {
  const { user } = useAuth();
  const [budgetItems, setBudgetItems] = useState<CostCodeBudgetItem[]>([]);
  const [summary, setSummary] = useState<BudgetSummary>({
    totalBudget: 0,
    totalActual: 0,
    variance: 0,
    variancePercentage: 0,
    itemsCount: 0,
    costCodesCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);

  useEffect(() => {
    generateBudgetFromWorkPack();
  }, [workPackId]);

  const generateBudgetFromWorkPack = async () => {
    try {
      setLoading(true);
      
      // Get work pack budget items using database function
      const { data: workPackItems, error: itemsError } = await supabase
        .rpc('get_work_pack_budget_items', { 
          p_work_pack_id: workPackId 
        });

      if (itemsError) throw itemsError;

      // Get work pack expenses using database function
      const { data: workPackExpenses, error: expensesError } = await supabase
        .rpc('get_work_pack_budget_expenses', { 
          p_work_pack_id: workPackId 
        });

      if (expensesError) throw expensesError;

      // Group items by cost code and calculate budget totals
      const costCodeGroups: { [costCodeId: string]: CostCodeBudgetItem } = {};
      
      // Add budget amounts from line items
      workPackItems?.forEach((item: any) => {
        const total = item.quantity * item.price;
        
        if (!costCodeGroups[item.cost_code_id]) {
          costCodeGroups[item.cost_code_id] = {
            costCodeId: item.cost_code_id,
            costCodeName: item.cost_code_name,
            costCodeNumber: item.cost_code_number,
            category: 'general',
            budgetAmount: 0,
            actualAmount: 0,
            itemCount: 0,
            items: [],
            expenses: []
          };
        }
        
        costCodeGroups[item.cost_code_id].budgetAmount += total;
        costCodeGroups[item.cost_code_id].itemCount += 1;
        costCodeGroups[item.cost_code_id].items.push({
          id: item.id,
          productName: item.line_item_name,
          quantity: item.quantity,
          price: item.price,
          total: total,
          unit: item.unit || 'ea'
        });
      });

      // Add actual amounts from expenses
      workPackExpenses?.forEach((expense: any) => {
        if (!costCodeGroups[expense.cost_code_id]) {
          costCodeGroups[expense.cost_code_id] = {
            costCodeId: expense.cost_code_id,
            costCodeName: expense.cost_code_name,
            costCodeNumber: expense.cost_code_number,
            category: 'general',
            budgetAmount: 0,
            actualAmount: 0,
            itemCount: 0,
            items: [],
            expenses: []
          };
        }
        
        costCodeGroups[expense.cost_code_id].actualAmount += expense.amount;
        costCodeGroups[expense.cost_code_id].expenses.push({
          id: expense.id,
          description: expense.description,
          amount: expense.amount
        });
      });

      const budgetItemsArray = Object.values(costCodeGroups)
        .sort((a, b) => a.costCodeNumber.localeCompare(b.costCodeNumber));

      setBudgetItems(budgetItemsArray);
      
      // Calculate summary
      const totalBudget = budgetItemsArray.reduce((sum, item) => sum + item.budgetAmount, 0);
      const totalActual = budgetItemsArray.reduce((sum, item) => sum + item.actualAmount, 0);
      const variance = totalActual - totalBudget;
      const variancePercentage = totalBudget > 0 ? (variance / totalBudget) * 100 : 0;
      const itemsCount = workPackItems?.length || 0;
      
      setSummary({
        totalBudget,
        totalActual,
        variance,
        variancePercentage,
        itemsCount,
        costCodesCount: budgetItemsArray.length
      });
      
      setLastGenerated(new Date());
      
    } catch (error) {
      console.error('Error generating budget:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBudgetItems = budgetItems.filter(item => {
    const matchesSearch = item.costCodeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.costCodeNumber.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(budgetItems.map(item => item.category))];

  const getCategoryTotal = (category: string) => {
    return budgetItems
      .filter(item => item.category === category)
      .reduce((sum, item) => sum + item.budgetAmount, 0);
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-red-400';
    if (variance < 0) return 'text-green-400';
    return 'text-gray-400';
  };

  const getVarianceBgColor = (variance: number) => {
    if (variance > 0) return 'bg-red-900/20 border-red-800/50';
    if (variance < 0) return 'bg-green-900/20 border-green-800/50';
    return 'bg-gray-900/20 border-gray-800/50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-gray-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Generating budget from work pack items...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Auto-Generated Budget Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-[#F9D71C]" />
          <div>
            <h3 className="text-lg font-semibold">AUTO-GENERATED BUDGET</h3>
            <p className="text-sm text-gray-400">
              Budget from {summary.itemsCount} line items vs actual expenses across {summary.costCodesCount} cost codes
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {lastGenerated && (
            <span className="text-xs text-gray-500">
              Generated {lastGenerated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={generateBudgetFromWorkPack}
            className="flex items-center gap-2 px-3 py-2 bg-[#336699] text-white rounded-[4px] hover:bg-[#336699]/80 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            REFRESH
          </button>
        </div>
      </div>

      {/* Budget Summary Cards */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-[#333333] border border-[#2a2a2a] rounded-[4px] p-4">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-[#336699]" />
            <span className="text-xs text-gray-400 uppercase tracking-wider">TOTAL BUDGET</span>
          </div>
          <div className="text-2xl font-semibold">{formatCurrency(summary.totalBudget)}</div>
          <div className="text-xs text-gray-500 mt-1">From work pack items</div>
        </div>

        <div className="bg-[#333333] border border-[#2a2a2a] rounded-[4px] p-4">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-gray-400" />
            <span className="text-xs text-gray-400 uppercase tracking-wider">ACTUAL SPENT</span>
          </div>
          <div className="text-2xl font-semibold">{formatCurrency(summary.totalActual)}</div>
          <div className="text-xs text-gray-500 mt-1">Tracked expenses</div>
        </div>

        <div className={`border rounded-[4px] p-4 ${getVarianceBgColor(summary.variance)}`}>
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <span className="text-xs text-gray-400 uppercase tracking-wider">VARIANCE</span>
          </div>
          <div className={`text-2xl font-semibold ${getVarianceColor(summary.variance)}`}>
            {summary.variance >= 0 ? '+' : ''}{formatCurrency(summary.variance)}
          </div>
          <div className={`text-xs mt-1 ${getVarianceColor(summary.variance)}`}>
            {summary.variancePercentage >= 0 ? '+' : ''}{summary.variancePercentage.toFixed(1)}% vs budget
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-[#333333] border border-[#2a2a2a] rounded-[4px] p-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">BUDGET BY CATEGORY</h4>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map(category => (
            <div key={category} className="text-center">
              <div className="text-xs text-gray-400 uppercase tracking-wider">{category}</div>
              <div className="text-lg font-semibold mt-1">{formatCurrency(getCategoryTotal(category))}</div>
              <div className="text-xs text-gray-500">
                {budgetItems.filter(item => item.category === category).length} codes
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search cost codes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1E1E1E] border border-[#555555] rounded-[4px] text-white placeholder-gray-400 focus:outline-none focus:border-[#336699]"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-[#1E1E1E] border border-[#555555] rounded-[4px] px-3 py-2 text-white focus:outline-none focus:border-[#336699]"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Cost Code Budget Items */}
      <div className="space-y-3">
        {filteredBudgetItems.map((item) => (
          <div key={item.costCodeId} className="bg-[#333333] border border-[#2a2a2a] rounded-[4px] overflow-hidden">
            {/* Cost Code Header */}
            <div className="p-4 border-b border-[#2a2a2a]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-[#336699] text-white px-2 py-1 rounded-[2px] text-sm font-mono">
                    {item.costCodeNumber}
                  </div>
                  <div>
                    <div className="font-semibold">{item.costCodeName}</div>
                    <div className="text-sm text-gray-400">{item.category} • {item.itemCount} items</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">{formatCurrency(item.budgetAmount)}</div>
                  <div className="text-sm text-gray-400">Budget</div>
                </div>
              </div>
            </div>

            {/* Work Pack Items */}
            <div className="p-4 border-b border-[#2a2a2a]">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">BUDGET ITEMS</div>
              {item.items.length > 0 ? (
                <div className="space-y-2">
                  {item.items.map((workPackItem) => (
                    <div key={workPackItem.id} className="flex items-center justify-between py-2 px-3 bg-[#1E1E1E] rounded-[2px]">
                      <div className="flex-1">
                        <div className="text-sm font-medium">{workPackItem.productName}</div>
                        <div className="text-xs text-gray-400">
                          {workPackItem.quantity} {workPackItem.unit} @ {formatCurrency(workPackItem.price)}/{workPackItem.unit}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{formatCurrency(workPackItem.total)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No budget items for this cost code
                </div>
              )}
            </div>

            {/* Expenses */}
            <div className="p-4">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">ACTUAL EXPENSES</div>
              {item.expenses.length > 0 ? (
                <div className="space-y-2">
                  {item.expenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between py-2 px-3 bg-red-900/10 border border-red-800/20 rounded-[2px]">
                      <div className="flex-1">
                        <div className="text-sm font-medium">{expense.description}</div>
                        <div className="text-xs text-red-400">
                          Expense • {formatCurrency(expense.amount)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-red-400">{formatCurrency(expense.amount)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No expenses tracked yet for this cost code
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredBudgetItems.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <div className="text-lg font-semibold mb-2">No Budget Items Found</div>
          <div>Add products to this work pack to auto-generate budget items</div>
        </div>
      )}
    </div>
  );
} 