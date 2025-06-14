import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  Briefcase, 
  FileText, 
  FolderOpen, 
  Receipt, 
  TrendingUp, 
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { ProjectList } from '../components/projects/ProjectList';
import { EstimatesPage } from '../pages/EstimatesPage';
import { InvoicesPage } from '../pages/InvoicesPage';
import { OrganizationContext } from '../components/layouts/DashboardLayout';
import { supabase } from '../lib/supabase';
import { AllWorkView } from '../components/work/AllWorkView';
import { PipelineView } from '../components/work/PipelineView';

type TabType = 'all' | 'estimates' | 'projects' | 'invoices' | 'pipeline';

interface WorkStats {
  estimatesCount: number;
  projectsCount: number;
  invoicesCount: number;
  totalValue: number;
}

export const Work: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedOrg } = useContext(OrganizationContext);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [stats, setStats] = useState<WorkStats>({
    estimatesCount: 0,
    projectsCount: 0,
    invoicesCount: 0,
    totalValue: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Determine active tab from URL
  useEffect(() => {
    const path = location.pathname.split('/').pop();
    if (path && ['estimates', 'projects', 'invoices', 'pipeline'].includes(path)) {
      setActiveTab(path as TabType);
    } else {
      setActiveTab('all');
    }
  }, [location]);

  // Fetch stats for tab badges
  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedOrg?.id) {
        setLoading(false);
        return;
      }

      try {
        const [estimatesData, projectsData, invoicesData] = await Promise.all([
          supabase
            .from('estimates')
            .select('id, total_amount', { count: 'exact' })
            .eq('organization_id', selectedOrg.id),
          supabase
            .from('projects')
            .select('id, budget', { count: 'exact' })
            .eq('organization_id', selectedOrg.id),
          supabase
            .from('invoices')
            .select('id, total_amount', { count: 'exact' })
            .eq('organization_id', selectedOrg.id)
        ]);

        const estimatesCount = estimatesData.count || 0;
        const projectsCount = projectsData.count || 0;
        const invoicesCount = invoicesData.count || 0;

        const estimatesValue = estimatesData.data?.reduce((sum, e) => sum + (e.total_amount || 0), 0) || 0;
        const projectsValue = projectsData.data?.reduce((sum, p) => sum + (p.budget || 0), 0) || 0;
        const invoicesValue = invoicesData.data?.reduce((sum, i) => sum + (i.total_amount || 0), 0) || 0;

        setStats({
          estimatesCount,
          projectsCount,
          invoicesCount,
          totalValue: estimatesValue + projectsValue + invoicesValue
        });
      } catch (error) {
        console.error('Error fetching work stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedOrg]);

  const handleTabChange = (tab: TabType) => {
    if (tab === 'all') {
      navigate('/work');
    } else {
      navigate(`/work/${tab}`);
    }
  };

  const tabs = [
    { id: 'all', label: 'All Work', icon: Briefcase },
    { id: 'estimates', label: 'Estimates', icon: FileText, count: stats.estimatesCount },
    { id: 'projects', label: 'Projects', icon: FolderOpen, count: stats.projectsCount },
    { id: 'invoices', label: 'Invoices', icon: Receipt, count: stats.invoicesCount },
    { id: 'pipeline', label: 'Pipeline', icon: TrendingUp }
  ];

  // Render the appropriate content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'estimates':
        return <EstimatesPage />;
      case 'projects':
        return <ProjectList />;
      case 'invoices':
        return <InvoicesPage />;
      case 'pipeline':
        return <PipelineView />;
      case 'all':
      default:
        return <AllWorkView searchQuery={searchQuery} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      <PageHeader 
        title="Work"
      />

      {/* Tab Navigation */}
      <div className="px-6 border-b border-[#1E1E1E]">
        <div className="flex items-center space-x-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as TabType)}
                className={`flex items-center gap-2 px-1 py-4 border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-[#F9D71C] text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id
                      ? 'bg-[#F9D71C]/20 text-[#F9D71C]'
                      : 'bg-[#1E1E1E] text-gray-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="px-6 py-4 border-b border-[#1E1E1E]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {activeTab === 'all' && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search all work..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-[#1E1E1E] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#F9D71C] w-64"
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/estimates/new')}
              className="flex items-center gap-2 px-4 py-2 bg-[#1E1E1E] hover:bg-[#2A2A2A] rounded-lg text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Estimate</span>
            </button>
            <button
              onClick={() => navigate('/projects/new')}
              className="flex items-center gap-2 px-4 py-2 bg-[#1E1E1E] hover:bg-[#2A2A2A] rounded-lg text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
            <button
              onClick={() => navigate('/invoices/new')}
              className="flex items-center gap-2 px-4 py-2 bg-[#F9D71C] hover:bg-[#E5C61A] rounded-lg text-black font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Quick Invoice</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

