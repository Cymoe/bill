import React, { useState, useEffect, useContext } from 'react';
import { ChevronDown, ChevronRight, Plus, Search, Package, CheckSquare, FileText } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { useAuth } from '../../contexts/AuthContext';
import { WorkPackService, WorkPack } from '../../services/WorkPackService';
import { NewButton } from '../common/NewButton';
import { OrganizationContext } from '../layouts/DashboardLayout';
import { ExpandableWorkPackRow } from './ExpandableWorkPackRow';
import { CreateWorkPackDrawer } from './CreateWorkPackDrawer';
import { EditWorkPackDrawer } from './EditWorkPackDrawer';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';

interface WorkPacksByIndustry {
  [industryId: string]: {
    industryName: string;
    workPacks: WorkPack[];
    packCount: number;
    totalValue: number;
  };
}

interface WorkPacksPageProps {
  editingWorkPack: WorkPack | 'new' | null;
  setEditingWorkPack: (workPack: WorkPack | 'new' | null) => void;
}

export const WorkPacksPage: React.FC<WorkPacksPageProps> = ({ editingWorkPack, setEditingWorkPack }) => {
  const { user } = useAuth();
  const { selectedOrg } = useContext(OrganizationContext);
  
  const [workPacks, setWorkPacks] = useState<WorkPack[]>([]);
  const [workPacksByIndustry, setWorkPacksByIndustry] = useState<WorkPacksByIndustry>({});
  const [expandedIndustries, setExpandedIndustries] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingWorkPack, setDeletingWorkPack] = useState<WorkPack | null>(null);
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [editingWorkPackData, setEditingWorkPackData] = useState<WorkPack | null>(null);

  const loadWorkPacks = async () => {
    if (!selectedOrg?.id) return;
    
    try {
      setIsLoading(true);
      const data = await WorkPackService.list(selectedOrg.id);
      setWorkPacks(data);
      
      // Group work packs by industry
      const grouped: WorkPacksByIndustry = {};
      
      data.forEach(workPack => {
        const industryId = workPack.industry_id || 'uncategorized';
        const industryName = workPack.industry_name || 'Uncategorized';
        
        if (!grouped[industryId]) {
          grouped[industryId] = {
            industryName,
            workPacks: [],
            packCount: 0,
            totalValue: 0
          };
        }
        
        grouped[industryId].workPacks.push(workPack);
        grouped[industryId].packCount++;
        grouped[industryId].totalValue += workPack.calculated_price || workPack.base_price || 0;
      });
      
      setWorkPacksByIndustry(grouped);
      
      // Expand all industries by default
      setExpandedIndustries(new Set(Object.keys(grouped)));
    } catch (error) {
      console.error('Error loading work packs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkPacks();
  }, [selectedOrg?.id]);

  const toggleIndustry = (industryId: string) => {
    const newExpanded = new Set(expandedIndustries);
    if (newExpanded.has(industryId)) {
      newExpanded.delete(industryId);
    } else {
      newExpanded.add(industryId);
    }
    setExpandedIndustries(newExpanded);
  };

  const handleEdit = (workPack: WorkPack) => {
    setEditingWorkPackData(workPack);
    setShowEditDrawer(true);
  };

  const handleDuplicate = async (workPack: WorkPack) => {
    try {
      await WorkPackService.duplicate(workPack.id, selectedOrg!.id);
      await loadWorkPacks();
    } catch (error) {
      console.error('Error duplicating work pack:', error);
    }
  };

  const handleDelete = (workPack: WorkPack) => {
    setDeletingWorkPack(workPack);
  };

  const confirmDelete = async () => {
    if (!deletingWorkPack || !selectedOrg) return;
    
    try {
      await WorkPackService.delete(deletingWorkPack.id, selectedOrg.id);
      await loadWorkPacks();
      setDeletingWorkPack(null);
    } catch (error) {
      console.error('Error deleting work pack:', error);
    }
  };

  const filteredWorkPacks = (industryWorkPacks: WorkPack[]) => {
    if (!searchTerm) return industryWorkPacks;
    
    const lowerSearch = searchTerm.toLowerCase();
    return industryWorkPacks.filter(workPack => 
      workPack.name.toLowerCase().includes(lowerSearch) ||
      workPack.description?.toLowerCase().includes(lowerSearch)
    );
  };

  const pageHeaderButtons = (
    <div className="flex items-center gap-2">
      <NewButton onClick={() => setShowCreateDrawer(true)} />
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="flex flex-col">
        {/* Action Bar */}
        <div className="flex items-center justify-between p-4 border-b border-[#333333]">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search work packs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#222222] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#336699] w-64"
              />
            </div>
          </div>
          {pageHeaderButtons}
        </div>

        <div className="flex-1 bg-black overflow-y-auto">
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 p-6 border-b border-[#333333]">
            <div className="bg-[#1a1a1a] rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{workPacks.length}</div>
              <div className="text-sm text-gray-400">Total Work Packs</div>
            </div>
            <div className="bg-[#1a1a1a] rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-500">
                {workPacks.reduce((sum, wp) => sum + (wp.product_count || 0), 0)}
              </div>
              <div className="text-sm text-gray-400">Total Products</div>
            </div>
            <div className="bg-[#1a1a1a] rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-500">
                {workPacks.reduce((sum, wp) => sum + (wp.task_count || 0), 0)}
              </div>
              <div className="text-sm text-gray-400">Total Tasks</div>
            </div>
            <div className="bg-[#1a1a1a] rounded-lg p-4">
              <div className="text-2xl font-bold text-green-500">
                {formatCurrency(workPacks.reduce((sum, wp) => sum + (wp.calculated_price || wp.base_price || 0), 0))}
              </div>
              <div className="text-sm text-gray-400">Total Value</div>
            </div>
          </div>

          {/* Work Packs by Industry */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#336699]"></div>
            </div>
          ) : Object.keys(workPacksByIndustry).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <div className="text-lg mb-2">No work packs found</div>
              <button
                onClick={() => setShowCreateDrawer(true)}
                className="text-[#336699] hover:text-[#4477aa] transition-colors"
              >
                Create your first work pack
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#333333]">
              {Object.entries(workPacksByIndustry).map(([industryId, industryData]) => {
                const filtered = filteredWorkPacks(industryData.workPacks);
                if (filtered.length === 0 && searchTerm) return null;
                
                return (
                  <div key={industryId} className="bg-[#111111]">
                    {/* Industry Header */}
                    <button
                      onClick={() => toggleIndustry(industryId)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#1a1a1a] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {expandedIndustries.has(industryId) ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                        <h3 className="text-lg font-semibold text-white">
                          {industryData.industryName}
                        </h3>
                        <span className="text-sm text-gray-500">
                          ({filtered.length} work packs)
                        </span>
                      </div>
                      <div className="text-sm text-gray-400">
                        Total Value: {formatCurrency(industryData.totalValue)}
                      </div>
                    </button>

                    {/* Work Packs */}
                    {expandedIndustries.has(industryId) && (
                      <div className="border-t border-[#333333] bg-black">
                        <div className="divide-y divide-[#333333]">
                          {filtered.map(workPack => (
                            <ExpandableWorkPackRow
                              key={workPack.id}
                              workPack={workPack}
                              onEdit={handleEdit}
                              onDuplicate={handleDuplicate}
                              onDelete={handleDelete}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Drawers */}
      <CreateWorkPackDrawer
        isOpen={showCreateDrawer}
        onClose={() => setShowCreateDrawer(false)}
        onSuccess={loadWorkPacks}
      />

      {editingWorkPackData && (
        <EditWorkPackDrawer
          isOpen={showEditDrawer}
          onClose={() => {
            setShowEditDrawer(false);
            setEditingWorkPackData(null);
          }}
          onSuccess={loadWorkPacks}
          workPack={editingWorkPackData}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingWorkPack && (
        <DeleteConfirmationModal
          isOpen={!!deletingWorkPack}
          onClose={() => setDeletingWorkPack(null)}
          onConfirm={confirmDelete}
          title="Delete Work Pack"
          message={`Are you sure you want to delete "${deletingWorkPack.name}"? This action cannot be undone.`}
        />
      )}
    </div>
  );
};