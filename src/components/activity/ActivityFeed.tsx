import React, { useEffect, useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  Plus, Edit, Trash2, Send, DollarSign, AlertCircle, 
  RefreshCw, PenTool, Eye, Download, Share2, Archive, 
  RotateCcw, UserPlus, UserMinus, CheckCircle, XCircle, 
  ThumbsUp, ThumbsDown, Activity, Clock, Wifi, WifiOff, RefreshCcw as Refresh
} from 'lucide-react';
import { ActivityLog, ActivityLogService, ActivityFilter } from '@/services/ActivityLogService';
import { Link } from 'react-router-dom';

interface ActivityFeedProps {
  filter?: ActivityFilter;
  compact?: boolean;
  realTime?: boolean;
  organizationId?: string;
}

const iconComponents = {
  Plus, Edit, Trash2: Trash2, Send, DollarSign, AlertCircle, 
  RefreshCw, PenTool, Eye, Download, Share2, Archive, 
  RotateCcw, UserPlus, UserMinus, CheckCircle, XCircle, 
  ThumbsUp, ThumbsDown, Activity
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  filter = {}, 
  compact = false, 
  realTime = true,
  organizationId 
}) => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    loadActivities();
  }, [filter]);
  
  // Reload activities when organizationId changes
  useEffect(() => {
    if (organizationId) {
      loadActivities();
    }
  }, [organizationId]);

  useEffect(() => {
    if (!realTime || !organizationId) return;

    // Check real-time configuration first
    ActivityLogService.checkRealtimeConfiguration().then(({ enabled, error }) => {
      if (!enabled) {
        console.error('Real-time not properly configured:', error);
        setConnectionStatus('error');
        setConnectionError(error || 'Real-time not configured');
      }
    });

    console.log('Setting up real-time subscription for org:', organizationId);
    const { unsubscribe } = ActivityLogService.subscribeToActivities(
      (newActivity) => {
        console.log('New activity received:', newActivity);
        setActivities(prev => [newActivity, ...prev]);
        
        // Show a subtle notification for new activities
        if (!compact && document.visibilityState === 'visible') {
          const description = ActivityLogService.getActivityDescription(newActivity);
          console.log(`🔔 New Activity: ${description}`);
        }
      },
      { organization_id: organizationId },
      {
        onStatusChange: (status, error) => {
          console.log('Connection status changed:', status, error);
          setConnectionStatus(status);
          setConnectionError(error?.message || null);
        }
      }
    );

    return unsubscribe;
  }, [realTime, organizationId]);

  const loadActivities = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    const data = await ActivityLogService.getActivities(filter);
    setActivities(data);
    
    if (showRefreshing) {
      setRefreshing(false);
    } else {
      setLoading(false);
    }
  };

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
      work_pack: (id) => `/work/${id}`
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

  const handleTestConnection = async () => {
    if (import.meta.env.DEV) {
      const { testRealtimeConnection } = await import('@/utils/testRealtimeConnection');
      await testRealtimeConnection();
    }
  };
  
  const handleTestInsertion = async () => {
    if (import.meta.env.DEV) {
      const { testActivityInsertion } = await import('@/utils/testActivityInsertion');
      await testActivityInsertion();
    }
  };
  
  const handleVerifySetup = async () => {
    if (import.meta.env.DEV) {
      const { verifyRealtimeSetup } = await import('@/utils/verifyRealtimeSetup');
      const results = await verifyRealtimeSetup();
      
      if (!results.realtimeEnabled) {
        setConnectionStatus('error');
        setConnectionError('Real-time not enabled for activity_logs table');
      }
    }
  };

  return (
    <div className={`space-y-${compact ? '2' : '4'}`}>
      {realTime && !compact && (
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2 text-sm">
            {connectionStatus === 'connected' ? (
              <>
                <Wifi className="w-4 h-4 text-green-500" />
                <span className="text-green-500">Real-time updates active</span>
              </>
            ) : connectionStatus === 'connecting' ? (
              <>
                <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />
                <span className="text-yellow-500">Connecting...</span>
              </>
            ) : connectionStatus === 'error' ? (
              <>
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-red-500">Connection error{connectionError ? `: ${connectionError}` : ''}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-gray-500" />
                <span className="text-gray-500">Real-time updates inactive</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {import.meta.env.DEV && (
              <>
                {connectionStatus === 'error' && (
                  <>
                    <button
                      onClick={handleTestConnection}
                      className="text-xs text-blue-400 hover:text-blue-300 underline"
                    >
                      Debug Connection
                    </button>
                    <button
                      onClick={handleVerifySetup}
                      className="text-xs text-yellow-400 hover:text-yellow-300 underline"
                    >
                      Verify Setup
                    </button>
                  </>
                )}
                {connectionStatus === 'connected' && (
                  <button
                    onClick={handleTestInsertion}
                    className="text-xs text-green-400 hover:text-green-300 underline"
                  >
                    Test Real-time
                  </button>
                )}
              </>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-1 rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
              title="Refresh activities"
            >
              <Refresh className={`w-4 h-4 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
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
                <span className="text-gray-300">
                  {description.split(' ').slice(0, -1).join(' ')}{' '}
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
              
              {!compact && activity.metadata && Object.keys(activity.metadata).length > 0 && (
                <div className="mt-1 text-sm text-gray-500">
                  {Object.entries(activity.metadata).map(([key, value]) => (
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