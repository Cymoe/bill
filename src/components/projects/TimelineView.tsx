import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  type: 'milestone' | 'phase';
  status?: 'completed' | 'in-progress' | 'upcoming';
}

interface TimelineViewProps {
  projectId: string;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ projectId }) => {
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('TimelineView received projectId:', projectId);
    if (projectId) {
      loadTimelineData();
    } else {
      setLoading(false);
      setError('No project ID provided');
    }
  }, [projectId]);

  const loadTimelineData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading timeline data for project:', projectId);
      
      // Load project details for dates
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('start_date, end_date, name')
        .eq('id', projectId)
        .single();

      if (projectError) {
        console.error('Project loading error:', projectError);
        throw new Error(`Failed to load project: ${projectError.message}`);
      }

      if (!project) {
        throw new Error('Project not found');
      }

      console.log('Loaded project data:', project);

      // Create timeline events based on project data
      const events: TimelineEvent[] = [];
      const startDate = new Date(project.start_date);
      const endDate = new Date(project.end_date);
      const now = new Date();

      // Project Started milestone
      events.push({
        id: 'start',
        title: 'Project Started',
        date: startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        description: 'Project kickoff and initial planning',
        type: 'milestone',
        status: startDate <= now ? 'completed' : 'upcoming'
      });

      // Generate phases based on common construction phases
      const phases = [
        { name: 'Design & Planning', days: 7, description: 'Finalize designs and obtain permits' },
        { name: 'Preparation', days: 5, description: 'Site preparation and material delivery' },
        { name: 'Demolition', days: 3, description: 'Remove existing fixtures and structures' },
        { name: 'Rough Work', days: 10, description: 'Electrical, plumbing, and structural work' },
        { name: 'Installation', days: 14, description: 'Main installation and construction work' },
        { name: 'Finishing', days: 7, description: 'Final touches and detail work' }
      ];

      let currentPhaseStart = new Date(startDate);
      const totalProjectDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      phases.forEach((phase, index) => {
        const phaseDays = Math.ceil((phase.days / phases.reduce((sum, p) => sum + p.days, 0)) * totalProjectDays);
        const phaseEnd = new Date(currentPhaseStart);
        phaseEnd.setDate(phaseEnd.getDate() + phaseDays);

        // Determine phase status
        let status: 'completed' | 'in-progress' | 'upcoming' = 'upcoming';
        if (phaseEnd < now) {
          status = 'completed';
        } else if (currentPhaseStart <= now && now <= phaseEnd) {
          status = 'in-progress';
        }

        events.push({
          id: `phase-${index}`,
          title: phase.name,
          date: `${currentPhaseStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${phaseEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
          description: phase.description,
          type: 'phase',
          status
        });

        currentPhaseStart = new Date(phaseEnd);
        currentPhaseStart.setDate(currentPhaseStart.getDate() + 1);
      });

      // Project completion milestone
      events.push({
        id: 'completion',
        title: 'Project Completion',
        date: endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        description: 'Final inspection and client handover',
        type: 'milestone',
        status: endDate <= now ? 'completed' : 'upcoming'
      });

      console.log('Generated timeline events:', events);
      setTimelineEvents(events);
    } catch (error) {
      console.error('Timeline loading error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load timeline data');
      
      // Provide fallback timeline data
      const fallbackEvents: TimelineEvent[] = [
        {
          id: 'start',
          title: 'Project Started',
          date: 'June 1, 2024',
          description: 'Project kickoff and initial planning',
          type: 'milestone',
          status: 'completed'
        },
        {
          id: 'phase-1',
          title: 'Design & Planning',
          date: 'Jun 2 - Jun 8, 2024',
          description: 'Finalize designs and obtain permits',
          type: 'phase',
          status: 'completed'
        },
        {
          id: 'phase-2',
          title: 'Preparation',
          date: 'Jun 9 - Jun 13, 2024',
          description: 'Site preparation and material delivery',
          type: 'phase',
          status: 'in-progress'
        },
        {
          id: 'phase-3',
          title: 'Installation',
          date: 'Jun 14 - Jun 27, 2024',
          description: 'Main installation and construction work',
          type: 'phase',
          status: 'upcoming'
        },
        {
          id: 'completion',
          title: 'Project Completion',
          date: 'June 28, 2024',
          description: 'Final inspection and client handover',
          type: 'milestone',
          status: 'upcoming'
        }
      ];
      console.log('Using fallback timeline events');
      setTimelineEvents(fallbackEvents);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-sm font-medium uppercase tracking-wider text-gray-400">Project Timeline</h2>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-[#336699] animate-pulse relative">
            <div className="absolute inset-1 bg-[#336699] opacity-30 animate-pulse" style={{ animationDelay: '0.75s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-sm font-medium uppercase tracking-wider text-gray-400">Project Timeline</h2>
      
      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-[4px] p-4 mb-4">
          <p className="text-red-400 text-sm">⚠️ {error}</p>
          <p className="text-gray-400 text-xs mt-1">Showing example timeline below</p>
        </div>
      )}

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-800"></div>
        <div className="space-y-6">
          {timelineEvents.map((event) => (
            <div key={event.id} className="relative pl-14">
              <div
                className={`absolute left-4 top-1.5 w-4 h-4 rounded-full border-2 ${
                  event.status === "completed"
                    ? "bg-green-500 border-green-600"
                    : event.status === "in-progress"
                      ? "bg-[#F9D71C] border-[#E6C419]"
                      : event.type === "milestone"
                        ? "bg-[#336699] border-[#5A8BB8]"
                        : "bg-transparent border-gray-600"
                }`}
              ></div>
              <div className="bg-[#111827]/50 border border-gray-800 rounded-[4px] p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium text-white">{event.title}</div>
                  {event.status && (
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium border ${
                        event.status === "completed"
                          ? "border-green-600 text-green-400 bg-green-900/20"
                          : event.status === "in-progress"
                            ? "border-[#F9D71C]/60 text-[#F9D71C] bg-[#F9D71C]/10"
                            : "border-gray-700 text-gray-400 bg-gray-900/20"
                      }`}
                    >
                      {event.status === 'in-progress' ? 'In Progress' : 
                       event.status === 'completed' ? 'Completed' : 'Upcoming'}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-400 mb-2">{event.date}</div>
                <div className="text-sm text-gray-300">{event.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 