import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/format';
import { GoalSettingModal } from './GoalSettingModal';

type TabType = 'overview' | 'revenue' | 'comparison' | 'performance';

interface CategoryMetrics {
  categoryId: string;
  categoryName: string;
  projectCount: number;
  totalRevenue: number;
  avgProjectValue: number;
  profitMargin: number;
  avgProjectDuration: number;
}

export const CategoryAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [loading, setLoading] = useState(true);
  const [showGoalSetting, setShowGoalSetting] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [categoryMetrics, setCategoryMetrics] = useState<CategoryMetrics[]>([]);
  
  // Stats
  const [totalRevenue] = useState(369000);
  const [netProfit] = useState(127000);
  const [activeProjects] = useState(12);
  const [totalProjects] = useState(20);
  const [avgProjectValue] = useState(28500);

  const calculateGoalProgress = (goal: any) => {
    // Mock progress calculation
    return Math.random() * 100;
  };

  // Initial load
  useEffect(() => {
    if (user) {
      loadData(true);
      loadGoals();
    }
  }, [user]);

  const loadData = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      
      // Load categories
      const { data: categoriesData } = await supabase
        .from('project_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (categoriesData) {
        setCategories(categoriesData.map(c => ({ id: c.id, name: c.name })));
      }

      // Mock metrics for now
      setCategoryMetrics([
        { categoryId: '1', categoryName: 'Kitchen Remodel', projectCount: 9, totalRevenue: 315000, avgProjectValue: 35000, profitMargin: 100, avgProjectDuration: 21 },
        { categoryId: '2', categoryName: 'Bathroom Remodel', projectCount: 3, totalRevenue: 54000, avgProjectValue: 18000, profitMargin: 100, avgProjectDuration: 14 },
        { categoryId: '3', categoryName: 'HVAC Install', projectCount: 4, totalRevenue: 92000, avgProjectValue: 23000, profitMargin: 38, avgProjectDuration: 5 },
        { categoryId: '4', categoryName: 'Deck Construction', projectCount: 2, totalRevenue: 24000, avgProjectValue: 12000, profitMargin: 42, avgProjectDuration: 7 },
        { categoryId: '5', categoryName: 'Other', projectCount: 2, totalRevenue: 16000, avgProjectValue: 8000, profitMargin: 35, avgProjectDuration: 3 },
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const loadGoals = () => {
    const savedGoals = localStorage.getItem(`goals_${user?.id}`);
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  };

  const periodOptions = ['6 Months', '12 Months', '24 Months', 'All Time'];

  // Refresh data when page becomes visible or regains focus
  useEffect(() => {
    // Refresh when the page becomes visible again
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        loadData(false);
        loadGoals();
      }
    };

    // Refresh when the window regains focus
    const handleFocus = () => {
      if (user) {
        loadData(false);
        loadGoals();
      }
    };

    // Listen to page visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-white mb-2">BUSINESS INSIGHTS</h1>
        <p className="text-gray-500 text-base">Long-term trends • Performance forecasting • Growth opportunities</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">Total Revenue</div>
          <div className="text-3xl font-semibold text-white mb-2">{formatCurrency(totalRevenue)}</div>
          <div className="text-sm text-green-500">+12% YTD</div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">Net Profit</div>
          <div className="text-3xl font-semibold text-white mb-2">{formatCurrency(netProfit)}</div>
          <div className="text-sm text-green-500">+18% YTD</div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">Active Projects</div>
          <div className="text-3xl font-semibold text-white mb-2">{activeProjects}</div>
          <div className="text-sm text-gray-500">{totalProjects} total projects</div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">Avg Project Value</div>
          <div className="text-3xl font-semibold text-white mb-2">{formatCurrency(avgProjectValue)}</div>
          <div className="text-sm text-green-500">+$3.2K vs last year</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-8 border-b border-[#2a2a2a]">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-4 text-sm font-medium transition-colors relative ${
            activeTab === 'overview'
              ? 'text-white after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-blue-500'
              : 'text-gray-500 hover:text-gray-400'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('revenue')}
          className={`pb-4 text-sm font-medium transition-colors relative ${
            activeTab === 'revenue'
              ? 'text-white after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-blue-500'
              : 'text-gray-500 hover:text-gray-400'
          }`}
        >
          Revenue Analysis
        </button>
        <button
          onClick={() => setActiveTab('comparison')}
          className={`pb-4 text-sm font-medium transition-colors relative ${
            activeTab === 'comparison'
              ? 'text-white after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-blue-500'
              : 'text-gray-500 hover:text-gray-400'
          }`}
        >
          Year Comparison
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`pb-4 text-sm font-medium transition-colors relative ${
            activeTab === 'performance'
              ? 'text-white after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-blue-500'
              : 'text-gray-500 hover:text-gray-400'
          }`}
        >
          Category Performance
        </button>
      </div>

      {/* Content Sections */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Goal Progress */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-semibold uppercase tracking-wider">Goal Progress</h3>
              <button
                onClick={() => setShowGoalSetting(true)}
                className="text-xs text-blue-500 hover:text-blue-400"
              >
                Set Goals →
              </button>
            </div>

            {goals.length > 0 ? (
              <div className="space-y-6">
                {goals.slice(0, 3).map((goal) => {
                  const progress = calculateGoalProgress(goal);
                  return (
                    <div key={goal.id}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-300">
                          {goal.type === 'revenue' ? 'Revenue Goal' :
                           goal.type === 'profit' ? 'Profit Goal' :
                           goal.type === 'projects' ? 'Projects Goal' :
                           `${goal.categoryName} Revenue`}
                        </span>
                        <span className="text-xl font-semibold">
                          {goal.type === 'projects' ? goal.targetValue : formatCurrency(goal.targetValue)}
                        </span>
                      </div>
                      <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatCurrency(goal.targetValue * progress / 100)} achieved • {progress.toFixed(0)}% complete • 
                        {goal.period === 'monthly' ? ' 30 days remaining' :
                         goal.period === 'quarterly' ? ' 90 days remaining' :
                         ' On track'}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No goals set yet</p>
                <button
                  onClick={() => setShowGoalSetting(true)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm transition-colors"
                >
                  Set Your First Goal
                </button>
              </div>
            )}
          </div>

          {/* Key Metrics */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
            <h3 className="text-base font-semibold uppercase tracking-wider mb-6">Key Metrics</h3>

            <div className="space-y-4">
              {[
                { label: 'Profit Margin', value: 34.4 },
                { label: 'Client Retention', value: 87 },
                { label: 'On-Time Completion', value: 92 },
                { label: 'Quote Win Rate', value: 68 },
              ].map((metric) => (
                <div key={metric.label} className="flex items-center gap-4">
                  <span className="text-sm text-gray-300 flex-shrink-0 w-32">{metric.label}</span>
                  <div className="flex-1 h-6 bg-[#2a2a2a] rounded overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded"
                      style={{ width: `${metric.value}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-12 text-right">{metric.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'revenue' && (
        <div>
          {/* Period Selector */}
          <div className="flex gap-2 mb-6">
            {periodOptions.map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period.toLowerCase().replace(' ', ''))}
                className={`px-4 py-2 text-xs rounded-md transition-colors ${
                  selectedPeriod === period.toLowerCase().replace(' ', '')
                    ? 'bg-[#2a2a2a] border border-blue-500 text-white'
                    : 'bg-[#1a1a1a] border border-[#2a2a2a] text-gray-500 hover:border-[#3a3a3a] hover:text-gray-400'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 mb-6">
            <h3 className="text-base font-semibold uppercase tracking-wider mb-6">Revenue Trend</h3>
            
            {/* Simple Bar Chart */}
            <div className="relative h-[200px] mb-4">
              <div className="absolute left-0 top-0 bottom-5 w-[60px] flex flex-col justify-between text-xs text-gray-500 text-right pr-2">
                <div>$80K</div>
                <div>$60K</div>
                <div>$40K</div>
                <div>$20K</div>
                <div>$0</div>
              </div>
              <div className="ml-[70px] h-[180px] border-l border-b border-[#2a2a2a] relative">
                <div className="flex items-end h-full gap-[10px] px-[10px]">
                  {[45, 52, 48, 55, 61, 58].map((value, index) => (
                    <div
                      key={index}
                      className="flex-1 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-t cursor-pointer relative group transition-colors"
                      style={{ height: `${(value / 80) * 100}%` }}
                    >
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        ${value}K
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="ml-[70px] flex gap-[10px] px-[10px] text-xs text-gray-500">
              <div className="flex-1 text-center">Jan</div>
              <div className="flex-1 text-center">Feb</div>
              <div className="flex-1 text-center">Mar</div>
              <div className="flex-1 text-center">Apr</div>
              <div className="flex-1 text-center">May</div>
              <div className="flex-1 text-center">Jun</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
              <h3 className="text-base font-semibold uppercase tracking-wider mb-6">Revenue by Category</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                    <span className="text-sm">Kitchen Remodel</span>
                  </div>
                  <span className="text-sm font-semibold">$315K</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-600 rounded-sm"></div>
                    <span className="text-sm">Bathroom Remodel</span>
                  </div>
                  <span className="text-sm font-semibold">$54K</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-700 rounded-sm"></div>
                    <span className="text-sm">Other Projects</span>
                  </div>
                  <span className="text-sm font-semibold">$28K</span>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
              <h3 className="text-base font-semibold uppercase tracking-wider mb-6">Revenue Metrics</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">Average Monthly Revenue</span>
                  <span className="text-sm font-semibold">$56.3K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">Best Month</span>
                  <span className="text-sm font-semibold">$61K (May)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">Growth Rate</span>
                  <span className="text-sm font-semibold text-green-500">+2.3% MoM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">Projected Q2 Total</span>
                  <span className="text-sm font-semibold">$174K</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'comparison' && (
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {[
              { title: 'Revenue', current: 319000, previous: 227000, change: 40.5 },
              { title: 'Profit', current: 127000, previous: 71000, change: 78.9 },
              { title: 'Projects', current: 60, previous: 48, change: 25, isCount: true },
            ].map((item) => (
              <div key={item.title} className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-6">
                <div className="text-xs uppercase tracking-wider text-gray-500 mb-4">{item.title}</div>
                <div className="flex justify-between items-end mb-4">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">2024</div>
                    <div className="text-xl font-semibold">
                      {item.isCount ? item.previous : formatCurrency(item.previous)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">2025</div>
                    <div className="text-xl font-semibold">
                      {item.isCount ? item.current : formatCurrency(item.current)}
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-semibold text-green-500 text-center">
                  +{item.change}%
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
            <h3 className="text-base font-semibold uppercase tracking-wider mb-6">Monthly Comparison</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="pb-3 text-xs font-semibold uppercase text-gray-500">Month</th>
                    <th className="pb-3 text-xs font-semibold uppercase text-gray-500">2024 Revenue</th>
                    <th className="pb-3 text-xs font-semibold uppercase text-gray-500">2025 Revenue</th>
                    <th className="pb-3 text-xs font-semibold uppercase text-gray-500">Change</th>
                    <th className="pb-3 text-xs font-semibold uppercase text-gray-500">2024 Projects</th>
                    <th className="pb-3 text-xs font-semibold uppercase text-gray-500">2025 Projects</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { month: 'January', rev24: 38000, rev25: 45000, proj24: 6, proj25: 8 },
                    { month: 'February', rev24: 42000, rev25: 52000, proj24: 7, proj25: 10 },
                    { month: 'March', rev24: 41000, rev25: 48000, proj24: 8, proj25: 9 },
                    { month: 'April', rev24: 47000, rev25: 55000, proj24: 9, proj25: 11 },
                    { month: 'May', rev24: 52000, rev25: 61000, proj24: 10, proj25: 12 },
                    { month: 'June', rev24: 50000, rev25: 58000, proj24: 8, proj25: 10 },
                  ].map((row) => (
                    <tr key={row.month} className="border-t border-[#1a1a1a] hover:bg-[#0a0a0a]">
                      <td className="py-3">{row.month}</td>
                      <td className="py-3">{formatCurrency(row.rev24)}</td>
                      <td className="py-3">{formatCurrency(row.rev25)}</td>
                      <td className="py-3 text-green-500">
                        +{((row.rev25 - row.rev24) / row.rev24 * 100).toFixed(0)}%
                      </td>
                      <td className="py-3">{row.proj24}</td>
                      <td className="py-3">{row.proj25}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 mb-6">
            <h3 className="text-base font-semibold uppercase tracking-wider mb-6">Performance by Category</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="pb-3 text-xs font-semibold uppercase text-gray-500">Category</th>
                    <th className="pb-3 text-xs font-semibold uppercase text-gray-500">Projects</th>
                    <th className="pb-3 text-xs font-semibold uppercase text-gray-500">Revenue</th>
                    <th className="pb-3 text-xs font-semibold uppercase text-gray-500">Avg Value</th>
                    <th className="pb-3 text-xs font-semibold uppercase text-gray-500">Profit Margin</th>
                    <th className="pb-3 text-xs font-semibold uppercase text-gray-500">Avg Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryMetrics.map((metric, index) => (
                    <tr key={metric.categoryId} className="border-t border-[#1a1a1a] hover:bg-[#0a0a0a]">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-sm"
                            style={{ backgroundColor: index === 0 ? '#3b82f6' : `#${(7 - index) * 111}` }}
                          />
                          {metric.categoryName}
                        </div>
                      </td>
                      <td className="py-3">{metric.projectCount}</td>
                      <td className="py-3">{formatCurrency(metric.totalRevenue)}</td>
                      <td className="py-3">{formatCurrency(metric.avgProjectValue)}</td>
                      <td className="py-3">{metric.profitMargin}%</td>
                      <td className="py-3">{metric.avgProjectDuration} days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
              <h3 className="text-base font-semibold uppercase tracking-wider mb-6">Top Performing Categories</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">Highest Revenue</span>
                  <span className="text-sm font-semibold">Kitchen Remodel</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">Best Margin</span>
                  <span className="text-sm font-semibold">Kitchen (100%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">Fastest Completion</span>
                  <span className="text-sm font-semibold">Other (3 days)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">Most Projects</span>
                  <span className="text-sm font-semibold">Kitchen (9)</span>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
              <h3 className="text-base font-semibold uppercase tracking-wider mb-6">Growth Opportunities</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">Underutilized</span>
                  <span className="text-sm font-semibold">Deck Construction</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">High Demand</span>
                  <span className="text-sm font-semibold">Bathroom Remodel</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">Margin Improvement</span>
                  <span className="text-sm font-semibold">HVAC Install</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">Scale Potential</span>
                  <span className="text-sm font-semibold">Kitchen Remodel</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goal Setting Modal */}
      <GoalSettingModal
        isOpen={showGoalSetting}
        onClose={() => setShowGoalSetting(false)}
        categories={categories}
        onGoalsUpdate={loadGoals}
      />
    </div>
  );
}; 