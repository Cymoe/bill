import React, { useState } from 'react';
import { ChevronDown, ChevronRight, MoreVertical, Package, CheckSquare, FileText, Copy, Trash2, Edit, Layers } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { WorkPack } from '../../services/WorkPackService';

interface ExpandableWorkPackRowProps {
  workPack: WorkPack;
  onEdit: (workPack: WorkPack) => void;
  onDuplicate: (workPack: WorkPack) => void;
  onDelete: (workPack: WorkPack) => void;
}

export const ExpandableWorkPackRow: React.FC<ExpandableWorkPackRowProps> = ({
  workPack,
  onEdit,
  onDuplicate,
  onDelete
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(false);
    onEdit(workPack);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(false);
    onDuplicate(workPack);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(false);
    onDelete(workPack);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'basic':
        return 'bg-gray-600 text-gray-100';
      case 'standard':
        return 'bg-blue-600 text-blue-100';
      case 'premium':
        return 'bg-purple-600 text-purple-100';
      default:
        return 'bg-gray-600 text-gray-100';
    }
  };

  return (
    <div className="bg-[#1a1a1a] hover:bg-[#222222] transition-colors">
      <div
        className="px-6 py-4 cursor-pointer"
        onClick={toggleExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
            
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h4 className="text-white font-medium">{workPack.name}</h4>
                <span className={`px-2 py-1 text-xs rounded-full ${getTierColor(workPack.tier)}`}>
                  {workPack.tier.charAt(0).toUpperCase() + workPack.tier.slice(1)}
                </span>
              </div>
              {workPack.description && (
                <p className="text-sm text-gray-400 mt-1">{workPack.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Package className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">{workPack.product_count || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckSquare className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">{workPack.task_count || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">{workPack.document_count || 0}</span>
              </div>
            </div>

            <div className="text-right min-w-[120px]">
              <div className="font-mono text-white">
                {formatCurrency(workPack.calculated_price || workPack.base_price || 0)}
              </div>
              {workPack.calculated_price && workPack.base_price && workPack.calculated_price !== workPack.base_price && (
                <div className="text-xs text-gray-500">
                  Base: {formatCurrency(workPack.base_price)}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={handleDropdownClick}
                className="p-2 hover:bg-[#333333] rounded-lg transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-[#222222] border border-[#333333] rounded-lg shadow-lg z-10 min-w-[160px]">
                  <button
                    onClick={handleEdit}
                    className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-[#333333] hover:text-white transition-colors flex items-center gap-2"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={handleDuplicate}
                    className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-[#333333] hover:text-white transition-colors flex items-center gap-2"
                  >
                    <Copy className="w-3 h-3" />
                    Duplicate
                  </button>
                  <div className="border-t border-[#333333] my-1"></div>
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-400/20 hover:text-red-300 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 pb-4 border-t border-[#333333]">
          <div className="grid grid-cols-3 gap-6 mt-4">
            {/* Products Section */}
            <div className="bg-[#222222] rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-purple-400" />
                Products ({workPack.product_count || 0})
              </h5>
              <div className="text-sm text-gray-400">
                {workPack.product_count ? (
                  <p>{workPack.product_count} products included in this work pack</p>
                ) : (
                  <p>No products added yet</p>
                )}
              </div>
            </div>

            {/* Tasks Section */}
            <div className="bg-[#222222] rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-blue-400" />
                Tasks ({workPack.task_count || 0})
              </h5>
              <div className="text-sm text-gray-400">
                {workPack.task_count ? (
                  <p>{workPack.task_count} tasks defined for this work pack</p>
                ) : (
                  <p>No tasks defined yet</p>
                )}
              </div>
            </div>

            {/* Documents Section */}
            <div className="bg-[#222222] rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-400" />
                Documents ({workPack.document_count || 0})
              </h5>
              <div className="text-sm text-gray-400">
                {workPack.document_count ? (
                  <p>{workPack.document_count} document templates attached</p>
                ) : (
                  <p>No documents attached yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-gray-500">Status:</span>
            <span className={`px-2 py-1 text-xs rounded-full ${
              workPack.is_active 
                ? 'bg-green-600/20 text-green-400 border border-green-600/50' 
                : 'bg-gray-600/20 text-gray-400 border border-gray-600/50'
            }`}>
              {workPack.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};