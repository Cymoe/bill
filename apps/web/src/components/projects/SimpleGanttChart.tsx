import React from 'react';
import { format, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend } from 'date-fns';
import type { Tables } from '../../lib/database';

type Project = Tables['projects'];

interface SimpleGanttChartProps {
  projects: Project[];
}

export const SimpleGanttChart: React.FC<SimpleGanttChartProps> = ({ projects }) => {
  // Chart dimensions
  const chartHeight = 400;
  const rowHeight = 40;
  const headerHeight = 60;
  const leftPanelWidth = 200;
  const dayWidth = 30;
  
  // Calculate date range (current month view)
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const chartWidth = leftPanelWidth + (daysInMonth.length * dayWidth);
  
  // Limit to first 10 projects for performance
  const displayProjects = projects.slice(0, 10);
  
  const getProjectBar = (project: Project, index: number) => {
    const startDate = new Date(project.start_date);
    const endDate = new Date(project.end_date);
    
    // Calculate positions
    const projectStart = startDate < monthStart ? monthStart : startDate;
    const projectEnd = endDate > monthEnd ? monthEnd : endDate;
    
    const startOffset = differenceInDays(projectStart, monthStart);
    const duration = differenceInDays(projectEnd, projectStart) + 1;
    
    const x = leftPanelWidth + (startOffset * dayWidth);
    const width = duration * dayWidth;
    const y = headerHeight + (index * rowHeight) + 8;
    
    // Status colors
    const statusColors: Record<string, string> = {
      planned: '#9333ea',
      active: '#10b981',
      'on-hold': '#f59e0b',
      completed: '#3b82f6',
      cancelled: '#ef4444'
    };
    
    return {
      x,
      y,
      width,
      height: rowHeight - 16,
      color: statusColors[project.status] || '#6b7280'
    };
  };
  
  return (
    <div className="overflow-x-auto">
      <svg width={chartWidth} height={chartHeight} className="bg-[#1a1a1a]">
        {/* Header Background */}
        <rect x={0} y={0} width={chartWidth} height={headerHeight} fill="#252525" />
        
        {/* Grid */}
        {daysInMonth.map((day, i) => {
          const x = leftPanelWidth + (i * dayWidth);
          const isToday = format(day, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
          
          return (
            <g key={i}>
              {/* Vertical grid lines */}
              <line
                x1={x}
                y1={headerHeight}
                x2={x}
                y2={chartHeight}
                stroke="#333"
                strokeWidth={1}
              />
              
              {/* Weekend highlight */}
              {isWeekend(day) && (
                <rect
                  x={x}
                  y={headerHeight}
                  width={dayWidth}
                  height={chartHeight - headerHeight}
                  fill="#1a1a1a"
                  opacity={0.3}
                />
              )}
              
              {/* Today indicator */}
              {isToday && (
                <line
                  x1={x + dayWidth / 2}
                  y1={0}
                  x2={x + dayWidth / 2}
                  y2={chartHeight}
                  stroke="#fbbf24"
                  strokeWidth={2}
                  strokeDasharray="4 2"
                />
              )}
            </g>
          );
        })}
        
        {/* Horizontal grid lines */}
        {displayProjects.map((_, i) => (
          <line
            key={i}
            x1={0}
            y1={headerHeight + (i + 1) * rowHeight}
            x2={chartWidth}
            y2={headerHeight + (i + 1) * rowHeight}
            stroke="#333"
            strokeWidth={1}
          />
        ))}
        
        {/* Month header */}
        <text
          x={leftPanelWidth + 10}
          y={20}
          fill="white"
          fontSize="14"
          fontWeight="600"
        >
          {format(monthStart, 'MMMM yyyy')}
        </text>
        
        {/* Day headers */}
        {daysInMonth.map((day, i) => (
          <text
            key={i}
            x={leftPanelWidth + (i * dayWidth) + dayWidth / 2}
            y={45}
            fill="#9ca3af"
            fontSize="12"
            textAnchor="middle"
          >
            {format(day, 'd')}
          </text>
        ))}
        
        {/* Project names panel */}
        <rect x={0} y={headerHeight} width={leftPanelWidth} height={chartHeight - headerHeight} fill="#1E1E1E" />
        
        {/* Project names */}
        {displayProjects.map((project, i) => (
          <text
            key={project.id}
            x={10}
            y={headerHeight + (i * rowHeight) + rowHeight / 2 + 5}
            fill="white"
            fontSize="14"
            className="truncate"
          >
            {project.name.length > 20 ? project.name.substring(0, 20) + '...' : project.name}
          </text>
        ))}
        
        {/* Project bars */}
        {displayProjects.map((project, i) => {
          const bar = getProjectBar(project, i);
          
          // Only render if the project overlaps with current month
          if (bar.width <= 0) return null;
          
          return (
            <g key={project.id}>
              <rect
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
                fill={bar.color}
                rx={4}
                opacity={0.8}
                className="hover:opacity-100 transition-opacity cursor-pointer"
              />
              <text
                x={bar.x + 8}
                y={bar.y + bar.height / 2 + 4}
                fill="white"
                fontSize="12"
                fontWeight="500"
              >
                {getProjectProgress(project.status)}%
              </text>
            </g>
          );
        })}
        
        {/* Show more indicator if there are more projects */}
        {projects.length > 10 && (
          <text
            x={leftPanelWidth / 2}
            y={chartHeight - 10}
            fill="#6b7280"
            fontSize="12"
            textAnchor="middle"
          >
            + {projects.length - 10} more projects
          </text>
        )}
      </svg>
    </div>
  );
  
  function getProjectProgress(status: Project['status']) {
    switch (status) {
      case 'planned':
        return 0;
      case 'active':
        return 50;
      case 'on-hold':
        return 50;
      case 'completed':
        return 100;
      case 'cancelled':
        return 0;
      default:
        return 0;
    }
  }
}; 