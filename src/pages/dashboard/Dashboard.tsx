import { useState, useEffect } from 'react';
import { 
  TrendingUp,
  Clock,
  ArrowUp,
  AlertCircle
} from "lucide-react";
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type TabType = 'overview' | 'performance' | 'alerts' | 'leaks';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');
  const [todayEarnings, setTodayEarnings] = useState(3264);
  const [todayProfit, setTodayProfit] = useState(1017);
  
  // Daily Performance Metrics
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [tasksTotal, setTasksTotal] = useState(0);
  const [dailyGoal] = useState(5000); // $5k daily revenue goal
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
  
  // Calculate daily performance score
  const calculateDailyScore = () => {
    let score = 0;
    
    // Revenue achievement (40% weight)
    const revenuePercent = Math.min((todayEarnings / dailyGoal) * 100, 100);
    score += revenuePercent * 0.4;
    
    // Profit margin (20% weight)
    const marginPercent = Math.min((profitMargin / 35) * 100, 100); // 35% target margin
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

  const timeRanges = ['This Week', 'This Month', 'This Quarter', 'This Year'];

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
          Overview
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`pb-4 text-sm font-medium transition-colors relative ${
            activeTab === 'performance'
              ? 'text-white after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-blue-500'
              : 'text-gray-500 hover:text-gray-400'
          }`}
        >
          Project Performance
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`pb-4 text-sm font-medium transition-colors relative flex items-center gap-2 ${
            activeTab === 'alerts'
              ? 'text-white after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-blue-500'
              : 'text-gray-500 hover:text-gray-400'
          }`}
        >
          Alerts
          <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">3</span>
        </button>
        <button
          onClick={() => setActiveTab('leaks')}
          className={`pb-4 text-sm font-medium transition-colors relative ${
            activeTab === 'leaks'
              ? 'text-white after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-blue-500'
              : 'text-gray-500 hover:text-gray-400'
          }`}
        >
          Money Leaks
        </button>
      </div>

      {/* Content Sections */}
      {activeTab === 'overview' && (
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
                    <div className="text-lg font-bold">{profitMargin.toFixed(1)}% (Target: 35%)</div>
                  </div>
                </div>
                <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${Math.min((profitMargin / 35) * 100, 100)}%` }}></div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {profitMargin < 35 ? 'Review expenses to improve margin' : 'Great margin! Maintain it'}
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
      )}

      {activeTab === 'performance' && (
        <div>
          {/* Time Selector */}
          <div className="flex gap-2 mb-6">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range.toLowerCase().replace(' ', ''))}
                className={`px-4 py-2 text-xs rounded-md transition-colors ${
                  selectedTimeRange === range.toLowerCase().replace(' ', '')
                    ? 'bg-[#2a2a2a] border border-blue-500 text-white'
                    : 'bg-[#1a1a1a] border border-[#2a2a2a] text-gray-500 hover:border-[#3a3a3a] hover:text-gray-400'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xl">📈</span>
              <h3 className="text-base font-semibold uppercase tracking-wider">Money Per Hour by Project</h3>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Bathroom Renovations', avgProject: '$18K', avgTime: '91 hours', rate: '$198' },
                { name: 'Kitchen Remodels', avgProject: '$28K', avgTime: '179 hours', rate: '$156' },
                { name: 'Deck Installations', avgProject: '$12K', avgTime: '89 hours', rate: '$135' },
                { name: 'HVAC Systems', avgProject: '$25K', avgTime: '156 hours', rate: '$160' },
              ].map((project) => (
                <div key={project.name} className="flex justify-between items-center p-4 bg-[#0a0a0a] rounded-md">
                  <div>
                    <h4 className="text-base font-medium text-white mb-1">{project.name}</h4>
                    <p className="text-xs text-gray-500">Avg project: {project.avgProject} • Avg time: {project.avgTime}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold text-white">{project.rate}</div>
                    <div className="text-xs text-gray-500">per hour</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xl">🔔</span>
            <h3 className="text-base font-semibold uppercase tracking-wider">Profit Alerts</h3>
          </div>

          <div className="space-y-4">
            {[
              {
                title: 'Kitchen Remodel Pricing Opportunity',
                description: 'Your quotes are 15% below market rate • Potential: +$4,200 per project',
              },
              {
                title: 'Material Waste Trending Up',
                description: 'Lumber waste increased 23% this month • Costing: -$890/month',
              },
              {
                title: 'High-Value Client Pattern',
                description: 'Clients in 3 zip codes have 47% higher profit margins',
              },
            ].map((alert, index) => (
              <div key={index} className="flex justify-between items-center p-4 bg-[#0a0a0a] border border-[#2a2a2a] rounded-md">
                <div>
                  <h4 className="text-sm font-medium text-white mb-1">{alert.title}</h4>
                  <p className="text-xs text-gray-500">{alert.description}</p>
                </div>
                <button className="text-xs text-blue-500 hover:text-blue-400">View Details →</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'leaks' && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xl">🚨</span>
            <h3 className="text-base font-semibold uppercase tracking-wider">Money Leaks to Plug</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: 'Slow Invoicing',
                description: 'Average 6.3 days to send invoices after job completion',
                impact: 'Costing you: $8,400/year in delayed cash flow',
                action: 'Fix Process',
              },
              {
                title: 'Underpriced Materials',
                description: '18% markup vs 28% industry standard',
                impact: 'Costing you: $23K/year in profit',
                action: 'Update Rates',
              },
              {
                title: 'Overtime Hours',
                description: '32 overtime hours last month on poor scheduling',
                impact: 'Costing you: $1,920/month extra',
                action: 'Optimize Schedule',
              },
              {
                title: 'Equipment Rentals',
                description: 'Renting equipment used 20+ days/month',
                impact: 'Could save: $850/month by purchasing',
                action: 'Analyze Options',
              },
            ].map((leak, index) => (
              <div key={index} className="p-6 bg-[#0a0a0a] border border-[#2a2a2a] rounded-md">
                <h4 className="text-base font-medium text-white mb-2">{leak.title}</h4>
                <p className="text-sm text-gray-500 mb-4">{leak.description}</p>
                <p className="text-sm text-red-500 mb-4">{leak.impact}</p>
                <button className="px-4 py-2 bg-[#2a2a2a] border border-[#3a3a3a] rounded-md text-xs text-white hover:bg-[#3a3a3a] transition-colors">
                  {leak.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
