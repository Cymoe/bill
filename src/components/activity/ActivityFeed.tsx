import React, { useEffect, useState, useCallback } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  Plus, Edit, Trash2, Send, DollarSign, AlertCircle, 
  RefreshCw, PenTool, Eye, Download, Share2, Archive, 
  RotateCcw, UserPlus, UserMinus, CheckCircle, XCircle, 
  ThumbsUp, ThumbsDown, Activity, Clock, RefreshCcw as Refresh,
  Package, Building, User, Users, UserX, FileStack, FileText,
  Briefcase
} from 'lucide-react';
import { ActivityLog, ActivityLogService, ActivityFilter } from '../../services/ActivityLogService';
import { Link } from 'react-router-dom';

interface ActivityFeedProps {
  filter?: ActivityFilter;
  compact?: boolean;
  organizationId?: string;
}

const iconComponents = {
  Plus, Edit, Trash2, Send, DollarSign, AlertCircle, 
  RefreshCw, PenTool, Eye, Download, Share2, Archive, 
  RotateCcw, UserPlus, UserMinus, CheckCircle, XCircle, 
  ThumbsUp, ThumbsDown, Activity, Package, Building, User, 
  Users, UserX, FileStack, FileText, Briefcase
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  filter = {}, 
  compact = false,
  organizationId 
}) => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadActivities = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    const finalFilter = {
      ...filter,
      ...(organizationId && { organization_id: organizationId })
    };
    
    const data = await ActivityLogService.getActivities(finalFilter);
    setActivities(data);
    
    if (showRefreshing) {
      setRefreshing(false);
    } else {
      setLoading(false);
    }
  }, [filter, organizationId]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities, organizationId]);

  // Subscribe to real-time activity updates
  useEffect(() => {
    if (!organizationId) return;

    const channel = ActivityLogService.subscribeToActivities(
      organizationId,
      (newActivity) => {
        setActivities(prev => {
          // Check if this activity already exists to prevent duplicates
          const exists = prev.some(activity => activity.id === newActivity.id);
          if (exists) {
            return prev;
          }
          return [newActivity, ...prev];
        });
      }
    );

    return () => {
      channel.unsubscribe();
    };
  }, [organizationId]);

  const handleRefresh = () => {
    loadActivities(true);
  };

  const getIcon = (activity: ActivityLog) => {
    const iconName = ActivityLogService.getActivityIcon(activity);
    const IconComponent = iconComponents[iconName as keyof typeof iconComponents] || Activity;
    return IconComponent;
  };

  const getEntityLink = (activity: ActivityLog): string | null => {
    const linkMap: Record<string, (id: string) => string> = {
      invoice: (id) => `/invoices/${id}`,
      estimate: (id) => `/estimates/${id}`,
      client: (id) => `/clients/${id}`,
      project: (id) => `/projects/${id}`,
      expense: (id) => `/expenses/${id}`,
      work_pack: (id) => `/work/${id}`,
      product: (id) => `/products?id=${id}`,
      vendor: (id) => `/vendors/${id}`,
      subcontractor: (id) => `/subcontractors/${id}`,
      team_member: (id) => `/team/${id}`
    };

    if (activity.entity_id && linkMap[activity.entity_type]) {
      return linkMap[activity.entity_type](activity.entity_id);
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No activities found</p>
      </div>
    );
  }


  return (
    <div className={`space-y-${compact ? '2' : '4'}`}>
      {!compact && (
        <div className="flex items-center justify-end mb-4 px-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-1 rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
            title="Refresh activities"
          >
            <Refresh className={`w-4 h-4 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      )}
      {activities.map((activity) => {
        const Icon = getIcon(activity);
        const color = ActivityLogService.getActivityColor(activity);
        const entityLink = getEntityLink(activity);
        const description = ActivityLogService.getActivityDescription(activity);

        return (
          <div 
            key={activity.id} 
            className={`flex ${compact ? 'gap-3' : 'gap-4'} ${compact ? 'py-2' : 'py-3'}`}
          >
            <div className={`flex-shrink-0 ${compact ? 'mt-0.5' : 'mt-1'}`}>
              <div className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded-full bg-gray-800 flex items-center justify-center`}>
                <Icon className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} ${color}`} />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className={`${compact ? 'text-sm' : ''}`}>
                {/* User/Actor name */}
                <span className="text-white font-medium">
                  Agent
                </span>
                <span className="text-gray-300">
                  {' '}{description.split(' ').slice(0, -1).join(' ')}{' '}
                </span>
                {entityLink ? (
                  <Link 
                    to={entityLink} 
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {description.split(' ').slice(-1)[0]}
                  </Link>
                ) : (
                  <span className="text-white">
                    {description.split(' ').slice(-1)[0]}
                  </span>
                )}
              </div>
              
              {!compact && activity.metadata && Object.keys(activity.metadata).length > 0 && !activity.metadata.historical && (
                <div className="mt-1 text-sm text-gray-500">
                  {Object.entries(activity.metadata)
                    .filter(([key, value]) => {
                      // Filter out system/internal metadata
                      return !['historical', 'created_at', 'updated_at'].includes(key) && 
                             typeof value === 'string' && 
                             !key.match(/^\d+$/); // Filter out numeric keys
                    })
                    .map(([key, value]) => (
                      <span key={key} className="mr-3">
                        <span className="capitalize">{key.replace(/_/g, ' ')}:</span> {value}
                      </span>
                    ))}
                </div>
              )}
              
              <div className={`${compact ? 'text-xs' : 'text-sm'} text-gray-500 mt-1 flex items-center gap-1`}>
                <Clock className={`${compact ? 'w-3 h-3' : 'w-4 h-4'}`} />
                <time 
                  dateTime={activity.created_at} 
                  title={format(new Date(activity.created_at), 'PPpp')}
                >
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </time>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};