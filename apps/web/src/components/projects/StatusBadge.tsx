import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'lead':
        return {
          label: 'Lead',
          description: 'Initial inquiry received',
          bgColor: 'bg-gray-500/20',
          textColor: 'text-gray-400',
          borderColor: 'border-gray-500/30'
        };
      case 'quoted':
        return {
          label: 'Quoted',
          description: 'Estimate provided to client',
          bgColor: 'bg-amber-500/20',
          textColor: 'text-amber-400',
          borderColor: 'border-amber-500/30'
        };
      case 'sold':
        return {
          label: 'Sold',
          description: 'Contract signed, project sold',
          bgColor: 'bg-blue-500/20',
          textColor: 'text-blue-400',
          borderColor: 'border-blue-500/30'
        };
      case 'planning':
        return {
          label: 'Planning',
          description: 'Planning permits and materials',
          bgColor: 'bg-purple-500/20',
          textColor: 'text-purple-400',
          borderColor: 'border-purple-500/30'
        };
      case 'scheduled':
        return {
          label: 'Scheduled',
          description: 'Ready to start work',
          bgColor: 'bg-cyan-500/20',
          textColor: 'text-cyan-400',
          borderColor: 'border-cyan-500/30'
        };
      case 'active':
        return {
          label: 'Active',
          description: 'Work in progress',
          bgColor: 'bg-emerald-500/20',
          textColor: 'text-emerald-400',
          borderColor: 'border-emerald-500/30'
        };
      case 'on_hold':
        return {
          label: 'On Hold',
          description: 'Temporarily paused',
          bgColor: 'bg-red-500/20',
          textColor: 'text-red-400',
          borderColor: 'border-red-500/30'
        };
      case 'substantial_completion':
        return {
          label: 'Near Complete',
          description: 'Work done, minor items remain',
          bgColor: 'bg-amber-500/20',
          textColor: 'text-amber-400',
          borderColor: 'border-amber-500/30'
        };
      case 'completed':
        return {
          label: 'Completed',
          description: 'All work finished',
          bgColor: 'bg-green-500/20',
          textColor: 'text-green-400',
          borderColor: 'border-green-500/30'
        };
      case 'warranty':
        return {
          label: 'Warranty',
          description: 'In warranty period',
          bgColor: 'bg-lime-500/20',
          textColor: 'text-lime-400',
          borderColor: 'border-lime-500/30'
        };
      case 'closed':
        return {
          label: 'Closed',
          description: 'Project archived',
          bgColor: 'bg-gray-500/20',
          textColor: 'text-gray-400',
          borderColor: 'border-gray-500/30'
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          description: 'Project cancelled',
          bgColor: 'bg-red-600/20',
          textColor: 'text-red-400',
          borderColor: 'border-red-600/30'
        };
      default:
        return {
          label: status.charAt(0).toUpperCase() + status.slice(1),
          description: 'Unknown status',
          bgColor: 'bg-gray-500/20',
          textColor: 'text-gray-400',
          borderColor: 'border-gray-500/30'
        };
    }
  };

  const statusInfo = getStatusInfo(status);

  return (
    <span 
      className={`inline-flex items-center px-3 py-1 rounded-[4px] text-xs font-medium uppercase tracking-wide border ${statusInfo.bgColor} ${statusInfo.textColor} ${statusInfo.borderColor} ${className}`}
      title={statusInfo.description}
    >
      {statusInfo.label}
    </span>
  );
}; 