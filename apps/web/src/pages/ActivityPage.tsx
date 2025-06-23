import React, { useState } from 'react';
import { Activity, Filter, Download, Calendar } from 'lucide-react';
import { ActivityFeed } from '../components/activity/ActivityFeed';
import { ActivityLogService, ActivityFilter, EntityType, ActivityAction } from '../services/ActivityLogService';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

export const ActivityPage: React.FC = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<ActivityFilter>({});
  const [showFilters, setShowFilters] = useState(false);

  const entityTypes: EntityType[] = [
    'invoice', 'estimate', 'client', 'project', 'product', 
    'expense', 'vendor', 'subcontractor', 'team_member', 
    'work_pack', 'template'
  ];

  const actions: ActivityAction[] = [
    'created', 'updated', 'deleted', 'sent', 'paid', 'overdue',
    'converted', 'signed', 'viewed', 'downloaded', 'shared',
    'archived', 'restored', 'invited', 'removed', 'completed',
    'cancelled', 'approved', 'rejected'
  ];

  const handleEntityTypeChange = (type: EntityType) => {
    setFilter(prev => ({
      ...prev,
      entity_type: prev.entity_type === type ? undefined : type
    }));
  };

  const handleActionChange = (action: ActivityAction) => {
    setFilter(prev => ({
      ...prev,
      action: prev.action === action ? undefined : action
    }));
  };

  const handleDateChange = (field: 'from_date' | 'to_date', value: string) => {
    setFilter(prev => ({
      ...prev,
      [field]: value || undefined
    }));
  };

  const handleExport = async (format: 'csv' | 'json') => {
    const data = await ActivityLogService.exportActivities(filter, format);
    const blob = new Blob([data], { 
      type: format === 'csv' ? 'text/csv' : 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-log-${format(new Date(), 'yyyy-MM-dd')}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setFilter({});
  };

  const activeFilterCount = Object.values(filter).filter(v => v !== undefined).length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-[#3B82F6]" />
            <h1 className="text-3xl font-bold">Activity Log</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Export Buttons */}
            <div className="relative group">
              <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <Download className="w-5 h-5" />
              </button>
              <div className="absolute right-0 mt-1 w-32 bg-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-700 rounded-t-lg transition-colors text-sm"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-700 rounded-b-lg transition-colors text-sm"
                >
                  Export JSON
                </button>
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showFilters ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
        
        <p className="text-gray-400">
          Track all activities and changes made in your organization
        </p>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="space-y-6">
            {/* Date Range */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">Date Range</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">From</label>
                  <input
                    type="date"
                    value={filter.from_date || ''}
                    onChange={(e) => handleDateChange('from_date', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">To</label>
                  <input
                    type="date"
                    value={filter.to_date || ''}
                    onChange={(e) => handleDateChange('to_date', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Entity Types */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">Entity Types</h3>
              <div className="flex flex-wrap gap-2">
                {entityTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleEntityTypeChange(type)}
                    className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                      filter.entity_type === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-900 hover:bg-gray-700'
                    }`}
                  >
                    {type.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">Actions</h3>
              <div className="flex flex-wrap gap-2">
                {actions.map((action) => (
                  <button
                    key={action}
                    onClick={() => handleActionChange(action)}
                    className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                      filter.action === action
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-900 hover:bg-gray-700'
                    }`}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {activeFilterCount > 0 && (
              <div className="flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Activity Feed */}
      <div className="bg-gray-800 rounded-lg p-6">
        <ActivityFeed 
          filter={filter}
          organizationId={user?.user_metadata?.organization_id}
        />
      </div>
    </div>
  );
};