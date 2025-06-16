import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp,
  Clock,
  ArrowUp,
  AlertCircle,
  ArrowRight,
  Target,
  Edit3
} from "lucide-react";
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { OrganizationContext } from '../../components/layouts/DashboardLayout';
import { formatCurrency } from '../../utils/format';

type TabType = 'overview' | 'financial' | 'performance';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { selectedOrg } = useContext(OrganizationContext);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [todayEarnings, setTodayEarnings] = useState(3264);
  const [todayProfit, setTodayProfit] = useState(1017);
  
  // Pipeline data state
  const [pipelineData, setPipelineData] = useState({
    leads: { count: 0, value: 0 },
    quoted: { count: 0, value: 0 },
    active: { count: 0, value: 0 },
    completed: { count: 0, value: 0 },
    conversionRate: 0,
    closeRate: 0,
    totalPipelineValue: 0
  });
  const [pipelineLoading, setPipelineLoading] = useState(true);
  
  // Financial metrics
  const [revenueData, setRevenueData] = useState({
    thisMonth: 124532,
    lastMonth: 98420,
    thisYear: 892000,
    goal: 1200000,
    trend: [45000, 52000, 48000, 61000, 58000, 64000] // Last 6 months
  });
  
  // Goal setting modal state
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goals, setGoals] = useState({
    dailyRevenue: 5000,
    monthlyRevenue: 100000,
    annualRevenue: 1200000,
    leadConversionRate: 60,
    closeRate: 75,
    profitMargin: 35
  });
  
  // Performance metrics
  const [performanceData, setPerformanceData] = useState({
    profitMargin: 31.2,
    averageProjectValue: 28500,
    projectsCompleted: 47,
    clientSatisfaction: 4.8,
    taskCompletionRate: 89
  });
  
  // Daily Performance Metrics
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [tasksTotal, setTasksTotal] = useState(0);
  const dailyGoal = goals.dailyRevenue;
  const [responseTime, setResponseTime] = useState(1.2); // hours
  const [performanceLastUpdated, setPerformanceLastUpdated] = useState(new Date());

  // Real-time money counter
  useEffect(() => {
    const interval = setInterval(() => {
      setTodayEarnings(prev => prev + (Math.random() * 25));
      setTodayProfit(prev => prev + (Math.random() * 8));
    }, 3500);
    return () => clearInterval(interval);
  }, []);
  
  // Load today's tasks for performance score
  useEffect(() => {
    const loadTodaysTasks = async () => {
      if (!user) return;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('status')
        .gte('created_at', today.toISOString());
      
      if (!error && tasks) {
        const completed = tasks.filter(t => t.status === 'completed').length;
        setTasksCompleted(completed);
        setTasksTotal(tasks.length);
      }
      
      setPerformanceLastUpdated(new Date());
    };
    
    loadTodaysTasks();
    // Refresh every 5 minutes
    const interval = setInterval(loadTodaysTasks, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  // Fetch pipeline data
  const fetchPipelineData = async () => {
    if (!selectedOrg?.id) {
      setPipelineLoading(false);
      return;
    }

    try {
      setPipelineLoading(true);
      
      // Fetch all projects for the organization
      const { data: projects, error } = await supabase
        .from('projects')
        .select('id, status, budget, name')
        .eq('organization_id', selectedOrg.id);

      if (error) throw error;

      // Calculate pipeline metrics
      const leads = projects?.filter(p => p.status === 'lead') || [];
      const quoted = projects?.filter(p => p.status === 'quoted') || [];
      const active = projects?.filter(p => ['active', 'planned'].includes(p.status)) || [];
      const completed = projects?.filter(p => p.status === 'completed') || [];

      const leadsValue = leads.reduce((sum, p) => sum + (p.budget || 0), 0);
      const quotedValue = quoted.reduce((sum, p) => sum + (p.budget || 0), 0);
      const activeValue = active.reduce((sum, p) => sum + (p.budget || 0), 0);
      const completedValue = completed.reduce((sum, p) => sum + (p.budget || 0), 0);

      // Calculate conversion rates
      const totalLeads = leads.length;
      const totalQuotes = quoted.length;
      const totalSold = active.length + completed.length;
      
      const conversionRate = totalLeads > 0 ? Math.round((totalQuotes / totalLeads) * 100) : 0;
      const closeRate = totalQuotes > 0 ? Math.round((totalSold / totalQuotes) * 100) : 0;
      const totalPipelineValue = leadsValue + quotedValue + activeValue;

      setPipelineData({
        leads: { count: leads.length, value: leadsValue },
        quoted: { count: quoted.length, value: quotedValue },
        active: { count: active.length, value: activeValue },
        completed: { count: completed.length, value: completedValue },
        conversionRate,
        closeRate,
        totalPipelineValue
      });

    } catch (error) {
      console.error('Error fetching pipeline data:', error);
    } finally {
      setPipelineLoading(false);
    }
  };

  // Load pipeline data on mount
  useEffect(() => {
    if (selectedOrg?.id) {
      fetchPipelineData();
    }
  }, [selectedOrg?.id]);
  
  // Calculate daily performance score
  const calculateDailyScore = () => {
    let score = 0;
    
    // Revenue achievement (40% weight)
    const revenuePercent = Math.min((todayEarnings / dailyGoal) * 100, 100);
    score += revenuePercent * 0.4;
    
    // Profit margin (20% weight)
    const marginPercent = Math.min((profitMargin / goals.profitMargin) * 100, 100);
    score += marginPercent * 0.2;
    
    // Task completion (20% weight)  
    const taskPercent = tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 100 : 50;
    score += taskPercent * 0.2;
    
    // Response time (20% weight) - lower is better
    const responseScore = Math.max(0, 100 - (responseTime * 20)); // Lose 20 points per hour
    score += responseScore * 0.2;
    
    return Math.round(score);
  };

  const hourlyRate = 447;
  const profitMargin = (todayProfit / todayEarnings) * 100;
  const efficiencyScore = 87;

  // Save goals to localStorage (later we'll move to Supabase)
  const saveGoals = (newGoals: typeof goals) => {
    setGoals(newGoals);
    localStorage.setItem('dashboard-goals', JSON.stringify(newGoals));
  };

  // Load goals from localStorage on mount
  useEffect(() => {
    const savedGoals = localStorage.getItem('dashboard-goals');
    if (savedGoals) {
      try {
        const parsedGoals = JSON.parse(savedGoals);
        setGoals(parsedGoals);
      } catch (error) {
        console.error('Error loading saved goals:', error);
      }
    }
  }, []);

  // Goal Setting Modal Component
  const GoalSettingModal = () => {
    const [tempGoals, setTempGoals] = useState(goals);

    const handleSave = () => {
      saveGoals(tempGoals);
      setShowGoalModal(false);
    };

    if (!showGoalModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-[#336699]" />
              <h2 className="text-lg font-semibold text-white">Set Business Goals</h2>
            </div>
            <button
              onClick={() => setShowGoalModal(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            {/* Revenue Goals */}
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-3">Revenue Targets</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Daily Revenue Goal</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={tempGoals.dailyRevenue}
                      onChange={(e) => setTempGoals({...tempGoals, dailyRevenue: Number(e.target.value)})}
                      className="w-full bg-[#2a2a2a] border border-[#444444] rounded px-8 py-2 text-white text-sm focus:outline-none focus:border-[#336699]"
                      placeholder="5000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Monthly Revenue Goal</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={tempGoals.monthlyRevenue}
                      onChange={(e) => setTempGoals({...tempGoals, monthlyRevenue: Number(e.target.value)})}
                      className="w-full bg-[#2a2a2a] border border-[#444444] rounded px-8 py-2 text-white text-sm focus:outline-none focus:border-[#336699]"
                      placeholder="100000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Annual Revenue Goal</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={tempGoals.annualRevenue}
                      onChange={(e) => setTempGoals({...tempGoals, annualRevenue: Number(e.target.value)})}
                      className="w-full bg-[#2a2a2a] border border-[#444444] rounded px-8 py-2 text-white text-sm focus:outline-none focus:border-[#336699]"
                      placeholder="1200000"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Goals */}
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-3">Performance Targets</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Lead Conversion Rate (%)</label>
                  <input
                    type="number"
                    value={tempGoals.leadConversionRate}
                    onChange={(e) => setTempGoals({...tempGoals, leadConversionRate: Number(e.target.value)})}
                    className="w-full bg-[#2a2a2a] border border-[#444444] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#336699]"
                    placeholder="60"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Quote Close Rate (%)</label>
                  <input
                    type="number"
                    value={tempGoals.closeRate}
                    onChange={(e) => setTempGoals({...tempGoals, closeRate: Number(e.target.value)})}
                    className="w-full bg-[#2a2a2a] border border-[#444444] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#336699]"
                    placeholder="75"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Target Profit Margin (%)</label>
                  <input
                    type="number"
                    value={tempGoals.profitMargin}
                    onChange={(e) => setTempGoals({...tempGoals, profitMargin: Number(e.target.value)})}
                    className="w-full bg-[#2a2a2a] border border-[#444444] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#336699]"
                    placeholder="35"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowGoalModal(false)}
              className="flex-1 px-4 py-2 bg-[#2a2a2a] text-gray-300 rounded hover:bg-[#333333] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-[#336699] text-white rounded hover:bg-[#2a5280] transition-colors"
            >
              Save Goals
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-white mb-2">PROFIT TRACKER</h1>
        <p className="text-gray-500 text-base">Real-time profit monitoring • Identify money leaks • Track hourly earnings</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">Revenue Today</div>
          <div className="text-3xl font-semibold text-white mb-2">${todayEarnings.toFixed(0)}</div>
          <div className="text-sm text-gray-500">67% of daily goal</div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">Profit Today</div>
          <div className="text-3xl font-semibold text-white mb-2">${todayProfit.toFixed(0)}</div>
          <div className="text-sm text-green-500">{profitMargin.toFixed(1)}% margin</div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">Hourly Rate</div>
          <div className="text-3xl font-semibold text-white mb-2">${hourlyRate}</div>
          <div className="text-sm text-gray-500">$12 above target</div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">Efficiency Score</div>
          <div className="text-3xl font-semibold text-white mb-2">{efficiencyScore}%</div>
          <div className="text-sm text-green-500">+5% this week</div>
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
          📊 Overview
        </button>
        <button
          onClick={() => setActiveTab('financial')}
          className={`pb-4 text-sm font-medium transition-colors relative ${
            activeTab === 'financial'
              ? 'text-white after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-blue-500'
              : 'text-gray-500 hover:text-gray-400'
          }`}
        >
          💰 Financial
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`pb-4 text-sm font-medium transition-colors relative ${
            activeTab === 'performance'
              ? 'text-white after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-blue-500'
              : 'text-gray-500 hover:text-gray-400'
          }`}
        >
          📈 Performance
        </button>
      </div>

      {/* Business Pipeline Section - Always Visible */}
      <div className="mb-8">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#336699]" />
                Business Pipeline
              </h2>
              <p className="text-gray-400 text-sm mt-1">Lead to project conversion overview</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowGoalModal(true)}
                className="px-3 py-2 bg-[#2a2a2a] text-gray-300 rounded-[4px] text-sm font-medium hover:bg-[#333333] transition-colors flex items-center gap-1"
              >
                <Target className="w-3 h-3" />
                Goals
              </button>
              <button
                onClick={() => navigate('/projects')}
                className="px-4 py-2 bg-[#336699] text-white rounded-[4px] text-sm font-medium hover:bg-[#2a5280] transition-colors flex items-center gap-2"
              >
                View All Projects
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {pipelineLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-[#336699] animate-pulse relative">
                <div className="absolute inset-1 bg-[#336699] opacity-30 animate-pulse" style={{ animationDelay: '0.75s' }}></div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Pipeline Flow */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Leads */}
                <div 
                  onClick={() => navigate('/projects?status=lead')}
                  className="bg-[#2a2a2a] rounded-[4px] p-4 border border-[#3a3a3a] hover:bg-[#333333] transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-400 uppercase">Leads</span>
                    <span className="text-lg">💡</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{pipelineData.leads.count}</div>
                  <div className="text-xs text-gray-400">{formatCurrency(pipelineData.leads.value)}</div>
                </div>

                {/* Quotes */}
                <div 
                  onClick={() => navigate('/projects?status=quoted')}
                  className="bg-[#2a2a2a] rounded-[4px] p-4 border border-[#3a3a3a] hover:bg-[#333333] transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-400 uppercase">Quoted</span>
                    <span className="text-lg">📋</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{pipelineData.quoted.count}</div>
                  <div className="text-xs text-gray-400">{formatCurrency(pipelineData.quoted.value)}</div>
                </div>

                {/* Active Projects */}
                <div 
                  onClick={() => navigate('/projects?status=active')}
                  className="bg-[#2a2a2a] rounded-[4px] p-4 border border-[#3a3a3a] hover:bg-[#333333] transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-400 uppercase">Active</span>
                    <span className="text-lg">🏗️</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{pipelineData.active.count}</div>
                  <div className="text-xs text-gray-400">{formatCurrency(pipelineData.active.value)}</div>
                </div>

                {/* Completed */}
                <div 
                  onClick={() => navigate('/projects?status=completed')}
                  className="bg-[#2a2a2a] rounded-[4px] p-4 border border-[#3a3a3a] hover:bg-[#333333] transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-400 uppercase">Completed</span>
                    <span className="text-lg">✅</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{pipelineData.completed.count}</div>
                  <div className="text-xs text-gray-400">{formatCurrency(pipelineData.completed.value)}</div>
                </div>
              </div>

              {/* Conversion Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#333333]">
                <div className="text-center">
                  <div className="text-xs font-medium text-gray-400 uppercase mb-1">Lead → Quote Rate</div>
                  <div className={`text-2xl font-bold mb-1 ${
                    pipelineData.conversionRate >= goals.leadConversionRate 
                      ? 'text-green-400' 
                      : pipelineData.conversionRate >= goals.leadConversionRate * 0.8
                      ? 'text-yellow-400'
                      : 'text-white'
                  }`}>
                    {pipelineData.conversionRate}%
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {pipelineData.quoted.count} of {pipelineData.leads.count} leads quoted
                  </div>
                  <div className="text-xs text-gray-400">Goal: {goals.leadConversionRate}%</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-gray-400 uppercase mb-1">Quote → Sold Rate</div>
                  <div className={`text-2xl font-bold mb-1 ${
                    pipelineData.closeRate >= goals.closeRate 
                      ? 'text-green-400' 
                      : pipelineData.closeRate >= goals.closeRate * 0.8
                      ? 'text-yellow-400'
                      : 'text-white'
                  }`}>
                    {pipelineData.closeRate}%
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {pipelineData.active.count + pipelineData.completed.count} of {pipelineData.quoted.count} quotes closed
                  </div>
                  <div className="text-xs text-gray-400">Goal: {goals.closeRate}%</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-gray-400 uppercase mb-1">Pipeline Value</div>
                  <div className="text-2xl font-bold text-white">{formatCurrency(pipelineData.totalPipelineValue)}</div>
                  <div className="text-xs text-gray-500">Active opportunities</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Sections */}
      {activeTab === 'overview' && (
        <>
          {/* Revenue Trend Chart - Hero Section */}
          <div className="mb-6">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-white font-semibold text-lg">Revenue Trend</h2>
                  <p className="text-gray-400 text-sm mt-1">6-month revenue performance</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-[#336699] text-white rounded text-xs">6M</button>
                  <button className="px-3 py-1 bg-[#2a2a2a] text-gray-400 rounded text-xs hover:bg-[#333333]">12M</button>
                  <button className="px-3 py-1 bg-[#2a2a2a] text-gray-400 rounded text-xs hover:bg-[#333333]">All</button>
                </div>
              </div>
              
              {/* Enhanced Bar Chart */}
              <div className="relative h-80">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 w-12">
                  <span>$80K</span>
                  <span>$60K</span>
                  <span>$40K</span>
                  <span>$20K</span>
                  <span>$0</span>
                </div>
                
                {/* Chart area */}
                <div className="ml-14 h-full flex items-end gap-4 px-4">
                  {revenueData.trend.map((value, index) => {
                    const height = (value / 80000) * 100; // Max scale at 80K
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
                    const isCurrentMonth = index === 5; // June is current
                    
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center group">
                        <div className="relative w-full h-64 flex items-end">
                          {/* Bar */}
                          <div 
                            className={`w-full ${isCurrentMonth ? 'bg-[#F9D71C]' : 'bg-[#336699]'} rounded-t transition-all duration-500 hover:opacity-80 relative`}
                            style={{ height: `${height}%` }}
                          >
                            {/* Value label on hover */}
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {formatCurrency(value)}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-center">
                          <span className="text-xs text-gray-400">{months[index]}</span>
                          {isCurrentMonth && <div className="text-xs text-[#F9D71C] font-medium">Current</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Grid lines */}
                <div className="absolute left-14 right-0 top-0 h-64 pointer-events-none">
                  <div className="h-full relative">
                    <div className="absolute w-full h-px bg-gray-800 top-0"></div>
                    <div className="absolute w-full h-px bg-gray-800 top-1/4"></div>
                    <div className="absolute w-full h-px bg-gray-800 top-1/2"></div>
                    <div className="absolute w-full h-px bg-gray-800 top-3/4"></div>
                    <div className="absolute w-full h-px bg-gray-800 bottom-0"></div>
                  </div>
                </div>
              </div>
              
              {/* Revenue Summary */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-[#333333]">
                <div className="text-center">
                  <div className="text-xs text-gray-400 uppercase mb-1">This Month</div>
                  <div className="text-xl font-bold text-white">{formatCurrency(revenueData.thisMonth)}</div>
                  <div className="text-xs text-green-400">+26% vs last month</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400 uppercase mb-1">This Year</div>
                  <div className="text-xl font-bold text-white">{formatCurrency(revenueData.thisYear)}</div>
                  <div className="text-xs text-blue-400">{Math.round((revenueData.thisYear / revenueData.goal) * 100)}% of goal</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400 uppercase mb-1">Annual Goal</div>
                  <div className="text-xl font-bold text-white">{formatCurrency(revenueData.goal)}</div>
                  <div className="text-xs text-gray-400">{formatCurrency(revenueData.goal - revenueData.thisYear)} remaining</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Daily Performance Metrics */}
            <div className="bg-[#111] rounded-xl p-5 lg:row-span-2">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Daily Performance</h2>
                <div className="bg-[#1a3a1a] text-green-400 px-2.5 py-1 rounded-full text-xs font-semibold">
                  {calculateDailyScore()}% Score
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-[#0a0a0a] rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">💰</span>
                    <div className="flex-1">
                      <div className="text-[11px] uppercase tracking-wider text-gray-500">Revenue vs Goal</div>
                      <div className="text-lg font-bold">${todayEarnings.toFixed(0)} / ${dailyGoal}</div>
                    </div>
                  </div>
                  <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${Math.min((todayEarnings / dailyGoal) * 100, 100)}%` }}></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {todayEarnings < dailyGoal ? `Create $${(dailyGoal - todayEarnings).toFixed(0)} more in invoices` : 'Goal achieved! Keep going!'}
                  </div>
                </div>

                <div className="bg-[#0a0a0a] rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">📈</span>
                    <div className="flex-1">
                      <div className="text-[11px] uppercase tracking-wider text-gray-500">Profit Margin</div>
                      <div className="text-lg font-bold">{profitMargin.toFixed(1)}% (Target: {goals.profitMargin}%)</div>
                    </div>
                  </div>
                  <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${Math.min((profitMargin / goals.profitMargin) * 100, 100)}%` }}></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {profitMargin < goals.profitMargin ? 'Review expenses to improve margin' : 'Great margin! Maintain it'}
                  </div>
                </div>

                <div className="bg-[#0a0a0a] rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">✅</span>
                    <div className="flex-1">
                      <div className="text-[11px] uppercase tracking-wider text-gray-500">Tasks Completed</div>
                      <div className="text-lg font-bold">{tasksCompleted} / {tasksTotal || 0}</div>
                    </div>
                  </div>
                  <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 100 : 0}%` }}></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {tasksCompleted < tasksTotal ? `Complete ${tasksTotal - tasksCompleted} more tasks` : 'All tasks done!'}
                  </div>
                </div>

                <div className="bg-[#0a0a0a] rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">⚡</span>
                    <div className="flex-1">
                      <div className="text-[11px] uppercase tracking-wider text-gray-500">Response Time</div>
                      <div className="text-lg font-bold">{responseTime.toFixed(1)} hours</div>
                    </div>
                  </div>
                  <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full transition-all" style={{ width: `${Math.max(0, 100 - (responseTime * 20))}%` }}></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {responseTime > 2 ? 'Reply to pending messages' : 'Great response time!'}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-center text-xs text-gray-500">
                Last updated: {performanceLastUpdated.toLocaleTimeString()}
              </div>
            </div>

            {/* Live Money Flow */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-xl">💰</span>
                <h3 className="text-base font-semibold uppercase tracking-wider">Live Money Flow</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">This Week</div>
                  <div className="text-2xl font-semibold text-white mb-2">$47K</div>
                  <div className="text-sm text-green-500">+23% vs last week</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">Hours Worked</div>
                  <div className="text-2xl font-semibold text-white mb-2">42.5</div>
                  <div className="text-sm text-gray-500">Best week this month</div>
                </div>
              </div>
            </div>

            {/* Efficiency Tracker */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-xl">📊</span>
                <h3 className="text-base font-semibold uppercase tracking-wider">Efficiency Metrics</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-300">Project Completion</span>
                    <span className="text-xl font-semibold">14.2 days</span>
                  </div>
                  <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '82%' }}></div>
                  </div>
                  <div className="text-xs text-green-500 mt-1">18% faster than last quarter</div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-300">Material Waste Rate</span>
                    <span className="text-xl font-semibold">8.3%</span>
                  </div>
                  <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '83%' }}></div>
                  </div>
                  <div className="text-xs text-green-500 mt-1">Better than 15% industry average</div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-300">Client Satisfaction</span>
                    <span className="text-xl font-semibold">4.8</span>
                  </div>
                  <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '96%' }}></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Based on 23 recent reviews</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'financial' && (
        <div className="space-y-6">
          {/* Revenue vs Goals */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Revenue vs Goals</h3>
              <button 
                onClick={() => setShowGoalModal(true)}
                className="px-3 py-1 bg-[#336699] text-white rounded text-xs hover:bg-[#2a5280] transition-colors flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                Set Goal
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Annual Progress */}
              <div>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Annual Goal Progress</span>
                    <span className="text-white">{Math.round((revenueData.thisYear / goals.annualRevenue) * 100)}%</span>
                  </div>
                  <div className="w-full bg-[#2a2a2a] rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-[#336699] to-[#4a7bc8] h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((revenueData.thisYear / goals.annualRevenue) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{formatCurrency(revenueData.thisYear)}</div>
                  <div className="text-sm text-gray-400">of {formatCurrency(goals.annualRevenue)} goal</div>
                </div>
              </div>
              
              {/* Monthly Performance */}
              <div>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">This Month vs Last</span>
                    <span className="text-green-400">+26%</span>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">Last Month</div>
                      <div className="text-lg font-semibold text-gray-300">{formatCurrency(revenueData.lastMonth)}</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">This Month</div>
                      <div className="text-lg font-semibold text-white">{formatCurrency(revenueData.thisMonth)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profit Analysis */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Profit Analysis</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-xs text-gray-400 uppercase mb-2">Profit Margin</div>
                <div className="text-3xl font-bold text-green-400 mb-1">{performanceData.profitMargin}%</div>
                <div className="text-xs text-gray-500">Target: 35%</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400 uppercase mb-2">Avg Project Value</div>
                <div className="text-3xl font-bold text-white mb-1">{formatCurrency(performanceData.averageProjectValue)}</div>
                <div className="text-xs text-green-400">+12% vs last quarter</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400 uppercase mb-2">Projects Completed</div>
                <div className="text-3xl font-bold text-white mb-1">{performanceData.projectsCompleted}</div>
                <div className="text-xs text-gray-500">This quarter</div>
              </div>
            </div>
          </div>

          {/* Cash Flow Insights */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Cash Flow Insights</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-[#2a2a2a] rounded">
                <div>
                  <div className="text-white font-medium">Outstanding Invoices</div>
                  <div className="text-xs text-gray-400">12 invoices pending payment</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-yellow-400">{formatCurrency(84500)}</div>
                  <div className="text-xs text-gray-400">Avg 18 days overdue</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-[#2a2a2a] rounded">
                <div>
                  <div className="text-white font-medium">Upcoming Expenses</div>
                  <div className="text-xs text-gray-400">Next 30 days</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-red-400">{formatCurrency(23800)}</div>
                  <div className="text-xs text-gray-400">Materials & labor</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-6">
          {/* Year-over-Year Comparison */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Year-over-Year Performance</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-400 mb-4">Revenue Comparison</div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">2024 YTD</span>
                    <span className="text-white font-semibold">{formatCurrency(revenueData.thisYear)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">2023 YTD</span>
                    <span className="text-gray-400">{formatCurrency(652000)}</span>
                  </div>
                  <div className="flex justify-between text-green-400">
                    <span>Growth</span>
                    <span>+37%</span>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-4">Project Efficiency</div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Completion Rate</span>
                    <span className="text-white font-semibold">{performanceData.taskCompletionRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Client Satisfaction</span>
                    <span className="text-white font-semibold">{performanceData.clientSatisfaction}/5.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Repeat Clients</span>
                    <span className="text-green-400">34%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Performance */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Project Category Performance</h3>
            
            <div className="space-y-4">
              {[
                { name: 'Kitchen Remodels', revenue: 245000, margin: 34.2, projects: 12, trend: '+15%' },
                { name: 'Bathroom Renovations', revenue: 186000, margin: 28.7, projects: 18, trend: '+8%' },
                { name: 'Deck Construction', revenue: 124000, margin: 31.5, projects: 8, trend: '+22%' },
                { name: 'General Repairs', revenue: 89000, margin: 25.1, projects: 24, trend: '-3%' }
              ].map((category, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-[#2a2a2a] rounded">
                  <div className="flex-1">
                    <div className="text-white font-medium">{category.name}</div>
                    <div className="text-xs text-gray-400">{category.projects} projects • {category.margin}% margin</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-white">{formatCurrency(category.revenue)}</div>
                    <div className={`text-xs ${category.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {category.trend} vs last year
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Efficiency Metrics */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Efficiency Metrics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-center">
                  <div className="text-xs text-gray-400 uppercase mb-2">Avg Project Duration</div>
                  <div className="text-2xl font-bold text-white mb-1">14.2</div>
                  <div className="text-xs text-gray-500">days</div>
                  <div className="text-xs text-green-400 mt-1">18% faster than Q3</div>
                </div>
              </div>
              <div>
                <div className="text-center">
                  <div className="text-xs text-gray-400 uppercase mb-2">Material Waste</div>
                  <div className="text-2xl font-bold text-white mb-1">8.3%</div>
                  <div className="text-xs text-gray-500">of total cost</div>
                  <div className="text-xs text-green-400 mt-1">Below 15% target</div>
                </div>
              </div>
              <div>
                <div className="text-center">
                  <div className="text-xs text-gray-400 uppercase mb-2">Revenue per Hour</div>
                  <div className="text-2xl font-bold text-white mb-1">$168</div>
                  <div className="text-xs text-gray-500">average rate</div>
                  <div className="text-xs text-green-400 mt-1">+12% vs target</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goal Setting Modal */}
      <GoalSettingModal />
    </div>
  );
};

export default Dashboard;
