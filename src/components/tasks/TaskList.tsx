import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Calendar, ChevronDown, ChevronRight } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  project_id: string;
  category?: string;
  assigned_to?: string;
  created_at: string;
  completed_at?: string | null;
}

interface TaskListProps {
  projectId: string;
  categoryId?: string;
  onTaskUpdate?: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({ projectId, categoryId, onTaskUpdate }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    overdue: true,
    today: true,
    upcoming: true,
    noDate: true
  });
  const [isCreating, setIsCreating] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadTasks();
    }
  }, [projectId]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', taskId);

      if (error) throw error;
      
      // Update local state
      setTasks(tasks.map(task => 
        task.id === taskId 
          ? { ...task, status: newStatus, completed_at: newStatus === 'completed' ? new Date().toISOString() : null }
          : task
      ));
      
      // Notify parent component
      if (onTaskUpdate) {
        onTaskUpdate();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const getCategoryColor = (category?: string) => {
    const colors: Record<string, string> = {
      'electrical': '#3b82f6',
      'plumbing': '#10b981',
      'framing': '#f59e0b',
      'drywall': '#8b5cf6',
      'painting': '#ec4899',
      'flooring': '#f97316',
      'roofing': '#06b6d4',
      'hvac': '#84cc16'
    };
    return colors[category?.toLowerCase() || ''] || '#6b7280';
  };

  const groupTasksByDate = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const groups = {
      overdue: [] as Task[],
      today: [] as Task[],
      upcoming: [] as Task[],
      noDate: [] as Task[],
      completed: [] as Task[]
    };

    tasks.forEach(task => {
      if (task.status === 'completed') {
        groups.completed.push(task);
      } else if (!task.due_date) {
        groups.noDate.push(task);
      } else {
        const dueDate = new Date(task.due_date);
        if (dueDate < now) {
          groups.overdue.push(task);
        } else if (dueDate <= todayEnd) {
          groups.today.push(task);
        } else {
          groups.upcoming.push(task);
        }
      }
    });

    return groups;
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatDueDate = (date: string) => {
    const dueDate = new Date(date);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < -1) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
    
    return dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const createTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: newTaskTitle,
          project_id: projectId,
          category_id: categoryId,
          status: 'pending',
          priority: 'medium',
          due_date: newTaskDate || null,
          category: newTaskCategory || null,
          user_id: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      setTasks([...tasks, data]);
      
      // Reset form
      setNewTaskTitle('');
      setNewTaskDate('');
      setNewTaskCategory('');
      setIsCreating(false);
      setShowDatePicker(false);

      if (onTaskUpdate) {
        onTaskUpdate();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      createTask();
    }
    if (e.key === 'Escape') {
      setIsCreating(false);
      setNewTaskTitle('');
      setNewTaskDate('');
      setNewTaskCategory('');
      setShowDatePicker(false);
    }
  };

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const setQuickDate = (option: string) => {
    const today = new Date();
    let targetDate = new Date();

    switch (option) {
      case 'today':
        targetDate = today;
        break;
      case 'tomorrow':
        targetDate.setDate(today.getDate() + 1);
        break;
      case 'nextWeek':
        targetDate.setDate(today.getDate() + 7);
        break;
    }

    setNewTaskDate(formatDateForInput(targetDate));
    setShowDatePicker(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const groupedTasks = groupTasksByDate();
  const incompleteTasks = tasks.filter(t => t.status !== 'completed').length;
  const completedTaskCount = tasks.filter(t => t.status === 'completed').length;
  const overdueTasks = groupedTasks.overdue.length;
  const todayTasks = groupedTasks.today.length;
  const completionRate = tasks.length > 0 ? Math.round((completedTaskCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* KPI Header Strip */}
      <div className="pb-6 mb-6 border-b border-[#2a2a2a]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Total Tasks */}
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Total Tasks</div>
            <div className="text-2xl font-semibold">{tasks.length}</div>
            <div className="text-sm text-gray-500 mt-1">({incompleteTasks} active)</div>
          </div>

          {/* Completed */}
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Completed</div>
            <div className="text-2xl font-semibold text-green-500">{completedTaskCount}</div>
            <div className="text-sm text-gray-500 mt-1">({completionRate}% done)</div>
          </div>

          {/* Overdue */}
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Overdue</div>
            <div className="text-2xl font-semibold text-red-500">{overdueTasks}</div>
            <div className="text-sm text-gray-500 mt-1">(needs attention)</div>
          </div>

          {/* Due Today */}
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Due Today</div>
            <div className="text-2xl font-semibold text-yellow-500">{todayTasks}</div>
            <div className="text-sm text-gray-500 mt-1">(to complete)</div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button className="text-sm text-gray-500 hover:text-gray-400">
            ○ all tasks <ChevronDown className="inline w-3 h-3 ml-1" />
          </button>
          <button className="text-sm text-gray-500 hover:text-gray-400">
            list | calendar
          </button>
        </div>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="p-2 hover:bg-[#2a2a2a] rounded transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Task Creation Form */}
      {isCreating && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-5 h-5 rounded-full border-2 border-gray-600"></div>
            
            <div className="flex-1">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="What needs to be done?"
                className="w-full bg-transparent text-white placeholder-gray-500 outline-none text-sm"
                autoFocus
              />
              
              <div className="flex items-center gap-4 mt-2">
                <div className="relative">
                  <button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-400"
                  >
                    <Calendar className="w-3 h-3" />
                    {newTaskDate ? new Date(newTaskDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Set due date'}
                  </button>
                  
                  {showDatePicker && (
                    <div className="absolute top-full mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-2 z-10">
                      <div className="space-y-1">
                        <button
                          onClick={() => setQuickDate('today')}
                          className="block w-full text-left px-3 py-2 text-xs text-gray-400 hover:bg-[#2a2a2a] rounded"
                        >
                          Today
                        </button>
                        <button
                          onClick={() => setQuickDate('tomorrow')}
                          className="block w-full text-left px-3 py-2 text-xs text-gray-400 hover:bg-[#2a2a2a] rounded"
                        >
                          Tomorrow
                        </button>
                        <button
                          onClick={() => setQuickDate('nextWeek')}
                          className="block w-full text-left px-3 py-2 text-xs text-gray-400 hover:bg-[#2a2a2a] rounded"
                        >
                          Next week
                        </button>
                        <div className="border-t border-[#2a2a2a] my-1"></div>
                        <input
                          type="date"
                          value={newTaskDate}
                          onChange={(e) => {
                            setNewTaskDate(e.target.value);
                            setShowDatePicker(false);
                          }}
                          className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#3a3a3a] rounded text-xs text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <select
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value)}
                  className="text-xs bg-transparent text-gray-500 hover:text-gray-400 outline-none cursor-pointer"
                >
                  <option value="">No category</option>
                  <option value="electrical">Electrical</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="framing">Framing</option>
                  <option value="drywall">Drywall</option>
                  <option value="painting">Painting</option>
                  <option value="flooring">Flooring</option>
                  <option value="roofing">Roofing</option>
                  <option value="hvac">HVAC</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={createTask}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewTaskTitle('');
                  setNewTaskDate('');
                  setNewTaskCategory('');
                  setShowDatePicker(false);
                }}
                className="px-3 py-1 text-gray-500 hover:text-gray-400 text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Groups */}
      <div className="space-y-6">
        {/* Overdue Tasks */}
        {groupedTasks.overdue.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection('overdue')}
              className="flex items-center gap-2 text-sm text-red-500 mb-3"
            >
              {expandedSections.overdue ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              overdue ({groupedTasks.overdue.length})
            </button>
            {expandedSections.overdue && (
              <div className="space-y-2">
                {groupedTasks.overdue.map(task => (
                  <TaskItem key={task.id} task={task} onToggle={toggleTaskStatus} formatDate={formatDueDate} getCategoryColor={getCategoryColor} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Today's Tasks */}
        {groupedTasks.today.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection('today')}
              className="flex items-center gap-2 text-sm text-gray-400 mb-3"
            >
              {expandedSections.today ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              today
            </button>
            {expandedSections.today && (
              <div className="space-y-2">
                {groupedTasks.today.map(task => (
                  <TaskItem key={task.id} task={task} onToggle={toggleTaskStatus} formatDate={formatDueDate} getCategoryColor={getCategoryColor} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Upcoming Tasks */}
        {groupedTasks.upcoming.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection('upcoming')}
              className="flex items-center gap-2 text-sm text-gray-400 mb-3"
            >
              {expandedSections.upcoming ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              upcoming
            </button>
            {expandedSections.upcoming && (
              <div className="space-y-2">
                {groupedTasks.upcoming.map(task => (
                  <TaskItem key={task.id} task={task} onToggle={toggleTaskStatus} formatDate={formatDueDate} getCategoryColor={getCategoryColor} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* No Due Date */}
        {groupedTasks.noDate.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection('noDate')}
              className="flex items-center gap-2 text-sm text-gray-400 mb-3"
            >
              {expandedSections.noDate ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              no due date
            </button>
            {expandedSections.noDate && (
              <div className="space-y-2">
                {groupedTasks.noDate.map(task => (
                  <TaskItem key={task.id} task={task} onToggle={toggleTaskStatus} formatDate={formatDueDate} getCategoryColor={getCategoryColor} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Completed Tasks */}
        {groupedTasks.completed.length > 0 && (
          <div className="mt-8 pt-8 border-t border-[#2a2a2a]">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center gap-2 text-sm text-gray-500 mb-3"
            >
              {showCompleted ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              completed tasks ({groupedTasks.completed.length})
            </button>
            {showCompleted && (
              <div className="space-y-2 opacity-50">
                {groupedTasks.completed.map(task => (
                  <TaskItem key={task.id} task={task} onToggle={toggleTaskStatus} formatDate={formatDueDate} getCategoryColor={getCategoryColor} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No tasks yet</p>
          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm transition-colors">
            Create First Task
          </button>
        </div>
      )}
    </div>
  );
};

// Task Item Component
const TaskItem: React.FC<{
  task: Task;
  onToggle: (id: string, status: string) => void;
  formatDate: (date: string) => string;
  getCategoryColor: (category?: string) => string;
}> = ({ task, onToggle, formatDate, getCategoryColor }) => {
  const isCompleted = task.status === 'completed';
  
  return (
    <div className="flex items-start gap-3 group hover:bg-[#0a0a0a] p-2 -mx-2 rounded transition-colors">
      <button
        onClick={() => onToggle(task.id, task.status)}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
          isCompleted
            ? 'bg-blue-500 border-blue-500'
            : 'border-gray-600 hover:border-gray-400'
        }`}
      >
        {isCompleted && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <span className={`text-sm ${isCompleted ? 'line-through text-gray-500' : 'text-white'}`}>
            {task.title}
          </span>
          {task.priority === 'high' && !isCompleted && (
            <span className="text-xs text-red-500">!</span>
          )}
        </div>
        
        {(task.due_date || task.category) && (
          <div className="flex items-center gap-3 mt-1">
            {task.due_date && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(task.due_date)}
              </span>
            )}
            {task.category && (
              <span 
                className="text-xs px-2 py-0.5 rounded"
                style={{ 
                  backgroundColor: `${getCategoryColor(task.category)}20`,
                  color: getCategoryColor(task.category)
                }}
              >
                {task.category}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 