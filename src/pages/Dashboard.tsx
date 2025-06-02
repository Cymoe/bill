import React, { useContext } from 'react';
import { PageHeaderBar } from '../components/common/PageHeaderBar';
import { OrganizationContext } from '../components/layouts/DashboardLayout';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  FileText,
  Package,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

export default function Dashboard() {
  const { selectedOrg } = useContext(OrganizationContext);

  // Mock data for dashboard widgets
  const stats = {
    revenue: { value: '$124,532', change: '+12%', trend: 'up' },
    activeProjects: { value: '8', change: '+2', trend: 'up' },
    pendingInvoices: { value: '12', change: '-3', trend: 'down' },
    completedTasks: { value: '47', change: '+8', trend: 'up' }
  };

  return (
    <div className="py-6 px-0">
      {/* Page Header */}
      <PageHeaderBar title="Dashboard" />
      
      {/* Dashboard Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Revenue Card */}
        <div className="bg-[#333333] rounded-[4px] p-4 border-l-4 border-[#336699]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-gray-400 uppercase">This Month Revenue</h3>
            <DollarSign className="w-4 h-4 text-[#336699]" />
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{stats.revenue.value}</p>
              <p className="text-xs text-green-500 mt-1">{stats.revenue.change} from last month</p>
            </div>
          </div>
        </div>

        {/* Active Projects Card */}
        <div className="bg-[#333333] rounded-[4px] p-4 border-l-4 border-[#F9D71C]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-gray-400 uppercase">Active Projects</h3>
            <Package className="w-4 h-4 text-[#F9D71C]" />
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{stats.activeProjects.value}</p>
              <p className="text-xs text-green-500 mt-1">{stats.activeProjects.change} new this week</p>
            </div>
          </div>
        </div>

        {/* Pending Invoices Card */}
        <div className="bg-[#333333] rounded-[4px] p-4 border-l-4 border-[#D32F2F]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-gray-400 uppercase">Pending Invoices</h3>
            <FileText className="w-4 h-4 text-[#D32F2F]" />
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{stats.pendingInvoices.value}</p>
              <p className="text-xs text-green-500 mt-1">{stats.pendingInvoices.change} from last week</p>
            </div>
          </div>
        </div>

        {/* Completed Tasks Card */}
        <div className="bg-[#333333] rounded-[4px] p-4 border-l-4 border-[#388E3C]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-gray-400 uppercase">Tasks Completed</h3>
            <CheckCircle className="w-4 h-4 text-[#388E3C]" />
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{stats.completedTasks.value}</p>
              <p className="text-xs text-green-500 mt-1">{stats.completedTasks.change} this week</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity and Other Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-[#333333] rounded-[4px] p-4">
          <h2 className="text-white font-medium mb-4">Recent Projects</h2>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-[4px]">
                <div>
                  <p className="text-white text-sm font-medium">Kitchen Remodel #{i}</p>
                  <p className="text-gray-400 text-xs">Client: John Doe</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">75%</span>
                  <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-[#336699] w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-[#333333] rounded-[4px] p-4">
          <h2 className="text-white font-medium mb-4">Upcoming Tasks</h2>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-[4px]">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#F9D71C]" />
                  <div>
                    <p className="text-white text-sm">Install cabinets</p>
                    <p className="text-gray-400 text-xs">Due in {i} days</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 bg-[#F9D71C] text-[#121212] rounded-[2px] font-medium">
                  PENDING
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 