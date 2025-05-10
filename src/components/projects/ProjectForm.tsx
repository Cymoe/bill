import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../lib/database';
import type { Tables } from '../../lib/database';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { supabase } from '../../lib/supabase';

type Client = Tables['clients'];
type ProjectFormData = Omit<Tables['projects'], 'id' | 'created_at' | 'updated_at'> & {
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  client_id: string;
  budget: number;
  start_date: string;
  end_date: string;
}

export const ProjectForm: React.FC = () => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'budget' ? parseFloat(value) : value
    }));
  };
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = React.useState(false);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [formData, setFormData] = React.useState<ProjectFormData>({
    name: '',
    description: '',
    status: 'active',
    client_id: '',
    budget: 0,
    start_date: '',
    end_date: '',
  });

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) {
          console.error('No authenticated user');
          return;
        }
        
        // Fetch clients list
        const clientsData = await db.clients.list(session.user.id);
        setClients(clientsData);

        // If editing, fetch project data
        if (id) {
          const projectData = await db.projects.getById(id);
          setFormData(projectData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await db.projects.update(id, formData);
      } else {
        await db.projects.create(formData);
      }
      navigate('/projects');
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h1 className="text-2xl font-medium text-white">
              {id ? 'Edit Project' : 'New Project'}
            </h1>
          </div>

          <div className="bg-[#1e2532] shadow px-4 py-5 rounded-lg sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-400">
                  Project Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full h-10 px-3 rounded-md border-0 bg-[#2a3441] text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                  <p className="mt-2 text-xs text-gray-400">Enter a descriptive name for your project</p>
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-400">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 rounded-md border-0 bg-[#2a3441] text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="mt-2 text-xs text-gray-400">Provide details about the project scope and objectives</p>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="client" className="block text-sm font-medium text-gray-400">
                  Client
                </label>
                <div className="mt-1">
                  <select
                    id="client_id"
                    name="client_id"
                    value={formData.client_id}
                    onChange={handleChange}
                    className="mt-1 block w-full h-10 px-3 rounded-md border-0 bg-[#2a3441] text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="" className="text-gray-900">Select a client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id} className="text-gray-900">
                        {client.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-gray-400">Select the client this project belongs to</p>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="status" className="block text-sm font-medium text-gray-400">
                  Status
                </label>
                <div className="mt-1">
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="mt-1 block w-full h-10 px-3 rounded-md border-0 bg-[#2a3441] text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="active" className="text-gray-900">Active</option>
                    <option value="completed" className="text-gray-900">Completed</option>
                    <option value="on-hold" className="text-gray-900">On Hold</option>
                    <option value="cancelled" className="text-gray-900">Cancelled</option>
                  </select>
                  <p className="mt-2 text-xs text-gray-400">Current status of the project</p>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="budget" className="block text-sm font-medium text-gray-400">
                  Budget
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="mt-1 block w-full h-10 px-3 rounded-md border-0 bg-[#2a3441] text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                  <p className="mt-2 text-xs text-gray-400">Total budget allocated for this project</p>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-400">
                  Start Date
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    className="mt-1 block w-full h-10 px-3 rounded-md border-0 bg-[#2a3441] text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                  <p className="mt-2 text-xs text-gray-400">When does the project begin?</p>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-400">
                  End Date
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    id="end_date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    className="mt-1 block w-full h-10 px-3 rounded-md border-0 bg-[#2a3441] text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                  <p className="mt-2 text-xs text-gray-400">Expected completion date</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/projects')}
              className="inline-flex items-center h-10 px-4 rounded-md text-sm font-medium text-white bg-[#1e2532] hover:bg-[#2a3441] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center h-10 px-4 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Saving...' : id ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default ProjectForm;
