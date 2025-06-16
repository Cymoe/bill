import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FileText, 
  FolderOpen, 
  Receipt,
  Plus,
  Search
} from 'lucide-react';
import { ProjectList } from '../components/projects/ProjectList';
import { EstimatesList } from '../components/estimates/EstimatesList';
import { InvoiceList } from '../components/invoices/InvoiceList';
import { CreateEstimateDrawer } from '../components/estimates/CreateEstimateDrawer';
import { EstimateService } from '../services/EstimateService';
import { useAuth } from '../contexts/AuthContext';
import { OrganizationContext } from '../components/layouts/DashboardLayout';
import { supabase } from '../lib/supabase';

type TabType = 'estimates' | 'projects' | 'invoices';

interface WorkStats {
  estimatesCount: number;
  projectsCount: number;
  invoicesCount: number;
}

export const Work: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { selectedOrg } = useContext(OrganizationContext);
  const [activeTab, setActiveTab] = useState<TabType>('estimates');
  const [stats, setStats] = useState<WorkStats>({
    estimatesCount: 0,
    projectsCount: 0,
    invoicesCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateEstimate, setShowCreateEstimate] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Determine active tab from URL
  useEffect(() => {
    const path = location.pathname.split('/').pop();
    if (path && ['estimates', 'projects', 'invoices'].includes(path)) {
      setActiveTab(path as TabType);
    } else {
      // Default to estimates if no specific tab
      setActiveTab('estimates');
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
            .select('id', { count: 'exact' })
            .eq('organization_id', selectedOrg.id),
          supabase
            .from('projects')
            .select('id', { count: 'exact' })
            .eq('organization_id', selectedOrg.id),
          supabase
            .from('invoices')
            .select('id', { count: 'exact' })
            .eq('organization_id', selectedOrg.id)
        ]);

        setStats({
          estimatesCount: estimatesData.count || 0,
          projectsCount: projectsData.count || 0,
          invoicesCount: invoicesData.count || 0
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
    navigate(`/work/${tab}`);
  };

  const handleCreateEstimate = () => {
    setShowCreateEstimate(true);
  };

  const handleCreateProject = () => {
    navigate('/projects/new');
  };

  const handleCreateInvoice = () => {
    navigate('/invoices/new');
  };

  const getAddButtonText = () => {
    switch (activeTab) {
      case 'estimates': return 'Add Estimate';
      case 'projects': return 'Add Project';
      case 'invoices': return 'Add Invoice';
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto p-8">
      {/* Single Unified Card */}
      <div className="bg-transparent border border-[#333333]">
        {/* Header Section */}
        <div className="px-6 py-5 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-white">Work</h1>
          
          <div className="flex items-center gap-5">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="bg-[#1E1E1E] border border-[#333333] pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#336699] w-[300px]"
              />
            </div>
            
            <button
              onClick={() => {
                if (activeTab === 'estimates') {
                  handleCreateEstimate();
                } else if (activeTab === 'projects') {
                  handleCreateProject();
                } else if (activeTab === 'invoices') {
                  handleCreateInvoice();
                }
              }}
              className="bg-white hover:bg-gray-100 text-black px-5 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 w-[150px] justify-center"
            >
              <Plus className="w-4 h-4" />
              <span>{getAddButtonText()}</span>
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-t border-[#333333]">
          <div className="flex">
            <button
              onClick={() => handleTabChange('estimates')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative flex items-center justify-center gap-2 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:transition-colors ${
                activeTab === 'estimates'
                  ? 'text-white after:bg-[#336699] bg-[#1A1A1A]'
                  : 'text-gray-500 hover:text-gray-400 after:bg-transparent hover:after:bg-[#336699] hover:bg-[#1A1A1A]/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              Estimates
              <span className="text-xs text-gray-500 ml-1">({stats.estimatesCount})</span>
            </button>
            <button
              onClick={() => handleTabChange('projects')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative flex items-center justify-center gap-2 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:transition-colors ${
                activeTab === 'projects'
                  ? 'text-white after:bg-[#336699] bg-[#1A1A1A]'
                  : 'text-gray-500 hover:text-gray-400 after:bg-transparent hover:after:bg-[#336699] hover:bg-[#1A1A1A]/50'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              Projects
              <span className="text-xs text-gray-500 ml-1">({stats.projectsCount})</span>
            </button>
            <button
              onClick={() => handleTabChange('invoices')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative flex items-center justify-center gap-2 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:transition-colors ${
                activeTab === 'invoices'
                  ? 'text-white after:bg-[#336699] bg-[#1A1A1A]'
                  : 'text-gray-500 hover:text-gray-400 after:bg-transparent hover:after:bg-[#336699] hover:bg-[#1A1A1A]/50'
              }`}
            >
              <Receipt className="w-4 h-4" />
              Invoices
              <span className="text-xs text-gray-500 ml-1">({stats.invoicesCount})</span>
            </button>
          </div>
        </div>

      </div>

      {/* Content Area - Visually connected but separate to avoid nested cards */}
      <div className="-mt-[1px]">
        {activeTab === 'estimates' && (
          <div className="[&>div]:border-t-0">
            <EstimatesList onCreateEstimate={handleCreateEstimate} searchTerm={searchTerm} />
          </div>
        )}
        {activeTab === 'projects' && (
          <div className="[&>div]:border-t-0">
            <ProjectList searchTerm={searchTerm} />
          </div>
        )}
        {activeTab === 'invoices' && (
          <div className="[&>div]:border-t-0">
            <InvoiceList searchTerm={searchTerm} />
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateEstimateDrawer
        isOpen={showCreateEstimate}
        onClose={() => setShowCreateEstimate(false)}
        onSave={async (data) => {
          try {
            if (!user) {
              throw new Error('User not authenticated');
            }

            // Calculate subtotal and tax
            const subtotal = data.total_amount;
            const tax_rate = 0; // Can be configured later
            const tax_amount = subtotal * (tax_rate / 100);
            const total_with_tax = subtotal + tax_amount;

            // Create the estimate with items
            const estimate = await EstimateService.create({
              user_id: user.id,
              organization_id: selectedOrg.id, // Use the selected organization ID
              client_id: data.client_id,
              project_id: data.project_id,
              title: data.title || '',
              description: data.description,
              subtotal: subtotal,
              tax_rate: tax_rate,
              tax_amount: tax_amount,
              total_amount: total_with_tax,
              status: data.status as any,
              issue_date: data.issue_date,
              expiry_date: data.valid_until,
              terms: data.terms,
              notes: data.notes,
              items: (data.items || []).map((item: any, index: number) => ({
                description: item.description || item.product_name || '',
                quantity: item.quantity || 1,
                unit_price: item.price || item.unit_price || 0,
                total_price: (item.quantity || 1) * (item.price || item.unit_price || 0),
                display_order: index
              }))
            });

            setShowCreateEstimate(false);
            // Refresh the estimates list
            window.location.reload();
          } catch (error) {
            console.error('Error creating estimate:', error);
          }
        }}
      />
    </div>
  );
};