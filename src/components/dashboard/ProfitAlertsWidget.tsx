import React, { useState } from 'react';
import { AlertTriangle, TrendingUp, Target, Clock, DollarSign, ArrowRight, X } from 'lucide-react';

interface ProfitAlert {
  id: string;
  type: 'opportunity' | 'warning' | 'critical' | 'insight';
  title: string;
  description: string;
  impact: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  category: 'pricing' | 'efficiency' | 'materials' | 'labor' | 'client';
}

const mockAlerts: ProfitAlert[] = [
  {
    id: '1',
    type: 'opportunity',
    title: 'KITCHEN REMODEL PRICING OPPORTUNITY',
    description: 'Your kitchen remodel quotes are 15% below market rate in your area',
    impact: '+$4,200 per project',
    action: 'Increase kitchen remodel pricing by 15%',
    priority: 'high',
    category: 'pricing'
  },
  {
    id: '2',
    type: 'warning',
    title: 'MATERIAL WASTE TRENDING UP',
    description: 'Lumber waste increased 23% this month vs last month',
    impact: '-$890 this month',
    action: 'Review cutting plans and ordering accuracy',
    priority: 'medium',
    category: 'materials'
  },
  {
    id: '3',
    type: 'insight',
    title: 'HIGH-VALUE CLIENT PATTERN',
    description: 'Clients spending $25K+ are concentrated in 3 zip codes',
    impact: '+47% profit margins',
    action: 'Focus marketing on zip codes 78701, 78703, 78704',
    priority: 'high',
    category: 'client'
  },
  {
    id: '4',
    type: 'critical',
    title: 'LABOR EFFICIENCY DECLINING',
    description: 'Average project completion time increased by 18% this quarter',
    impact: '-$2,340 per project',
    action: 'Schedule team efficiency review meeting',
    priority: 'high',
    category: 'labor'
  }
];

export const ProfitAlertsWidget: React.FC = () => {
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  const activeAlerts = mockAlerts.filter(alert => !dismissedAlerts.includes(alert.id));
  const highPriorityAlerts = activeAlerts.filter(alert => alert.priority === 'high');

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => [...prev, alertId]);
    if (expandedAlert === alertId) {
      setExpandedAlert(null);
    }
  };

  const getAlertIcon = (type: ProfitAlert['type']) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUp className="h-5 w-5 text-[#388E3C]" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-[#F9D71C]" />;
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-[#D32F2F]" />;
      case 'insight':
        return <Target className="h-5 w-5 text-[#336699]" />;
      default:
        return <DollarSign className="h-5 w-5 text-[#9E9E9E]" />;
    }
  };

  const getAlertBorderColor = (type: ProfitAlert['type']) => {
    switch (type) {
      case 'opportunity':
        return 'border-l-[#388E3C]';
      case 'warning':
        return 'border-l-[#F9D71C]';
      case 'critical':
        return 'border-l-[#D32F2F]';
      case 'insight':
        return 'border-l-[#336699]';
      default:
        return 'border-l-[#9E9E9E]';
    }
  };

  const getImpactColor = (type: ProfitAlert['type']) => {
    switch (type) {
      case 'opportunity':
      case 'insight':
        return 'text-[#388E3C]';
      case 'warning':
        return 'text-[#F9D71C]';
      case 'critical':
        return 'text-[#D32F2F]';
      default:
        return 'text-[#9E9E9E]';
    }
  };

  if (activeAlerts.length === 0) {
    return (
      <div className="bg-[#121212] rounded-[4px] border border-[#333333] p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Target className="h-5 w-5 mr-2 text-[#336699]" />
            <h3 className="text-lg font-bold text-white font-['Roboto_Condensed'] uppercase">PROFIT ALERTS</h3>
          </div>
          <div className="w-2 h-2 bg-[#388E3C] rounded-full"></div>
        </div>
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-[#388E3C]/20 rounded-[4px] flex items-center justify-center mx-auto mb-3">
            <Target className="h-6 w-6 text-[#388E3C]" />
          </div>
          <p className="text-[#9E9E9E] text-sm font-['Roboto']">All profit opportunities addressed</p>
          <p className="text-[#9E9E9E] text-xs font-['Roboto'] mt-1">Check back tomorrow for new insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#121212] rounded-[4px] border border-[#333333] p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Target className="h-5 w-5 mr-2 text-[#336699]" />
          <h3 className="text-lg font-bold text-white font-['Roboto_Condensed'] uppercase">PROFIT ALERTS</h3>
        </div>
        <div className="flex items-center">
          {highPriorityAlerts.length > 0 && (
            <div className="bg-[#D32F2F]/20 px-2 py-1 rounded-[4px] border border-[#D32F2F]/50 mr-3">
              <span className="text-[#D32F2F] text-xs font-bold font-['Roboto']">
                {highPriorityAlerts.length} HIGH PRIORITY
              </span>
            </div>
          )}
          <div className="w-2 h-2 bg-[#336699] rounded-full animate-pulse"></div>
        </div>
      </div>

      <div className="space-y-3">
        {activeAlerts.slice(0, 3).map((alert) => (
          <div
            key={alert.id}
            className={`bg-[#1E1E1E] border-l-4 ${getAlertBorderColor(alert.type)} border-r border-t border-b border-[#333333] rounded-r-[4px] p-4 cursor-pointer hover:bg-[#252525] transition-colors`}
            onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start flex-1">
                <div className="mr-3 mt-0.5">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white text-sm font-bold font-['Roboto_Condensed'] uppercase">
                      {alert.title}
                    </h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissAlert(alert.id);
                      }}
                      className="text-[#9E9E9E] hover:text-white transition-colors ml-2"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <p className="text-[#9E9E9E] text-sm font-['Roboto'] mb-2">
                    {alert.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold font-['Roboto_Mono'] ${getImpactColor(alert.type)}`}>
                      {alert.impact}
                    </span>
                    <div className="flex items-center text-[#336699] text-xs">
                      <span className="mr-1">VIEW ACTION</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {expandedAlert === alert.id && (
              <div className="mt-4 pt-4 border-t border-[#333333]">
                <div className="bg-[#121212] rounded-[4px] p-3 border border-[#333333]">
                  <h5 className="text-[#336699] text-xs font-bold font-['Roboto_Condensed'] uppercase mb-2">
                    RECOMMENDED ACTION
                  </h5>
                  <p className="text-white text-sm font-['Roboto'] mb-3">
                    {alert.action}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-[#9E9E9E] mr-1" />
                      <span className="text-[#9E9E9E] text-xs font-['Roboto']">
                        {alert.priority === 'high' ? 'Act within 24 hours' : 
                         alert.priority === 'medium' ? 'Act within 1 week' : 'Act within 1 month'}
                      </span>
                    </div>
                    <button className="bg-[#336699] hover:bg-[#2A5580] text-white px-4 py-2 rounded-[4px] text-xs font-bold font-['Roboto'] uppercase transition-colors">
                      TAKE ACTION
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {activeAlerts.length > 3 && (
        <div className="mt-4 pt-4 border-t border-[#333333]">
          <button className="w-full text-[#336699] text-sm font-bold font-['Roboto'] uppercase hover:text-[#2A5580] transition-colors">
            VIEW ALL {activeAlerts.length} ALERTS
          </button>
        </div>
      )}
    </div>
  );
}; 