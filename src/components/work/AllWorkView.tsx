import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  FolderOpen, 
  Receipt, 
  Calendar,
  DollarSign,
  User,
  AlertCircle,
  Clock,
  CheckCircle,
  Loader
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { OrganizationContext } from '../layouts/DashboardLayout';
import { formatCurrency } from '../../utils/format';

interface WorkItem {
  id: string;
  type: 'estimate' | 'project' | 'invoice';
  name: string;
  clientName: string;
  amount: number;
  status: string;
  date: string;
  createdAt: string;
}

interface AllWorkViewProps {
  searchQuery: string;
}

export const AllWorkView: React.FC<AllWorkViewProps> = ({ searchQuery }) => {
  const navigate = useNavigate();
  const { selectedOrg } = useContext(OrganizationContext);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllWorkItems = async () => {
      if (!selectedOrg?.id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch all data in parallel
        const [estimatesResponse, projectsResponse, invoicesResponse] = await Promise.all([
          supabase
            .from('estimates')
            .select(`
              id,
              name,
              total_amount,
              status,
              date,
              created_at,
              clients (
                name
              )
            `)
            .eq('organization_id', selectedOrg.id),
          
          supabase
            .from('projects')
            .select(`
              id,
              name,
              budget,
              status,
              start_date,
              created_at,
              clients (
                name
              )
            `)
            .eq('organization_id', selectedOrg.id),
          
          supabase
            .from('invoices')
            .select(`
              id,
              invoice_number,
              total_amount,
              status,
              invoice_date,
              created_at,
              clients (
                name
              )
            `)
            .eq('organization_id', selectedOrg.id)
        ]);

        if (estimatesResponse.error) throw estimatesResponse.error;
        if (projectsResponse.error) throw projectsResponse.error;
        if (invoicesResponse.error) throw invoicesResponse.error;

        // Transform data into unified format
        const estimates: WorkItem[] = (estimatesResponse.data || []).map(estimate => ({
          id: estimate.id,
          type: 'estimate' as const,
          name: estimate.name,
          clientName: estimate.clients?.name || 'Unknown Client',
          amount: estimate.total_amount || 0,
          status: estimate.status,
          date: estimate.date,
          createdAt: estimate.created_at
        }));

        const projects: WorkItem[] = (projectsResponse.data || []).map(project => ({
          id: project.id,
          type: 'project' as const,
          name: project.name,
          clientName: project.clients?.name || 'Unknown Client',
          amount: project.budget || 0,
          status: project.status,
          date: project.start_date,
          createdAt: project.created_at
        }));

        const invoices: WorkItem[] = (invoicesResponse.data || []).map(invoice => ({
          id: invoice.id,
          type: 'invoice' as const,
          name: `Invoice #${invoice.invoice_number}`,
          clientName: invoice.clients?.name || 'Unknown Client',
          amount: invoice.total_amount || 0,
          status: invoice.status,
          date: invoice.invoice_date,
          createdAt: invoice.created_at
        }));

        // Combine and sort by creation date (newest first)
        const allItems = [...estimates, ...projects, ...invoices]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setWorkItems(allItems);
      } catch (err) {
        console.error('Error fetching work items:', err);
        setError('Failed to load work items');
      } finally {
        setLoading(false);
      }
    };

    fetchAllWorkItems();
  }, [selectedOrg]);

  // Filter items based on search query
  const filteredItems = workItems.filter(item => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.clientName.toLowerCase().includes(query) ||
      item.status.toLowerCase().includes(query)
    );
  });

  const getTypeIcon = (type: WorkItem['type']) => {
    switch (type) {
      case 'estimate':
        return <FileText className="w-4 h-4" />;
      case 'project':
        return <FolderOpen className="w-4 h-4" />;
      case 'invoice':
        return <Receipt className="w-4 h-4" />;
    }
  };

  const getTypeBadgeStyles = (type: WorkItem['type']) => {
    switch (type) {
      case 'estimate':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'project':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'invoice':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
  };

  const getStatusBadgeStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'bg-gray-500/20 text-gray-400';
      case 'sent':
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'accepted':
      case 'active':
        return 'bg-green-500/20 text-green-400';
      case 'paid':
      case 'completed':
        return 'bg-blue-500/20 text-blue-400';
      case 'overdue':
      case 'on-hold':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return <FileText className="w-3 h-3" />;
      case 'sent':
      case 'pending':
        return <Clock className="w-3 h-3" />;
      case 'accepted':
      case 'active':
      case 'paid':
      case 'completed':
        return <CheckCircle className="w-3 h-3" />;
      case 'overdue':
      case 'on-hold':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const handleItemClick = (item: WorkItem) => {
    switch (item.type) {
      case 'estimate':
        navigate(`/estimates/${item.id}`);
        break;
      case 'project':
        navigate(`/projects/${item.id}`);
        break;
      case 'invoice':
        navigate(`/invoices/${item.id}`);
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No work items found</h3>
          <p className="text-gray-400">
            {searchQuery ? 'Try adjusting your search' : 'Create your first estimate, project, or invoice to get started'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-2">
        {filteredItems.map((item) => (
          <div
            key={`${item.type}-${item.id}`}
            onClick={() => handleItemClick(item)}
            className="bg-[#1E1E1E] hover:bg-[#2A2A2A] border border-[#333] rounded-lg p-4 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Type Badge */}
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getTypeBadgeStyles(item.type)}`}>
                  {getTypeIcon(item.type)}
                  <span className="text-xs font-medium capitalize">{item.type}</span>
                </div>

                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium truncate group-hover:text-[#F9D71C] transition-colors">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span className="truncate">{item.clientName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Amount and Status */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-white font-medium">
                    {formatCurrency(item.amount)}
                  </div>
                  <div className={`flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs ${getStatusBadgeStyles(item.status)}`}>
                    {getStatusIcon(item.status)}
                    <span className="capitalize">{item.status}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};