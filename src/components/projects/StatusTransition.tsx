import React, { useState } from 'react';
import { ChevronDown, AlertCircle, CheckCircle } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface StatusTransitionProps {
  currentStatus: string;
  projectId: string;
  projectName: string;
  onStatusChange: (newStatus: string, reason?: string) => Promise<void>;
  className?: string;
}

export const StatusTransition: React.FC<StatusTransitionProps> = ({
  currentStatus,
  projectId,
  projectName,
  onStatusChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [showReasonModal, setShowReasonModal] = useState(false);

  // Get valid next statuses based on current status
  const getValidNextStatuses = (current: string): string[] => {
    console.log('getValidNextStatuses called with:', current);
    
    switch (current) {
      case 'lead':
        return ['quoted', 'sold', 'cancelled'];
      case 'quoted':
        return ['sold', 'lead', 'cancelled'];
      case 'sold':
        return ['planning', 'scheduled', 'cancelled'];
      case 'planning':
        return ['scheduled', 'active', 'on_hold', 'cancelled'];
      case 'planned':
        return ['scheduled', 'active', 'on_hold', 'cancelled'];
      case 'scheduled':
        return ['active', 'planning', 'on_hold', 'cancelled'];
      case 'active':
        return ['substantial_completion', 'completed', 'on_hold', 'cancelled'];
      case 'on_hold':
        return ['active', 'planning', 'scheduled', 'cancelled'];
      case 'substantial_completion':
        return ['completed', 'active', 'cancelled'];
      case 'completed':
        return ['warranty', 'closed', 'substantial_completion'];
      case 'warranty':
        return ['closed'];
      case 'closed':
        return [];
      case 'cancelled':
        return [];
      default:
        console.warn('Unknown status:', current);
        return ['active', 'on_hold', 'cancelled']; // fallback options
    }
  };

  const validStatuses = getValidNextStatuses(currentStatus);

  console.log('StatusTransition Debug:', {
    currentStatus,
    validStatuses,
    isOpen,
    projectId
  });

  const handleStatusSelect = async (newStatus: string) => {
    // Check if reason is needed for certain transitions
    const needsReason = ['cancelled', 'on_hold'].includes(newStatus) || 
                       isBackwardTransition(currentStatus, newStatus);
    
    if (needsReason) {
      setSelectedStatus(newStatus);
      setShowReasonModal(true);
      setIsOpen(false);
    } else {
      await executeStatusChange(newStatus);
    }
  };

  const executeStatusChange = async (newStatus: string, changeReason?: string) => {
    setIsLoading(true);
    try {
      await onStatusChange(newStatus, changeReason);
      setIsOpen(false);
      setShowReasonModal(false);
      setSelectedStatus(null);
      setReason('');
    } catch (error) {
      console.error('Failed to update status:', error);
      // Handle error (could show toast notification)
    } finally {
      setIsLoading(false);
    }
  };

  const isBackwardTransition = (from: string, to: string): boolean => {
    const statusOrder: Record<string, number> = {
      'lead': 1, 'quoted': 2, 'sold': 3, 'planning': 4, 'scheduled': 5,
      'active': 6, 'substantial_completion': 7, 'completed': 8, 'warranty': 9, 'closed': 10
    };
    return (statusOrder[to] || 0) < (statusOrder[from] || 0);
  };

  const handleReasonSubmit = async () => {
    if (selectedStatus && (reason.trim() || !['cancelled', 'on_hold'].includes(selectedStatus))) {
      await executeStatusChange(selectedStatus, reason.trim() || undefined);
    }
  };

  if (validStatuses.length === 0) {
    return (
      <div className={`flex items-center ${className}`}>
        <StatusBadge status={currentStatus} />
        <span className="ml-2 text-xs text-gray-500">(Final status)</span>
      </div>
    );
  }

  return (
    <>
      <div className={`relative ${className}`}>
        <button
          onClick={() => {
            console.log('StatusTransition button clicked!', { currentStatus, isOpen });
            setIsOpen(!isOpen);
          }}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-md hover:bg-[#2a2a2a] transition-colors text-sm disabled:opacity-50 cursor-pointer"
        >
          <StatusBadge status={currentStatus} />
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md shadow-lg z-50 py-1">
            <div className="px-3 py-2 border-b border-[#2a2a2a]">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Change Status
              </span>
            </div>
            {validStatuses.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusSelect(status)}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[#2a2a2a] transition-colors"
              >
                <StatusBadge status={status} />
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-white">
                    {getStatusLabel(status)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reason Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-md shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-medium text-white">
                  Change Project Status
                </h3>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">
                  Changing "{projectName}" from{' '}
                  <StatusBadge status={currentStatus} className="mx-1" />
                  {' '}to{' '}
                  <StatusBadge status={selectedStatus || ''} className="mx-1" />
                </p>
                
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reason for change {['cancelled', 'on_hold'].includes(selectedStatus || '') && (
                    <span className="text-red-400">*</span>
                  )}
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason for status change..."
                  className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white placeholder-gray-500 focus:border-[#336699] focus:ring-1 focus:ring-[#336699]/50 outline-none resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowReasonModal(false);
                    setSelectedStatus(null);
                    setReason('');
                  }}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReasonSubmit}
                  disabled={
                    isLoading || 
                    (['cancelled', 'on_hold'].includes(selectedStatus || '') && !reason.trim())
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-[8px] hover:bg-gray-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border border-white/30 animate-pulse relative">
                      <div className="absolute inset-0.5 bg-white opacity-30 animate-pulse" style={{ animationDelay: '0.75s' }}></div>
                    </div>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Update Status
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'lead': 'Lead',
    'quoted': 'Quoted',
    'sold': 'Sold',
    'planning': 'Planning',
    'scheduled': 'Scheduled',
    'active': 'Active',
    'on_hold': 'On Hold',
    'substantial_completion': 'Near Complete',
    'completed': 'Completed',
    'warranty': 'Warranty',
    'closed': 'Closed',
    'cancelled': 'Cancelled'
  };
  return labels[status] || status;
} 