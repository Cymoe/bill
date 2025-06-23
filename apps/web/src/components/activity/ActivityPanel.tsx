import React, { useRef, useEffect } from 'react';
import { X, Activity, ExternalLink } from 'lucide-react';
import { ActivityFeed } from './ActivityFeed';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { OrganizationContext } from '../layouts/DashboardLayout';

interface ActivityPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ActivityPanel: React.FC<ActivityPanelProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Get organization from context
  const { selectedOrg } = React.useContext(OrganizationContext);

  // Handle click outside to close panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[9999]"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-[#1E1E1E] border-l border-[#333333] shadow-xl z-[10000] transform transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#333333] flex-shrink-0">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-[#3B82F6]" />
            <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#333333] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Activity Feed */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          <ActivityFeed 
            filter={{ limit: 50 }}
            compact={true}
            organizationId={selectedOrg?.id}
          />
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#333333] flex-shrink-0">
          <Link
            to="/activity"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-[#333333] hover:bg-[#404040] rounded-lg transition-colors text-white"
          >
            <span>View All Activity</span>
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </>
  );
};