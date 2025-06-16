import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  FileText, 
  DollarSign, 
  Send, 
  Edit, 
  Trash2, 
  User, 
  Package, 
  Briefcase,
  CheckCircle,
  XCircle,
  Archive,
  RefreshCw,
  FileSignature,
  Download,
  Upload,
  UserPlus,
  UserMinus,
  Clock
} from 'lucide-react';
import { ActivityLogService, ActivityLog, ActionType, EntityType } from '../../services/ActivityLogService';

interface ActivityFeedProps {
  organizationId: string;
  limit?: number;
  compact?: boolean;
  entityType?: EntityType;
  entityId?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  organizationId, 
  limit = 10, 
  compact = false,
  entityType,
  entityId 
}) => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();

    // Subscribe to real-time updates
    const unsubscribe = ActivityLogService.subscribeToActivity(organizationId, (newActivity) => {
      // Only add if it matches our filters
      if (entityType && newActivity.entity_type !== entityType) return;
      if (entityId && newActivity.entity_id !== entityId) return;
      
      setActivities(prev => [newActivity, ...prev].slice(0, limit));
    });

    return () => {
      unsubscribe();
    };
  }, [organizationId, limit, entityType, entityId]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await ActivityLogService.list({
        organizationId,
        limit,
        entityType,
        entityId
      });
      setActivities(data);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (action: ActionType, entityType: EntityType) => {
    // Action-specific icons
    const actionIcons: Record<ActionType, any> = {
      created: FileText,
      updated: Edit,
      deleted: Trash2,
      sent: Send,
      opened: FileText,
      paid: DollarSign,
      accepted: CheckCircle,
      rejected: XCircle,
      converted: RefreshCw,
      archived: Archive,
      restored: RefreshCw,
      signed: FileSignature,
      exported: Download,
      imported: Upload,
      assigned: UserPlus,
      unassigned: UserMinus,
      status_changed: Clock,
      milestone_completed: CheckCircle
    };

    return actionIcons[action] || FileText;
  };

  const getActionColor = (action: ActionType) => {
    const colors: Record<ActionType, string> = {
      created: 'text-green-400',
      updated: 'text-blue-400',
      deleted: 'text-red-400',
      sent: 'text-purple-400',
      opened: 'text-yellow-400',
      paid: 'text-green-400',
      accepted: 'text-green-400',
      rejected: 'text-red-400',
      converted: 'text-blue-400',
      archived: 'text-gray-400',
      restored: 'text-blue-400',
      signed: 'text-green-400',
      exported: 'text-purple-400',
      imported: 'text-purple-400',
      assigned: 'text-blue-400',
      unassigned: 'text-orange-400',
      status_changed: 'text-yellow-400',
      milestone_completed: 'text-green-400'
    };

    return colors[action] || 'text-gray-400';
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No activity yet</p>
      </div>
    );
  }

  return (
    <div className={compact ? 'space-y-2' : 'space-y-4'}>
      {activities.map((activity) => {
        const Icon = getIcon(activity.action, activity.entity_type);
        const actionColor = getActionColor(activity.action);
        
        return (
          <div key={activity.id} className={`flex items-start ${compact ? 'space-x-2' : 'space-x-3'}`}>
            <div className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0`}>
              <Icon className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} ${actionColor}`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className={`${compact ? 'text-xs' : 'text-sm'} text-gray-300`}>
                <span className="font-medium text-white">
                  {activity.user_name || activity.user_email?.split('@')[0] || 'Unknown'}
                </span>
                {' '}
                <span className="text-gray-400">{activity.description}</span>
              </div>
              
              {!compact && activity.metadata && Object.keys(activity.metadata).length > 0 && (
                <div className="mt-1 text-xs text-gray-500">
                  {activity.metadata.amount && (
                    <span>Amount: ${activity.metadata.amount} • </span>
                  )}
                  {activity.metadata.oldStatus && activity.metadata.newStatus && (
                    <span>{activity.metadata.oldStatus} → {activity.metadata.newStatus}</span>
                  )}
                </div>
              )}
              
              <div className={`${compact ? 'text-[10px]' : 'text-xs'} text-gray-500 mt-1`}>
                {formatDistanceToNow(new Date(activity.created_at!), { addSuffix: true })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};