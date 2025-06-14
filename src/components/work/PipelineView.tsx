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
  TrendingUp,
  ArrowRight,
  Loader,
  CheckCircle,
  Clock,
  Package
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { OrganizationContext } from '../layouts/DashboardLayout';
import { formatCurrency } from '../../utils/format';

interface PipelineItem {
  id: string;
  name: string;
  clientName: string;
  amount: number;
  status: string;
  date: string;
  type: 'estimate' | 'project' | 'invoice';
  estimateId?: string;
  projectId?: string;
  invoiceIds?: string[];
}

interface PipelineStage {
  name: string;
  items: PipelineItem[];
  value: number;
  count: number;
}

export const PipelineView: React.FC = () => {
  const navigate = useNavigate();
  const { selectedOrg } = useContext(OrganizationContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stages, setStages] = useState<PipelineStage[]>([
    { name: 'Estimates', items: [], value: 0, count: 0 },
    { name: 'Active Projects', items: [], value: 0, count: 0 },
    { name: 'Invoiced', items: [], value: 0, count: 0 },
    { name: 'Paid', items: [], value: 0, count: 0 }
  ]);

  useEffect(() => {
    const fetchPipelineData = async () => {
      if (!selectedOrg?.id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch all data
        const [estimatesResponse, projectsResponse, invoicesResponse] = await Promise.all([
          supabase
            .from('estimates')
            .select(`
              id,
              name,
              total_amount,
              status,
              date,
              project_id,
              clients (
                name
              )
            `)
            .eq('organization_id', selectedOrg.id)
            .in('status', ['sent', 'accepted']),
          
          supabase
            .from('projects')
            .select(`
              id,
              name,
              budget,
              status,
              start_date,
              estimate_id,
              clients (
                name
              )
            `)
            .eq('organization_id', selectedOrg.id)
            .in('status', ['planned', 'active']),
          
          supabase
            .from('invoices')
            .select(`
              id,
              invoice_number,
              total_amount,
              status,
              invoice_date,
              project_id,
              estimate_id,
              clients (
                name
              )
            `)
            .eq('organization_id', selectedOrg.id)
        ]);

        if (estimatesResponse.error) throw estimatesResponse.error;
        if (projectsResponse.error) throw projectsResponse.error;
        if (invoicesResponse.error) throw invoicesResponse.error;

        // Process estimates (not yet converted to projects)
        const unconvertedEstimates = (estimatesResponse.data || [])
          .filter(est => !est.project_id && est.status === 'sent')
          .map(est => ({
            id: est.id,
            name: est.name,
            clientName: est.clients?.name || 'Unknown Client',
            amount: est.total_amount || 0,
            status: est.status,
            date: est.date,
            type: 'estimate' as const
          }));

        // Process active projects
        const activeProjects = (projectsResponse.data || [])
          .filter(proj => proj.status === 'active')
          .map(proj => ({
            id: proj.id,
            name: proj.name,
            clientName: proj.clients?.name || 'Unknown Client',
            amount: proj.budget || 0,
            status: proj.status,
            date: proj.start_date,
            type: 'project' as const,
            estimateId: proj.estimate_id
          }));

        // Process invoices
        const pendingInvoices = (invoicesResponse.data || [])
          .filter(inv => ['sent', 'pending', 'overdue'].includes(inv.status))
          .map(inv => ({
            id: inv.id,
            name: `Invoice #${inv.invoice_number}`,
            clientName: inv.clients?.name || 'Unknown Client',
            amount: inv.total_amount || 0,
            status: inv.status,
            date: inv.invoice_date,
            type: 'invoice' as const,
            projectId: inv.project_id,
            estimateId: inv.estimate_id
          }));

        const paidInvoices = (invoicesResponse.data || [])
          .filter(inv => inv.status === 'paid')
          .map(inv => ({
            id: inv.id,
            name: `Invoice #${inv.invoice_number}`,
            clientName: inv.clients?.name || 'Unknown Client',
            amount: inv.total_amount || 0,
            status: inv.status,
            date: inv.invoice_date,
            type: 'invoice' as const,
            projectId: inv.project_id,
            estimateId: inv.estimate_id
          }));

        // Update stages
        setStages([
          {
            name: 'Estimates',
            items: unconvertedEstimates,
            value: unconvertedEstimates.reduce((sum, item) => sum + item.amount, 0),
            count: unconvertedEstimates.length
          },
          {
            name: 'Active Projects',
            items: activeProjects,
            value: activeProjects.reduce((sum, item) => sum + item.amount, 0),
            count: activeProjects.length
          },
          {
            name: 'Invoiced',
            items: pendingInvoices,
            value: pendingInvoices.reduce((sum, item) => sum + item.amount, 0),
            count: pendingInvoices.length
          },
          {
            name: 'Paid',
            items: paidInvoices,
            value: paidInvoices.reduce((sum, item) => sum + item.amount, 0),
            count: paidInvoices.length
          }
        ]);
      } catch (err) {
        console.error('Error fetching pipeline data:', err);
        setError('Failed to load pipeline data');
      } finally {
        setLoading(false);
      }
    };

    fetchPipelineData();
  }, [selectedOrg]);

  const handleItemClick = (item: PipelineItem) => {
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

  const getStageIcon = (stageName: string) => {
    switch (stageName) {
      case 'Estimates':
        return <FileText className="w-5 h-5" />;
      case 'Active Projects':
        return <FolderOpen className="w-5 h-5" />;
      case 'Invoiced':
        return <Receipt className="w-5 h-5" />;
      case 'Paid':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getStageColor = (stageName: string) => {
    switch (stageName) {
      case 'Estimates':
        return 'text-purple-400 bg-purple-500/20';
      case 'Active Projects':
        return 'text-blue-400 bg-blue-500/20';
      case 'Invoiced':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'Paid':
        return 'text-green-400 bg-green-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const totalPipelineValue = stages.reduce((sum, stage) => sum + stage.value, 0);

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

  return (
    <div className="p-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1E1E1E] border border-[#333] rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Pipeline Value</span>
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(totalPipelineValue)}
          </div>
        </div>
        {stages.map((stage) => (
          <div key={stage.name} className="bg-[#1E1E1E] border border-[#333] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">{stage.name}</span>
              <div className={`p-1 rounded ${getStageColor(stage.name)}`}>
                {getStageIcon(stage.name)}
              </div>
            </div>
            <div className="text-xl font-bold text-white">
              {formatCurrency(stage.value)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stage.count} {stage.count === 1 ? 'item' : 'items'}
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline Stages */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stages.map((stage, index) => (
          <div key={stage.name} className="relative">
            {/* Arrow between stages */}
            {index < stages.length - 1 && (
              <div className="hidden md:block absolute top-8 -right-3 z-10">
                <ArrowRight className="w-6 h-6 text-gray-600" />
              </div>
            )}

            {/* Stage Column */}
            <div className="bg-[#1E1E1E] border border-[#333] rounded-lg p-4">
              {/* Stage Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">{stage.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(stage.name)}`}>
                  {stage.count}
                </span>
              </div>

              {/* Stage Items */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {stage.items.length === 0 ? (
                  <div className="text-center py-8">
                    <div className={`inline-flex p-3 rounded-full mb-2 ${getStageColor(stage.name)}`}>
                      {getStageIcon(stage.name)}
                    </div>
                    <p className="text-gray-500 text-sm">No items</p>
                  </div>
                ) : (
                  stage.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className="bg-[#0a0a0a] hover:bg-[#2A2A2A] border border-[#333] rounded p-3 cursor-pointer transition-all group"
                    >
                      <h4 className="text-white text-sm font-medium truncate group-hover:text-[#F9D71C]">
                        {item.name}
                      </h4>
                      <p className="text-gray-400 text-xs truncate mt-1">
                        {item.clientName}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-white text-sm font-medium">
                          {formatCurrency(item.amount)}
                        </span>
                        {item.status === 'overdue' && (
                          <AlertCircle className="w-3 h-3 text-red-400" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Stage Total */}
              <div className="mt-4 pt-4 border-t border-[#333]">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Total</span>
                  <span className="text-white font-medium">
                    {formatCurrency(stage.value)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Conversion Metrics */}
      <div className="mt-8 bg-[#1E1E1E] border border-[#333] rounded-lg p-6">
        <h3 className="text-white font-medium mb-4">Conversion Rates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Estimate → Project</span>
              <span className="text-white font-medium">
                {stages[0].count > 0 ? Math.round((stages[1].count / stages[0].count) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${stages[0].count > 0 ? (stages[1].count / stages[0].count) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Project → Invoice</span>
              <span className="text-white font-medium">
                {stages[1].count > 0 ? Math.round((stages[2].count / stages[1].count) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full"
                style={{ width: `${stages[1].count > 0 ? (stages[2].count / stages[1].count) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Invoice → Paid</span>
              <span className="text-white font-medium">
                {stages[2].count > 0 ? Math.round((stages[3].count / stages[2].count) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${stages[2].count > 0 ? (stages[3].count / stages[2].count) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};