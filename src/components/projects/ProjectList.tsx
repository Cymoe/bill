import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MoreVertical, LayoutGrid, List, Calendar, DollarSign, Briefcase, FolderKanban, MapPin, User, CheckCircle, Search, Plus, ChevronDown, Filter } from 'lucide-react';
import { db } from '../../lib/database';
import type { Tables } from '../../lib/database';
import { PageHeader } from '../common/PageHeader';
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
  const [searchInput, setSearchInput] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'on-hold' | 'completed' | 'cancelled'>('all');
  
  // Additional filter states
  const [dateRange, setDateRange] = useState<'all' | '7d' | '30d' | '90d'>('all');
  const [budgetRange, setBudgetRange] = useState<'all' | 'under-10k' | '10k-50k' | '50k-100k' | 'over-100k'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'budget' | 'status'>('date');
  
  // Load view preference from localStorage - default to 'list'
  const [viewType, setViewType] = useState<'list' | 'gantt'>('list');
  
  // Dropdown state management
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const moreFiltersRef = useRef<HTMLDivElement>(null);

  // Save view preference when it changes
  useEffect(() => {
    localStorage.setItem('projectsViewType', viewType);
  }, [viewType]);

  // Close dropdown menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      
      // Check if click is outside all dropdown menus
      const isOutsideDropdown = Object.values(dropdownRefs.current).every(ref => 
        !ref || !ref.contains(target)
      );
      
      if (isOutsideDropdown && openDropdownId) {
        setOpenDropdownId(null);
      }

      // Check if click is outside more filters dropdown
      if (moreFiltersRef.current && !moreFiltersRef.current.contains(target) && showMoreFilters) {
        setShowMoreFilters(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdownId, showMoreFilters]);

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

  // Sync search input with search query
  useEffect(() => {
    const handler = setTimeout(() => setSearchQuery(searchInput), 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Filter projects by category, status, search, date, and budget
  const filteredProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
      const matchesSearch = searchQuery === '' || 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Date range filter
      let matchesDate = true;
      if (dateRange !== 'all') {
        const projectDate = new Date(project.start_date);
        const now = new Date();
        const daysAgo = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
        const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
        matchesDate = projectDate >= cutoffDate;
      }
      
      // Budget range filter
      let matchesBudget = true;
      if (budgetRange !== 'all') {
        const budget = project.budget;
        switch (budgetRange) {
          case 'under-10k':
            matchesBudget = budget < 10000;
            break;
          case '10k-50k':
            matchesBudget = budget >= 10000 && budget < 50000;
            break;
          case '50k-100k':
            matchesBudget = budget >= 50000 && budget < 100000;
            break;
          case 'over-100k':
            matchesBudget = budget >= 100000;
            break;
        }
      }
      
      return matchesCategory && matchesStatus && matchesSearch && matchesDate && matchesBudget;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'budget':
          return b.budget - a.budget;
        case 'status':
          return a.status.localeCompare(b.status);
        case 'date':
        default:
          return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
      }
    });

    return filtered;
  }, [projects, selectedCategory, selectedStatus, searchQuery, dateRange, budgetRange, sortBy]);

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
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <div className="border-b border-[#333333]">
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Projects</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-64 bg-[#1E1E1E] border border-[#333333] rounded-[4px] px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:border-[#336699]"
              />
            </div>
            <button
              onClick={() => navigate('/projects/new')}
              className="w-10 h-10 bg-[#F9D71C] hover:bg-[#e9c91c] text-[#121212] rounded-full flex items-center justify-center transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Stats Bar */}
        <div className="px-6 py-3 border-b border-[#333333] bg-[#1A1A1A] flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Projects:</span>
            <span className="font-mono font-medium">{projects.length}</span>
            <span className="text-gray-500 text-xs">({formatCurrency(totalBudget)})</span>
          </div>
          <div className="w-px h-4 bg-[#333333]" />
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Active:</span>
            <span className="font-medium text-[#10b981]">{activeProjects.length}</span>
            <span className="text-gray-500 text-xs">({Math.round((activeProjects.length / projects.length) * 100) || 0}%)</span>
          </div>
          <div className="w-px h-4 bg-[#333333]" />
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Avg Budget:</span>
            <span className="font-mono font-medium text-[#336699]">{formatCurrency(projects.length > 0 ? totalBudget / projects.length : 0)}</span>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="px-6 py-3 border-b border-[#333333] bg-[#1A1A1A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                className="bg-[#1E1E1E] border border-[#333333] rounded-[4px] px-3 py-2 text-sm font-medium text-white min-w-[180px] hover:bg-[#252525] transition-colors appearance-none cursor-pointer"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'active' | 'on-hold' | 'completed' | 'cancelled')}
              >
                <option value="all">All Statuses ({projects.length})</option>
                <option value="active">Active ({projects.filter(p => p.status === 'active').length})</option>
                <option value="on-hold">On Hold ({projects.filter(p => p.status === 'on-hold').length})</option>
                <option value="completed">Completed ({projects.filter(p => p.status === 'completed').length})</option>
                <option value="cancelled">Cancelled ({projects.filter(p => p.status === 'cancelled').length})</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                className="bg-[#1E1E1E] border border-[#333333] rounded-[4px] px-3 py-2 text-sm font-medium text-white min-w-[180px] hover:bg-[#252525] transition-colors appearance-none cursor-pointer"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => {
                  const count = getCategoryCount(category.id);
                  return (
                    <option key={category.id} value={category.id}>
                      {category.name} ({count})
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative" ref={moreFiltersRef}>
              <button 
                onClick={() => setShowMoreFilters(!showMoreFilters)}
                className={`bg-[#1E1E1E] border border-[#333333] rounded-[4px] px-3 py-2 text-sm font-medium flex items-center gap-2 hover:bg-[#252525] transition-colors ${
                  showMoreFilters ? 'bg-[#252525]' : ''
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>More Filters</span>
              </button>
              
              {/* More Filters Dropdown */}
              {showMoreFilters && (
                <div className="absolute top-full left-0 mt-1 w-80 bg-[#1E1E1E] border border-[#333333] rounded-[4px] shadow-lg z-50 p-4">
                  <div className="space-y-4">
                    {/* Date Range Filter */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                        Date Range
                      </label>
                      <select
                        className="w-full bg-[#333333] border border-[#555555] rounded-[4px] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value as 'all' | '7d' | '30d' | '90d')}
                      >
                        <option value="all">All Time</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                      </select>
                    </div>

                    {/* Budget Range Filter */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                        Budget Range
                      </label>
                      <select
                        className="w-full bg-[#333333] border border-[#555555] rounded-[4px] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
                        value={budgetRange}
                        onChange={(e) => setBudgetRange(e.target.value as 'all' | 'under-10k' | '10k-50k' | '50k-100k' | 'over-100k')}
                      >
                        <option value="all">All Budgets</option>
                        <option value="under-10k">Under $10,000</option>
                        <option value="10k-50k">$10,000 - $50,000</option>
                        <option value="50k-100k">$50,000 - $100,000</option>
                        <option value="over-100k">Over $100,000</option>
                      </select>
                    </div>

                    {/* Sort By */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                        Sort By
                      </label>
                      <select
                        className="w-full bg-[#333333] border border-[#555555] rounded-[4px] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'budget' | 'status')}
                      >
                        <option value="date">Date Created (Newest)</option>
                        <option value="name">Project Name (A-Z)</option>
                        <option value="budget">Budget (Highest)</option>
                        <option value="status">Status</option>
                      </select>
                    </div>

                    {/* Clear Filters */}
                    <div className="pt-2 border-t border-[#333333]">
                      <button
                        onClick={() => {
                          setDateRange('all');
                          setBudgetRange('all');
                          setSortBy('date');
                          setSelectedCategory('all');
                          setSelectedStatus('all');
                          setSearchInput('');
                          setSearchQuery('');
                        }}
                        className="w-full bg-[#333333] hover:bg-[#404040] text-white py-2 px-3 rounded-[4px] text-sm font-medium transition-colors"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-[#1E1E1E] border border-[#333333] rounded-[4px] overflow-hidden">
              <button
                className={`px-3 py-2 text-sm font-medium flex items-center gap-2 transition-colors ${
                  viewType === 'list' ? 'bg-[#336699] text-white' : 'text-gray-400 hover:bg-[#252525]'
                }`}
                onClick={() => setViewType('list')}
              >
                <List className="w-4 h-4" />
                List
              </button>
              <button
                className={`px-3 py-2 text-sm font-medium flex items-center gap-2 transition-colors ${
                  viewType === 'gantt' ? 'bg-[#336699] text-white' : 'text-gray-400 hover:bg-[#252525]'
                }`}
                onClick={() => setViewType('gantt')}
              >
                <Calendar className="w-4 h-4" />
                Gantt
              </button>
            </div>
            <button className="bg-[#1E1E1E] border border-[#333333] rounded-[4px] w-8 h-8 flex items-center justify-center hover:bg-[#252525] transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="pb-8">

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
            {viewType === 'list' ? (
              // List View - Mimics the sidebar projects list
              <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl overflow-hidden">
                <div className="space-y-0">
                  {filteredProjects.map((project, index) => {
                    const progress = getProjectProgress(project.status);
                    return (
                      <div key={project.id} className="relative">
                        <button
                          onClick={() => navigate(`/projects/${project.id}`)}
                          className={`w-full text-left p-4 hover:bg-[#333333] transition-colors border-b border-gray-700/30 group ${index === filteredProjects.length - 1 ? 'border-b-0' : ''}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center mb-1">
                                <div className={`w-2 h-2 rounded-full mr-3 flex-shrink-0 ${
                                  project.status === 'completed' ? 'bg-green-500' :
                                  project.status === 'active' ? 'bg-green-500' :
                                  project.status === 'on-hold' ? 'bg-yellow-500' :
                                  'bg-gray-500'
                                }`}></div>
                                <span className="text-white text-sm font-medium truncate leading-tight">{project.name}</span>
                                <span className={`ml-3 px-2 py-0.5 rounded text-xs font-medium ${getStatusBadgeStyle(project.status)}`}>
                                  {project.status.replace('-', ' ').toUpperCase()}
                                </span>
                              </div>
                              <div className="flex items-center text-gray-400 text-xs ml-5 space-x-4">
                                <span className="uppercase tracking-wide">Client Name</span>
                                <span>{formatCurrency(project.budget)}</span>
                                <span>{new Date(project.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[#6b7280] text-sm font-medium leading-tight">{progress}%</span>
                              
                              {/* Action buttons - only show on hover */}
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-2">
                                <div className="relative">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const dropdownId = `project-${project.id}`;
                                      setOpenDropdownId(openDropdownId === dropdownId ? null : dropdownId);
                                    }}
                                    className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#336699] transition-colors"
                                    title="More options"
                                  >
                                    <svg className="w-4 h-4 text-gray-400 hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                    </svg>
                                  </button>
                                  
                                  {/* Dropdown Menu */}
                                  {openDropdownId === `project-${project.id}` && (
                                    <div 
                                      ref={(el) => dropdownRefs.current[`project-${project.id}`] = el}
                                      className="absolute right-0 top-full mt-1 w-48 bg-[#2A2A2A] border border-[#404040] rounded-[4px] shadow-lg z-[10001] py-1"
                                    >
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/projects/${project.id}/edit`);
                                          setOpenDropdownId(null);
                                        }}
                                        className="w-full text-left px-3 py-2 text-white text-xs hover:bg-[#336699] transition-colors flex items-center"
                                      >
                                        <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit Project
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          console.log(`Add note to ${project.name}`);
                                          setOpenDropdownId(null);
                                        }}
                                        className="w-full text-left px-3 py-2 text-white text-xs hover:bg-[#336699] transition-colors flex items-center"
                                      >
                                        <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add Note
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          console.log(`View timeline for ${project.name}`);
                                          setOpenDropdownId(null);
                                        }}
                                        className="w-full text-left px-3 py-2 text-white text-xs hover:bg-[#336699] transition-colors flex items-center"
                                      >
                                        <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        View Timeline
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          console.log(`View photos for ${project.name}`);
                                          setOpenDropdownId(null);
                                        }}
                                        className="w-full text-left px-3 py-2 text-white text-xs hover:bg-[#336699] transition-colors flex items-center"
                                      >
                                        <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                        View Photos
                                      </button>
                                      <div className="border-t border-[#404040] my-1"></div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          console.log(`Create invoice for ${project.name}`);
                                          setOpenDropdownId(null);
                                        }}
                                        className="w-full text-left px-3 py-2 text-white text-xs hover:bg-[#336699] transition-colors flex items-center"
                                      >
                                        <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Create Invoice
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          console.log(`Generate estimate for ${project.name}`);
                                          setOpenDropdownId(null);
                                        }}
                                        className="w-full text-left px-3 py-2 text-white text-xs hover:bg-[#336699] transition-colors flex items-center"
                                      >
                                        <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                        Generate Estimate
                                      </button>
                                      <div className="border-t border-[#404040] my-1"></div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          console.log(`Mark ${project.name} as complete`);
                                          setOpenDropdownId(null);
                                        }}
                                        className="w-full text-left px-3 py-2 text-green-400 text-xs hover:bg-[#336699] transition-colors flex items-center"
                                      >
                                        <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        Mark Complete
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          console.log(`Archive ${project.name}`);
                                          setOpenDropdownId(null);
                                        }}
                                        className="w-full text-left px-3 py-2 text-yellow-400 text-xs hover:bg-[#336699] transition-colors flex items-center"
                                      >
                                        <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8l6 6 6-6" />
                                        </svg>
                                        Archive Project
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                  
                  {filteredProjects.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-sm">No projects found</div>
                      <div className="text-gray-500 text-xs mt-1">Try adjusting your search or filters</div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Gantt Chart View
              <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6 overflow-x-auto">
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg mb-2">Gantt Chart View</div>
                  <div className="text-gray-500 text-sm">Coming soon...</div>
                </div>
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
    </div>
  );
};

export default ProjectList;
