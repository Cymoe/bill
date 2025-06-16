import React, { useContext, useState } from 'react';
import { X, Activity, Filter, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { OrganizationContext } from '../layouts/DashboardLayout';
import { ActivityFeed } from './ActivityFeed';
import { EntityType, ActionType } from '../../services/ActivityLogService';

interface ActivityPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ActivityPanel: React.FC<ActivityPanelProps> = ({ isOpen, onClose }) => {
  const { selectedOrg } = useContext(OrganizationContext);
  const navigate = useNavigate();
  const [filter, setFilter] = useState<{
    entityType?: EntityType;
    action?: ActionType;
  }>({});

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`fixed right-0 top-0 h-full w-96 bg-[#1A1A1A] border-l border-gray-700 z-[9999] transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#336699] rounded-full flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Activity Log</h2>
                <p className="text-xs text-gray-400">Recent actions in {selectedOrg?.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Quick Filters */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <select
                value={filter.entityType || ''}
                onChange={(e) => setFilter({ ...filter, entityType: e.target.value as EntityType || undefined })}
                className="flex-1 bg-[#2A2A2A] border border-[#404040] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
              >
                <option value="">All Types</option>
                <option value="invoice">Invoices</option>
                <option value="estimate">Estimates</option>
                <option value="client">Clients</option>
                <option value="project">Projects</option>
                <option value="payment">Payments</option>
              </select>
              
              <button
                onClick={() => navigate('/activity')}
                className="p-2 bg-[#2A2A2A] hover:bg-[#333333] rounded-lg transition-colors"
                title="View full activity log"
              >
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="flex-1 overflow-y-auto p-4">
            {selectedOrg?.id && (
              <ActivityFeed 
                organizationId={selectedOrg.id} 
                limit={50}
                entityType={filter.entityType}
              />
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={() => {
                navigate('/activity');
                onClose();
              }}
              className="w-full bg-[#336699] text-white py-2 px-4 rounded-lg hover:bg-[#2A5580] transition-colors text-sm font-medium"
            >
              View Full Activity Log
            </button>
          </div>
        </div>
      </div>
    </>
  );
};