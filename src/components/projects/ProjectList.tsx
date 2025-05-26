import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MoreVertical, LayoutGrid, List, Calendar, DollarSign, Briefcase, FolderKanban, MapPin, User, CheckCircle, Search, Plus } from 'lucide-react';
import { db } from '../../lib/database';
import type { Tables } from '../../lib/database';
import { PageHeader } from '../common/PageHeader';
import { PageHeaderBar } from '../common/PageHeaderBar';
import { NewButton } from '../common/NewButton';
import { TableSkeleton } from '../skeletons/TableSkeleton';
import { Dropdown } from '../common/Dropdown';
import { formatCurrency } from '../../utils/format';
import TabMenu from '../common/TabMenu';

type Project = Tables['projects'];

export const ProjectList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'on-hold' | 'completed' | 'cancelled'>('all');
  
  // Load view preference from localStorage - default to 'card'
  const [viewType, setViewType] = useState<'card' | 'gantt' | 'table'>('card');

  // Save view preference when it changes
  useEffect(() => {
    localStorage.setItem('projectsViewType', viewType);
  }, [viewType]);

  // Check if tutorial mode is enabled via URL parameter
  const searchParams = new URLSearchParams(location.search);
  const showTutorial = searchParams.get('tutorial') === 'true';

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsData = await db.projects.list();
        setProjects(projectsData);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Construction project categories
  const categories = [
    { id: 'all', name: 'All Projects', icon: '🏗️' },
    { id: 'kitchen-bath', name: 'Kitchen & Bath', icon: '🚿' },
    { id: 'outdoor', name: 'Outdoor', icon: '🌿' },
    { id: 'structural', name: 'Structural', icon: '🏠' },
    { id: 'systems', name: 'Systems', icon: '⚡' },
    { id: 'renovation', name: 'Renovation', icon: '🔨' },
    { id: 'commercial', name: 'Commercial', icon: '🏢' },
    { id: 'new-construction', name: 'New Construction', icon: '🏗️' },
    { id: 'general', name: 'General', icon: '📋' },
  ];

  // Filter projects by category, status, and search
  const filteredProjects = projects.filter(project => {
    const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
    const matchesSearch = searchQuery === '' || 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  // Get count for each category
  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') return projects.length;
    return projects.filter(project => project.category === categoryId).length;
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'bg-[#10b981] text-[#10b981]';
      case 'completed':
        return 'bg-[#3b82f6] text-[#3b82f6]';
      case 'on-hold':
        return 'bg-[#f59e0b] text-[#f59e0b]';
      case 'cancelled':
        return 'bg-[#ef4444] text-[#ef4444]';
      default:
        return 'bg-[#6b7280] text-[#6b7280]';
    }
  };

  const getStatusBadgeStyle = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'bg-[#10b981]/20 text-[#10b981]';
      case 'completed':
        return 'bg-[#3b82f6]/20 text-[#3b82f6]';
      case 'on-hold':
        return 'bg-[#f59e0b]/20 text-[#f59e0b]';
      case 'cancelled':
        return 'bg-[#ef4444]/20 text-[#ef4444]';
      default:
        return 'bg-[#6b7280]/20 text-[#6b7280]';
    }
  };

  // Project summary statistics
  const activeProjects = projects.filter(project => project.status === 'active');
  const completedProjects = projects.filter(project => project.status === 'completed');
  const onHoldProjects = projects.filter(project => project.status === 'on-hold');
  
  const totalBudget = projects.reduce((sum, project) => sum + project.budget, 0);
  const activeBudget = activeProjects.reduce((sum, project) => sum + project.budget, 0);
  const onHoldBudget = onHoldProjects.reduce((sum, project) => sum + project.budget, 0);
  const completedBudget = completedProjects.reduce((sum, project) => sum + project.budget, 0);

  // Get progress percentage based on status
  const getProjectProgress = (status: Project['status']) => {
    switch (status) {
      case 'completed':
        return 100;
      case 'active':
        return 65; // Mock progress for demo
      case 'on-hold':
        return 15;
      default:
        return 0;
    }
  };

  // Generate Gantt chart data
  const generateGanttData = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    return {
      today: today.getDate(),
      daysInMonth,
      currentMonth,
      currentYear,
      projects: filteredProjects.map(project => {
        const startDate = new Date(project.start_date);
        const endDate = new Date(project.end_date);
        const startDay = startDate.getMonth() === currentMonth ? startDate.getDate() : 1;
        const endDay = endDate.getMonth() === currentMonth ? endDate.getDate() : daysInMonth;
        
        return {
          ...project,
          startDay,
          endDay,
          progress: getProjectProgress(project.status)
        };
      })
    };
  };

  return (
    <>
      {/* Header */}
      <PageHeaderBar 
        title="Projects"
        searchPlaceholder="Search projects..."
        searchValue={searchQuery}
        onSearch={setSearchQuery}
        onAddClick={() => navigate('/projects/new')}
      />
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 border-b border-[#333333]">
        {/* Total Projects */}
        <div className="relative bg-[#1a1a1a] border-r border-[#333333] p-6 hover:bg-[#222222] transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-white"></div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Total Projects</div>
          <div className="text-3xl font-bold text-white mb-1">{projects.length}</div>
          <div className="text-sm text-gray-400">Total Budget: {formatCurrency(totalBudget)}</div>
        </div>
        
        {/* Active Projects */}
        <div className="relative bg-[#1a1a1a] border-r border-[#333333] p-6 hover:bg-[#222222] transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#10b981]"></div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Active Projects</div>
          <div className="text-3xl font-bold text-[#10b981] mb-1">{activeProjects.length}</div>
          <div className="text-sm text-gray-400">Budget: {formatCurrency(activeBudget)}</div>
        </div>
        
        {/* On Hold */}
        <div className="relative bg-[#1a1a1a] border-r border-[#333333] p-6 hover:bg-[#222222] transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#f59e0b]"></div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">On Hold</div>
          <div className="text-3xl font-bold text-[#f59e0b] mb-1">{onHoldProjects.length}</div>
          <div className="text-sm text-gray-400">{formatCurrency(onHoldBudget)}</div>
        </div>
        
        {/* Completed */}
        <div className="relative bg-[#1a1a1a] p-6 hover:bg-[#222222] transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#3b82f6]"></div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Completed</div>
          <div className="text-3xl font-bold text-[#3b82f6] mb-1">{completedProjects.length}</div>
          <div className="text-sm text-gray-400">{formatCurrency(completedBudget)}</div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="pb-8">
        {/* Filter Controls */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-700">
          {/* Left side - View Mode and Primary Filter */}
          <div className="flex items-center gap-4">
            {/* View Mode Toggles - More Prominent */}
            <div className="flex bg-[#333333] border border-gray-700 rounded overflow-hidden">
              <button
                className={`px-4 py-2 ${viewType === 'card' ? 'bg-[#336699] text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                onClick={() => setViewType('card')}
              >
                Cards
              </button>
              <button
                className={`px-4 py-2 ${viewType === 'gantt' ? 'bg-[#336699] text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                onClick={() => setViewType('gantt')}
              >
                Gantt
              </button>
            </div>

            {/* Primary Category Filter - More Prominent */}
            <div className="relative">
              <select
                className="bg-[#232323] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#336699] appearance-none cursor-pointer pr-10 min-w-[200px]"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => {
                  const count = getCategoryCount(category.id);
                  return (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name} ({count})
                    </option>
                  );
                })}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>

            {/* More Filters Button */}
            <div className="relative">
              <button 
                className="flex items-center gap-2 px-4 py-2 bg-[#232323] border border-gray-700 rounded text-white hover:bg-[#2A2A2A] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"></path>
                </svg>
                More Filters
              </button>
            </div>
          </div>

          {/* Right side - Options Menu */}
          <div className="flex items-center">
            <div className="relative">
              <button
                className="flex items-center justify-center w-8 h-8 rounded hover:bg-[#232323] transition-colors"
                aria-label="More options"
              >
                <MoreVertical size={20} className="text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <TabMenu
          items={[
            { id: 'all', label: 'All Projects', count: projects.length },
            { id: 'active', label: 'Active', count: projects.filter(p => p.status === 'active').length },
            { id: 'on-hold', label: 'On Hold', count: projects.filter(p => p.status === 'on-hold').length },
            { id: 'completed', label: 'Completed', count: projects.filter(p => p.status === 'completed').length },
            { id: 'cancelled', label: 'Cancelled', count: projects.filter(p => p.status === 'cancelled').length }
          ]}
          activeItemId={selectedStatus}
          onItemClick={(id) => setSelectedStatus(id as 'all' | 'active' | 'on-hold' | 'completed' | 'cancelled')}
        />

      {loading ? (
        <TableSkeleton rows={5} columns={6} />
        ) : projects.length === 0 || showTutorial ? (
          // Contextual Onboarding for empty state
          <div className="max-w-4xl mx-auto p-8">
            {/* Welcome Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#336699] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏗️</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to Project Management</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Projects are where the real work happens. Track progress, manage budgets, and keep everything 
                organized from start to finish. Let's create your first project.
              </p>
            </div>

            {/* Video Section */}
            <div className="mb-8">
              <div className="bg-[#1E1E1E] rounded-[4px] p-6 border border-[#333333]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold flex items-center">
                    <span className="text-[#336699] mr-2">🎥</span>
                    Watch: Project Management Walkthrough
                  </h3>
                  <span className="text-xs text-gray-400 bg-[#333333] px-2 py-1 rounded">4 min</span>
                </div>
                
                {/* Video Embed Container */}
                <div className="relative w-full h-0 pb-[56.25%] bg-[#333333] rounded-[4px] overflow-hidden">
                  {/* Replace this iframe src with your actual Loom video URL */}
                  <iframe
                    src="https://www.loom.com/embed/0c9786a7fd61445bbb23b6415602afe4"
                    frameBorder="0"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full"
                    title="Project Management Walkthrough"
                  ></iframe>
                  
                  {/* Placeholder for when no video is set */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-[#336699] rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-white text-xl">▶</span>
                      </div>
                      <p className="text-gray-400 text-sm">Video coming soon</p>
                      <p className="text-gray-500 text-xs">Replace iframe src with your Loom URL</p>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm mt-3">
                  Watch me create a real project from start to finish and show you how to track 
                  progress, manage budgets, and keep everything organized.
                </p>
              </div>
            </div>

            {/* Quick Start Steps */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Step 1 */}
              <div className="bg-[#333333] rounded-[4px] p-6 border-l-4 border-[#336699]">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-[#336699] rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                    1
                  </div>
                  <h3 className="text-white font-bold">Create Your First Project</h3>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Set up a project with timeline, budget, and scope. This becomes your central hub for everything.
                </p>
                <button
                  onClick={() => navigate('/projects/new')}
                  className="w-full bg-[#336699] text-white py-2 px-4 rounded-[4px] hover:bg-[#2A5580] transition-colors font-medium"
                >
                  CREATE PROJECT
                </button>
              </div>

              {/* Step 2 */}
              <div className="bg-[#333333] rounded-[4px] p-6 border-l-4 border-[#9E9E9E] opacity-75">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-[#9E9E9E] rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                    2
                  </div>
                  <h3 className="text-gray-400 font-bold">Track Progress</h3>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Update project status, add photos, and keep clients informed with real-time progress.
                </p>
                <button
                  disabled
                  className="w-full bg-[#9E9E9E] text-gray-500 py-2 px-4 rounded-[4px] cursor-not-allowed font-medium"
                >
                  COMING NEXT
                </button>
              </div>

              {/* Step 3 */}
              <div className="bg-[#333333] rounded-[4px] p-6 border-l-4 border-[#9E9E9E] opacity-75">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-[#9E9E9E] rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                    3
                  </div>
                  <h3 className="text-gray-400 font-bold">Complete & Invoice</h3>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Mark projects complete and automatically generate invoices for final payment.
                </p>
                <button
                  disabled
                  className="w-full bg-[#9E9E9E] text-gray-500 py-2 px-4 rounded-[4px] cursor-not-allowed font-medium"
                >
                  COMING NEXT
                </button>
              </div>
            </div>

            {/* Tips Section */}
            <div className="bg-[#1E1E1E] rounded-[4px] p-6 border border-[#333333]">
              <h3 className="text-white font-bold mb-4 flex items-center">
                <span className="text-[#F9D71C] mr-2">💡</span>
                Pro Tips for Project Management
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-[#336699] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <p className="text-white text-sm font-medium">Set realistic timelines</p>
                      <p className="text-gray-400 text-xs">Add buffer time for permits, weather, and material delays</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-[#336699] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <p className="text-white text-sm font-medium">Track costs in real-time</p>
                      <p className="text-gray-400 text-xs">Update budgets as you go to avoid surprises</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-[#336699] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <p className="text-white text-sm font-medium">Document everything</p>
                      <p className="text-gray-400 text-xs">Photos and notes protect you and impress clients</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-[#336699] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <p className="text-white text-sm font-medium">Use project templates</p>
                      <p className="text-gray-400 text-xs">Save time by reusing successful project structures</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Types */}
            <div className="text-center mt-8">
              <p className="text-gray-400 text-sm mb-4">
                Popular project types to get you started:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {categories.slice(1, 6).map((category) => (
                  <button
                    key={category.id}
                    onClick={() => navigate('/projects/new')}
                    className="px-3 py-1 bg-[#333333] text-gray-300 rounded-[4px] text-sm hover:bg-[#404040] transition-colors"
                  >
                    {category.icon} {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {viewType === 'card' ? (
              // Card View
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProjects.map((project) => {
                  const progress = getProjectProgress(project.status);
                  const progressColorClass = project.status === 'completed' ? 'bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8]' :
                                            project.status === 'active' ? 'bg-gradient-to-r from-[#10b981] to-[#059669]' :
                                            project.status === 'on-hold' ? 'bg-gradient-to-r from-[#f59e0b] to-[#d97706]' :
                                            'bg-gray-600';
                  
                  return (
                    <div
                    key={project.id}
                      className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6 hover:transform hover:-translate-y-0.5 hover:shadow-2xl hover:border-[#555555] transition-all duration-300 cursor-pointer group"
                      onClick={() => navigate(`/projects/${project.id}`)}
                  >
                      {/* Card Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">
                            {project.name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Client Name</span>
                            <span>{project.status === 'completed' ? 'Completed' : 'Started'} {new Date(project.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusBadgeStyle(project.status)}`}>
                          {project.status.replace('-', ' ')}
                        </span>
                      </div>
                      
                      {/* Progress Section */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">
                            {project.status === 'active' ? 'Installation Phase' :
                             project.status === 'on-hold' ? 'Awaiting Permits' :
                             project.status === 'completed' ? 'Project Complete' :
                             'Not Started'}
                          </span>
                          <span className={`text-sm font-semibold ${getStatusColor(project.status).split(' ')[1]}`}>
                            {progress}%
                        </span>
                        </div>
                        <div className="w-full h-1.5 bg-[#333333] rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${progressColorClass}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xl font-semibold text-white">
                            {formatCurrency(project.budget)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {project.status === 'completed' ? 'Invoiced & paid' :
                             project.status === 'active' ? 'On budget' :
                             project.status === 'on-hold' ? 'Permit fees pending' :
                             'Not started'}
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle photos action
                            }}
                            className="px-3 py-1 text-xs rounded-md border border-[#444444] bg-[#222222] text-gray-400 hover:bg-[#333333] hover:text-white hover:border-[#555555] transition-all"
                          >
                            Photos
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle invoice action
                            }}
                            className="px-3 py-1 text-xs rounded-md border border-[#444444] bg-[#222222] text-gray-400 hover:bg-[#333333] hover:text-white hover:border-[#555555] transition-all"
                          >
                            Invoice
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle update action
                            }}
                            className="px-3 py-1 text-xs rounded-md border border-[#444444] bg-[#222222] text-gray-400 hover:bg-[#333333] hover:text-white hover:border-[#555555] transition-all"
                          >
                            Update
                          </button>
                        </div>
          </div>
        </div>
                  );
                })}
              </div>
            ) : (
              // Gantt Chart View
              <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6 overflow-x-auto">
                <GanttChart data={generateGanttData()} />
              </div>
            )}

            {/* Empty State for filtered results */}
            {filteredProjects.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-[#1a1a1a] rounded-lg flex items-center justify-center mb-4">
                  <FolderKanban className="w-8 h-8 text-[#666666]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No Projects Found</h3>
                <p className="text-gray-500 text-sm mb-6">No projects match your search or filters</p>
                <button 
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedStatus('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-[#336699] text-white rounded-lg font-medium hover:bg-[#2851A3] transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

// Gantt Chart Component
const GanttChart: React.FC<{ data: any }> = ({ data }) => {
  const { today, daysInMonth, currentMonth, currentYear, projects } = data;
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  // Generate array of days
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  return (
    <div>
      {/* Header */}
      <div className="grid grid-cols-[300px_1fr] mb-4 pb-4 border-b border-[#333333]">
        <div className="text-sm font-semibold text-gray-500 uppercase">Projects Timeline</div>
        <div className="grid grid-flow-col auto-cols-fr gap-px min-w-[800px]">
          {days.map(day => {
            const date = new Date(currentYear, currentMonth, day);
            const isToday = day === today;
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            
            return (
              <div 
                key={day} 
                className={`text-center text-xs px-1 py-2 border-l border-[#333333] ${
                  isToday ? 'bg-[#3b82f6]/10 text-[#3b82f6] font-semibold' : 
                  isWeekend ? 'bg-white/[0.02]' : ''
                } ${isToday ? 'relative' : ''}`}
              >
                {day}
                {isToday && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-[#3b82f6]"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Project Rows */}
      {projects.map((project: any) => (
        <div key={project.id} className="grid grid-cols-[300px_1fr] border-b border-[#333333] min-h-[60px] items-center">
          <div className="p-4">
            <div className="font-semibold text-sm text-white mb-1">{project.name}</div>
            <div className="text-xs text-gray-500">Client Name</div>
          </div>
          <div className="grid grid-flow-col auto-cols-fr gap-px min-w-[800px] relative py-2">
            {days.map(day => (
              <div key={day} className="h-10 border-l border-[#333333] relative">
                {day === today && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-[#3b82f6] z-10"></div>
                )}
              </div>
            ))}
            
            {/* Project Bar */}
            {project.startDay <= daysInMonth && (
              <div
                className={`absolute h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white cursor-pointer z-20 transition-all hover:transform hover:scale-[1.02] hover:shadow-lg ${
                  project.status === 'active' ? 'bg-gradient-to-r from-[#10b981] to-[#059669]' :
                  project.status === 'completed' ? 'bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8]' :
                  project.status === 'on-hold' ? 'bg-gradient-to-r from-[#f59e0b] to-[#d97706] opacity-70' :
                  'bg-gray-600'
                }`}
                style={{
                  left: `${((project.startDay - 1) / daysInMonth) * 100}%`,
                  width: `${((project.endDay - project.startDay + 1) / daysInMonth) * 100}%`,
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              >
                {project.progress}%
                {project.progress > 0 && project.progress < 100 && (
                  <div 
                    className="absolute left-0 top-0 h-full bg-white/20 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  />
                )}
              </div>
            )}
            
            {/* Milestone for completed projects */}
            {project.status === 'completed' && project.endDay <= daysInMonth && (
              <div
                className="absolute w-3 h-3 bg-[#fbbf24] border-2 border-[#0a0a0a] rounded-full z-30"
                style={{
                  left: `${((project.endDay - 0.5) / daysInMonth) * 100}%`,
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
                title="Project Completed"
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectList;
