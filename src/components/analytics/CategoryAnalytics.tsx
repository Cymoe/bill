import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  TrendingUp, TrendingDown, DollarSign, Clock, CheckCircle, 
  ListTodo, Receipt, Briefcase, ArrowUp, ArrowDown, 
  BarChart3, PieChart, Activity, Calendar, Download, FileText, FileSpreadsheet, Target
} from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { exportToExcel, exportToPDF, ExportData } from '../../utils/exportUtils';
import { ScheduledReportsModal } from './ScheduledReportsModal';
import { CategoryDetailModal } from './CategoryDetailModal';
import { YearOverYearChart } from './YearOverYearChart';
import { GoalSettingModal } from './GoalSettingModal';
import { RevenueTrendChart } from './charts/RevenueTrendChart';
import { CategoryDistributionChart } from './charts/CategoryDistributionChart';
import { PerformanceMetricsChart } from './charts/PerformanceMetricsChart';

interface CategoryMetrics {
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  projectCount: number;
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  profitMargin: number;
  avgProjectDuration: number;
  avgProjectValue: number;
  taskCompletionRate: number;
  totalTasks: number;
  completedTasks: number;
  topExpenseCategories: { category: string; amount: number }[];
}

interface TimeRangeFilter {
  label: string;
  value: 'week' | 'month' | 'quarter' | 'year' | 'all';
  days: number | null;
}

const timeRanges: TimeRangeFilter[] = [
  { label: 'This Week', value: 'week', days: 7 },
  { label: 'This Month', value: 'month', days: 30 },
  { label: 'This Quarter', value: 'quarter', days: 90 },
  { label: 'This Year', value: 'year', days: 365 },
  { label: 'All Time', value: 'all', days: null }
];

export const CategoryAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>(timeRanges[1]); // Default to month
  const [categoryMetrics, setCategoryMetrics] = useState<CategoryMetrics[]>([]);
  const [totalMetrics, setTotalMetrics] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    totalProfit: 0,
    avgProfitMargin: 0,
    totalProjects: 0,
    activeProjects: 0,
    totalTasks: 0,
    completedTasks: 0
  });
  const [showScheduledReports, setShowScheduledReports] = useState(false);
  const [showGoalSetting, setShowGoalSetting] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string } | null>(null);
  const [yoyData, setYoyData] = useState<{
    revenue: any[];
    profit: any[];
    projects: any[];
  }>({ revenue: [], profit: [], projects: [] });
  const [goals, setGoals] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<{
    labels: string[];
    revenue: number[];
    profit: number[];
    expenses: number[];
  }>({ labels: [], revenue: [], profit: [], expenses: [] });

  useEffect(() => {
    if (user) {
      loadAnalytics();
      loadYearOverYearData();
      loadGoals();
      loadTrendData();
    }
  }, [user, timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get date filter
      const startDate = timeRange.days 
        ? new Date(Date.now() - timeRange.days * 24 * 60 * 60 * 1000).toISOString()
        : null;

      // Load all categories
      const { data: categoriesData, error: catError } = await supabase
        .from('project_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (catError) throw catError;
      
      setCategories(categoriesData.map(c => ({ id: c.id, name: c.name })));

      // Build analytics for each category
      const metricsPromises = categoriesData.map(async (category) => {
        // Get projects for this category
        let projectQuery = supabase
          .from('projects')
          .select('*')
          .eq('user_id', user?.id)
          .eq('category_id', category.id);

        if (startDate) {
          projectQuery = projectQuery.gte('created_at', startDate);
        }

        const { data: projects, error: projError } = await projectQuery;
        if (projError) throw projError;

        const projectIds = projects?.map(p => p.id) || [];
        
        // Get financial metrics
        let expenseTotal = 0;
        let revenue = 0;
        
        if (projectIds.length > 0) {
          // Get expenses
          const { data: expenses, error: expError } = await supabase
            .from('expenses')
            .select('amount, expense_category')
            .in('project_id', projectIds);
            
          if (!expError && expenses) {
            expenseTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
          }

          // Get revenue (from project budgets for now)
          revenue = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
        }

        // Calculate average project duration
        let avgDuration = 0;
        if (projects && projects.length > 0) {
          const durations = projects.map(p => {
            const start = new Date(p.start_date);
            const end = new Date(p.end_date);
            return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
          });
          avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
        }

        // Get task metrics
        let taskData = { total: 0, completed: 0 };
        if (projectIds.length > 0) {
          const { data: tasks, error: taskError } = await supabase
            .from('tasks')
            .select('status')
            .in('project_id', projectIds);
            
          if (!taskError && tasks) {
            taskData.total = tasks.length;
            taskData.completed = tasks.filter(t => t.status === 'completed').length;
          }
        }

        // Get expense breakdown
        let expenseBreakdown: { category: string; amount: number }[] = [];
        if (projectIds.length > 0) {
          const { data: expenses, error: expError } = await supabase
            .from('expenses')
            .select('expense_category, amount')
            .in('project_id', projectIds);
            
          if (!expError && expenses) {
            const grouped = expenses.reduce((acc, e) => {
              acc[e.expense_category] = (acc[e.expense_category] || 0) + e.amount;
              return acc;
            }, {} as Record<string, number>);
            
            expenseBreakdown = Object.entries(grouped)
              .map(([category, amount]) => ({ category, amount }))
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 3); // Top 3
          }
        }

        const profit = revenue - expenseTotal;
        const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

        return {
          categoryId: category.id,
          categoryName: category.name,
          categorySlug: category.slug,
          projectCount: projects?.length || 0,
          totalRevenue: revenue,
          totalExpenses: expenseTotal,
          profit,
          profitMargin,
          avgProjectDuration: avgDuration,
          avgProjectValue: projects?.length ? revenue / projects.length : 0,
          taskCompletionRate: taskData.total > 0 ? (taskData.completed / taskData.total) * 100 : 0,
          totalTasks: taskData.total,
          completedTasks: taskData.completed,
          topExpenseCategories: expenseBreakdown
        };
      });

      const metrics = await Promise.all(metricsPromises);
      
      // Filter out categories with no projects
      const activeMetrics = metrics.filter(m => m.projectCount > 0);
      setCategoryMetrics(activeMetrics);

      // Calculate totals
      const totals = activeMetrics.reduce((acc, m) => ({
        totalRevenue: acc.totalRevenue + m.totalRevenue,
        totalExpenses: acc.totalExpenses + m.totalExpenses,
        totalProfit: acc.totalProfit + m.profit,
        totalProjects: acc.totalProjects + m.projectCount,
        totalTasks: acc.totalTasks + m.totalTasks,
        completedTasks: acc.completedTasks + m.completedTasks
      }), {
        totalRevenue: 0,
        totalExpenses: 0,
        totalProfit: 0,
        totalProjects: 0,
        totalTasks: 0,
        completedTasks: 0
      });

      // Get active projects count
      const { count: activeCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('status', 'active');

      setTotalMetrics({
        ...totals,
        avgProfitMargin: totals.totalRevenue > 0 ? (totals.totalProfit / totals.totalRevenue) * 100 : 0,
        activeProjects: activeCount || 0
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadYearOverYearData = async () => {
    try {
      // Get current year and previous year
      const currentYear = new Date().getFullYear();
      const previousYear = currentYear - 1;

      // Mock data for demonstration - in production, this would query actual data
      const mockYoyData = {
        revenue: [
          { month: 'Jan', currentYear: 45000, previousYear: 38000, percentageChange: 18.4 },
          { month: 'Feb', currentYear: 52000, previousYear: 41000, percentageChange: 26.8 },
          { month: 'Mar', currentYear: 48000, previousYear: 45000, percentageChange: 6.7 },
          { month: 'Apr', currentYear: 55000, previousYear: 47000, percentageChange: 17.0 },
          { month: 'May', currentYear: 61000, previousYear: 52000, percentageChange: 17.3 },
          { month: 'Jun', currentYear: 58000, previousYear: 54000, percentageChange: 7.4 },
        ],
        profit: [
          { month: 'Jan', currentYear: 18000, previousYear: 15000, percentageChange: 20.0 },
          { month: 'Feb', currentYear: 21000, previousYear: 16000, percentageChange: 31.3 },
          { month: 'Mar', currentYear: 19000, previousYear: 18000, percentageChange: 5.6 },
          { month: 'Apr', currentYear: 22000, previousYear: 19000, percentageChange: 15.8 },
          { month: 'May', currentYear: 24000, previousYear: 21000, percentageChange: 14.3 },
          { month: 'Jun', currentYear: 23000, previousYear: 22000, percentageChange: 4.5 },
        ],
        projects: [
          { month: 'Jan', currentYear: 8, previousYear: 6, percentageChange: 33.3 },
          { month: 'Feb', currentYear: 10, previousYear: 7, percentageChange: 42.9 },
          { month: 'Mar', currentYear: 9, previousYear: 8, percentageChange: 12.5 },
          { month: 'Apr', currentYear: 11, previousYear: 8, percentageChange: 37.5 },
          { month: 'May', currentYear: 12, previousYear: 10, percentageChange: 20.0 },
          { month: 'Jun', currentYear: 10, previousYear: 9, percentageChange: 11.1 },
        ]
      };

      setYoyData(mockYoyData);
    } catch (error) {
      console.error('Error loading YoY data:', error);
    }
  };

  const loadGoals = () => {
    // Load goals from localStorage (in production, from Supabase)
    const savedGoals = localStorage.getItem(`goals_${user?.id}`);
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  };

  const loadTrendData = () => {
    // Mock trend data for the chart - in production, this would come from actual data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    setTrendData({
      labels: months,
      revenue: [45000, 52000, 48000, 55000, 61000, 58000],
      profit: [18000, 21000, 19000, 22000, 24000, 23000],
      expenses: [27000, 31000, 29000, 33000, 37000, 35000]
    });
  };

  const calculateGoalProgress = (goal: any) => {
    // This would calculate actual progress based on the goal type and period
    // For demo, returning mock progress
    const progress = Math.random() * 120; // Random progress between 0-120%
    return Math.min(progress, 100);
  };

  const getMetricChange = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return { value: Math.abs(change), isPositive: change >= 0 };
  };

  const getCategoryIcon = (slug: string) => {
    // This would ideally come from the category data
    return Briefcase;
  };

  const handleExportExcel = () => {
    const exportData: ExportData = {
      title: 'Category Performance Analytics',
      data: categoryMetrics.map(m => ({
        category: m.categoryName,
        projects: m.projectCount,
        revenue: m.totalRevenue,
        expenses: m.totalExpenses,
        profit: m.profit,
        profitMargin: m.profitMargin,
        avgDuration: Math.round(m.avgProjectDuration),
        taskCompletion: m.taskCompletionRate
      })),
      columns: [
        { key: 'category', label: 'Category', type: 'string' },
        { key: 'projects', label: 'Projects', type: 'number' },
        { key: 'revenue', label: 'Revenue', type: 'currency' },
        { key: 'expenses', label: 'Expenses', type: 'currency' },
        { key: 'profit', label: 'Profit', type: 'currency' },
        { key: 'profitMargin', label: 'Profit Margin (%)', type: 'percentage' },
        { key: 'avgDuration', label: 'Avg Duration (days)', type: 'number' },
        { key: 'taskCompletion', label: 'Task Completion (%)', type: 'percentage' }
      ],
      metadata: {
        dateRange: timeRange.label,
        generatedBy: user?.user_metadata?.full_name || 'User',
        organization: 'Your Organization' // This would come from org context
      }
    };
    
    exportToExcel(exportData, 'category-analytics');
  };

  const handleExportPDF = async () => {
    await exportToPDF('analytics-content', 'Category Performance Analytics', 'landscape', 'category-analytics');
  };

  // Prepare data for charts
  const categoryColors = ['#336699', '#388E3C', '#F9D71C', '#D32F2F', '#9E9E9E', '#0D47A1'];
  
  const categoryDistributionData = categoryMetrics.map((cat, index) => ({
    name: cat.categoryName,
    revenue: cat.totalRevenue,
    color: categoryColors[index % categoryColors.length]
  }));

  const performanceMetricsData = categoryMetrics.map(cat => ({
    category: cat.categoryName,
    profitMargin: cat.profitMargin,
    taskCompletion: cat.taskCompletionRate,
    avgDuration: cat.avgProjectDuration
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#336699]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">CATEGORY ANALYTICS</h1>
          <p className="text-gray-400 mt-1">Performance insights by project category</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Export Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-[#333333] text-white rounded-[4px] hover:bg-[#404040] transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="text-sm font-medium">EXPORT EXCEL</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-[#333333] text-white rounded-[4px] hover:bg-[#404040] transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium">EXPORT PDF</span>
            </button>
            <button
              onClick={() => setShowScheduledReports(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#336699] text-white rounded-[4px] hover:bg-[#2A5580] transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">SCHEDULE REPORTS</span>
            </button>
            <button
              onClick={() => setShowGoalSetting(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#F9D71C] text-[#121212] rounded-[4px] hover:bg-[#E5C61A] transition-colors"
            >
              <Target className="w-4 h-4" />
              <span className="text-sm font-medium">SET GOALS</span>
            </button>
          </div>
          
          {/* Time Range Filter */}
          <div className="flex items-center gap-2">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  timeRange.value === range.value
                    ? 'bg-[#336699] text-white'
                    : 'bg-[#333333] text-gray-400 hover:text-white hover:bg-[#404040]'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Analytics Content - wrapped in div with ID for PDF export */}
      <div id="analytics-content">
        {/* Goal Progress Section */}
        {goals.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">GOAL PROGRESS</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.slice(0, 3).map((goal) => {
                const progress = calculateGoalProgress(goal);
                const isAchieved = progress >= 100;
                
                return (
                  <div key={goal.id} className="bg-[#333333] rounded p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm text-gray-400">
                          {goal.type === 'revenue' ? 'Revenue Goal' :
                           goal.type === 'profit' ? 'Profit Goal' :
                           goal.type === 'projects' ? 'Projects Goal' :
                           `${goal.categoryName} Revenue`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {goal.period === 'monthly' ? `Month ${goal.month}` :
                           goal.period === 'quarterly' ? `Q${goal.quarter}` :
                           'Yearly'} {goal.year}
                        </p>
                      </div>
                      {isAchieved && (
                        <div className="p-2 bg-[#388E3C]/20 rounded-full">
                          <CheckCircle className="w-5 h-5 text-[#388E3C]" />
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-lg font-mono font-semibold">
                        {goal.type === 'projects' ? goal.targetValue : formatCurrency(goal.targetValue)}
                      </p>
                      <div className="mt-2 h-2 bg-[#1E1E1E] rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            isAchieved ? 'bg-[#388E3C]' : 'bg-[#336699]'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1 text-right">
                        {progress.toFixed(0)}% Complete
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#333333] rounded p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#336699]/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-[#336699]" />
              </div>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="w-4 h-4 text-[#388E3C]" />
                <span className="text-[#388E3C]">+12%</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 uppercase mb-1">Total Revenue</p>
            <p className="text-2xl font-mono font-semibold">{formatCurrency(totalMetrics.totalRevenue)}</p>
          </div>

          <div className="bg-[#333333] rounded p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#D32F2F]/20 rounded-lg">
                <Receipt className="w-6 h-6 text-[#D32F2F]" />
              </div>
              <div className="flex items-center gap-1 text-sm">
                <TrendingDown className="w-4 h-4 text-[#388E3C]" />
                <span className="text-[#388E3C]">-5%</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 uppercase mb-1">Total Expenses</p>
            <p className="text-2xl font-mono font-semibold">{formatCurrency(totalMetrics.totalExpenses)}</p>
          </div>

          <div className="bg-[#333333] rounded p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#388E3C]/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-[#388E3C]" />
              </div>
              <div className="flex items-center gap-1 text-sm">
                <ArrowUp className="w-4 h-4 text-[#388E3C]" />
                <span className="text-[#388E3C]">+18%</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 uppercase mb-1">Net Profit</p>
            <p className="text-2xl font-mono font-semibold text-[#388E3C]">
              {formatCurrency(totalMetrics.totalProfit)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {totalMetrics.avgProfitMargin.toFixed(1)}% margin
            </p>
          </div>

          <div className="bg-[#333333] rounded p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#F9D71C]/20 rounded-lg">
                <Briefcase className="w-6 h-6 text-[#F9D71C]" />
              </div>
              <span className="text-2xl font-bold text-[#F9D71C]">{totalMetrics.activeProjects}</span>
            </div>
            <p className="text-xs text-gray-400 uppercase mb-1">Active Projects</p>
            <p className="text-2xl font-semibold">{totalMetrics.totalProjects}</p>
            <p className="text-xs text-gray-400">Total Projects</p>
          </div>
        </div>

        {/* Interactive Charts Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueTrendChart data={trendData} />
          <CategoryDistributionChart data={categoryDistributionData} />
        </div>

        {/* Performance Metrics Chart */}
        <div className="mt-6">
          <PerformanceMetricsChart data={performanceMetricsData} />
        </div>

        {/* Year-over-Year Comparison Section */}
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">YEAR-OVER-YEAR COMPARISON</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <YearOverYearChart
              data={yoyData.revenue}
              metric="revenue"
              currentYear={new Date().getFullYear()}
              previousYear={new Date().getFullYear() - 1}
            />
            <YearOverYearChart
              data={yoyData.profit}
              metric="profit"
              currentYear={new Date().getFullYear()}
              previousYear={new Date().getFullYear() - 1}
            />
            <YearOverYearChart
              data={yoyData.projects}
              metric="projects"
              currentYear={new Date().getFullYear()}
              previousYear={new Date().getFullYear() - 1}
            />
          </div>
        </div>

        {/* Category Performance Table */}
        <div className="bg-[#333333] rounded overflow-hidden">
          <div className="p-6 border-b border-[#1E1E1E]">
            <h3 className="text-lg font-medium">PERFORMANCE BY CATEGORY</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1E1E1E]">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Category</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-400 uppercase">Projects</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 uppercase">Revenue</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 uppercase">Expenses</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 uppercase">Profit</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-400 uppercase">Margin</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-400 uppercase">Avg Duration</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-400 uppercase">Task Completion</th>
                </tr>
              </thead>
              <tbody>
                {categoryMetrics.map((metric) => (
                  <tr 
                    key={metric.categoryId} 
                    className="border-b border-[#1E1E1E] hover:bg-[#1E1E1E] transition-colors cursor-pointer"
                    onClick={() => setSelectedCategory({ id: metric.categoryId, name: metric.categoryName })}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-[#336699] rounded"></div>
                        <span className="font-medium">{metric.categoryName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 bg-[#1E1E1E] rounded text-sm">
                        {metric.projectCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono">
                      {formatCurrency(metric.totalRevenue)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-gray-400">
                      {formatCurrency(metric.totalExpenses)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono">
                      <span className={metric.profit >= 0 ? 'text-[#388E3C]' : 'text-[#D32F2F]'}>
                        {formatCurrency(metric.profit)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        metric.profitMargin >= 20 ? 'bg-[#388E3C]/20 text-[#388E3C]' :
                        metric.profitMargin >= 10 ? 'bg-[#F9D71C]/20 text-[#F9D71C]' :
                        'bg-[#D32F2F]/20 text-[#D32F2F]'
                      }`}>
                        {metric.profitMargin.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm">
                      {Math.round(metric.avgProjectDuration)} days
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-[#1E1E1E] rounded overflow-hidden">
                          <div 
                            className="h-full bg-[#336699] transition-all duration-300"
                            style={{ width: `${metric.taskCompletionRate}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-12 text-right">
                          {metric.taskCompletionRate.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {categoryMetrics.length === 0 && (
            <div className="p-12 text-center text-gray-400">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No data available for the selected time period</p>
            </div>
          )}
        </div>

        {/* Category Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {categoryMetrics.slice(0, 4).map((metric) => (
            <div 
              key={metric.categoryId} 
              className="bg-[#333333] rounded p-6 cursor-pointer hover:bg-[#404040] transition-colors"
              onClick={() => setSelectedCategory({ id: metric.categoryId, name: metric.categoryName })}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium">{metric.categoryName}</h4>
                <span className="text-sm text-gray-400">{metric.projectCount} projects</span>
              </div>

              {/* Mini stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase mb-1">Avg Value</p>
                  <p className="font-mono font-semibold">{formatCurrency(metric.avgProjectValue)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase mb-1">Profit Margin</p>
                  <p className="font-semibold text-[#388E3C]">{metric.profitMargin.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase mb-1">Tasks Done</p>
                  <p className="font-semibold">{metric.completedTasks}/{metric.totalTasks}</p>
                </div>
              </div>

              {/* Top expense categories */}
              {metric.topExpenseCategories.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 uppercase mb-2">Top Expenses</p>
                  <div className="space-y-2">
                    {metric.topExpenseCategories.map((expense) => (
                      <div key={expense.category} className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">{expense.category}</span>
                        <span className="text-sm font-mono">{formatCurrency(expense.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Scheduled Reports Modal */}
      <ScheduledReportsModal 
        isOpen={showScheduledReports}
        onClose={() => setShowScheduledReports(false)}
        categories={categories}
      />

      {/* Goal Setting Modal */}
      <GoalSettingModal
        isOpen={showGoalSetting}
        onClose={() => setShowGoalSetting(false)}
        categories={categories}
        onGoalsUpdate={loadGoals}
      />

      {/* Category Detail Modal */}
      {selectedCategory && (
        <CategoryDetailModal
          isOpen={!!selectedCategory}
          onClose={() => setSelectedCategory(null)}
          categoryId={selectedCategory.id}
          categoryName={selectedCategory.name}
          dateRange={{ days: timeRange.days, label: timeRange.label }}
        />
      )}
    </div>
  );
}; 