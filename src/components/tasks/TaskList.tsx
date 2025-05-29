import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle2, Circle, Clock, AlertCircle, Calendar, Plus, Trash2 } from 'lucide-react';
import { formatDate } from '../../utils/format';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  completed_at?: string;
  created_at: string;
}

interface TaskListProps {
  projectId: string;
  categoryId?: string;
}

export const TaskList: React.FC<TaskListProps> = ({ projectId, categoryId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    due_date: ''
  });

  useEffect(() => {
    loadTasks();
  }, [projectId]);

  const loadTasks = async () => {
    try {
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

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const updates: any = { status: newStatus };
      if (newStatus === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;
      
      // Update local state
      setTasks(tasks.map(task => 
        task.id === taskId 
          ? { ...task, status: newStatus as any, completed_at: updates.completed_at } 
          : task
      ));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const addTask = async () => {
    if (!newTask.title.trim()) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          project_id: projectId,
          category_id: categoryId,
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          due_date: newTask.due_date || null,
          status: 'pending',
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      
      setTasks([...tasks, data]);
      setNewTask({ title: '', description: '', priority: 'medium', due_date: '' });
      setShowAddTask(false);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-[#388E3C]" />;
      case 'in-progress': return <Clock className="w-5 h-5 text-[#F9D71C]" />;
      case 'cancelled': return <Circle className="w-5 h-5 text-[#9E9E9E]" />;
      default: return <Circle className="w-5 h-5 text-[#9E9E9E]" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-[#D32F2F]';
      case 'medium': return 'text-[#F9D71C]';
      default: return 'text-[#9E9E9E]';
    }
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const overdue = tasks.filter(t => 
      t.status !== 'completed' && 
      t.due_date && 
      new Date(t.due_date) < new Date()
    ).length;

    return { total, completed, inProgress, pending, overdue };
  };

  const stats = getTaskStats();

  if (loading) {
    return <div className="text-gray-400">Loading tasks...</div>;
  }

  return (
    <div className="bg-[#333333] rounded p-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium mb-2">PROJECT TASKS</h3>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#388E3C]" />
              <span>{stats.completed} Complete</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#F9D71C]" />
              <span>{stats.inProgress} In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="w-4 h-4 text-[#9E9E9E]" />
              <span>{stats.pending} Pending</span>
            </div>
            {stats.overdue > 0 && (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#D32F2F]" />
                <span className="text-[#D32F2F]">{stats.overdue} Overdue</span>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowAddTask(true)}
          className="px-4 py-2 bg-[#336699] text-white rounded hover:bg-opacity-80 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          ADD TASK
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">COMPLETION</span>
          <span>{Math.round((stats.completed / stats.total) * 100)}%</span>
        </div>
        <div className="h-1 bg-gray-700 rounded">
          <div 
            className="h-full bg-[#336699] rounded transition-all duration-300"
            style={{ width: `${(stats.completed / stats.total) * 100}%` }}
          />
        </div>
      </div>

      {/* Add Task Form */}
      {showAddTask && (
        <div className="mb-6 p-4 bg-[#1E1E1E] rounded">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="px-3 py-2 bg-[#333333] border border-gray-600 rounded text-white placeholder-gray-500"
            />
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
              className="px-3 py-2 bg-[#333333] border border-gray-600 rounded text-white"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Description (optional)"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="px-3 py-2 bg-[#333333] border border-gray-600 rounded text-white placeholder-gray-500"
            />
            <input
              type="date"
              value={newTask.due_date}
              onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
              className="px-3 py-2 bg-[#333333] border border-gray-600 rounded text-white"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={addTask}
              className="px-4 py-2 bg-[#336699] text-white rounded hover:bg-opacity-80 transition-colors"
            >
              CREATE
            </button>
            <button
              onClick={() => {
                setShowAddTask(false);
                setNewTask({ title: '', description: '', priority: 'medium', due_date: '' });
              }}
              className="px-4 py-2 bg-transparent border border-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-2">
        {tasks.map(task => (
          <div 
            key={task.id} 
            className={`flex items-center gap-4 p-4 bg-[#1E1E1E] rounded hover:bg-opacity-80 transition-colors ${
              task.status === 'completed' ? 'opacity-60' : ''
            }`}
          >
            <button
              onClick={() => updateTaskStatus(
                task.id, 
                task.status === 'completed' ? 'pending' : 'completed'
              )}
              className="hover:scale-110 transition-transform"
            >
              {getStatusIcon(task.status)}
            </button>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className={`font-medium ${task.status === 'completed' ? 'line-through' : ''}`}>
                  {task.title}
                </h4>
                <span className={`text-xs uppercase font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
              {task.description && (
                <p className="text-sm text-gray-400 mt-1">{task.description}</p>
              )}
            </div>

            <div className="flex items-center gap-4">
              {task.due_date && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span className={
                    new Date(task.due_date) < new Date() && task.status !== 'completed'
                      ? 'text-[#D32F2F]' 
                      : ''
                  }>
                    {formatDate(task.due_date)}
                  </span>
                </div>
              )}
              
              <select
                value={task.status}
                onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                className="px-3 py-1 bg-[#333333] border border-gray-600 rounded text-sm"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <button
                onClick={() => deleteTask(task.id)}
                className="text-gray-400 hover:text-[#D32F2F] transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && !showAddTask && (
        <div className="text-center py-8 text-gray-400">
          <p className="mb-4">No tasks yet</p>
          <button
            onClick={() => setShowAddTask(true)}
            className="px-4 py-2 bg-[#336699] text-white rounded hover:bg-opacity-80 transition-colors"
          >
            ADD FIRST TASK
          </button>
        </div>
      )}
    </div>
  );
}; 